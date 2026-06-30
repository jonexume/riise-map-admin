import { Router, type IRouter } from "express";
import { db, learnersTable, fundingSourcesTable, fundingSourceGoalsTable } from "@workspace/db";
import { eq, lt, gt, and, sql } from "drizzle-orm";

const router: IRouter = Router();

function getOrgId(req: any): number | null {
  return req.dbUser?.orgId ?? null;
}

router.get("/dashboard-priorities", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const priorities: { text: string; href: string; urgency: string }[] = [];

    // Learners flagged for support
    const flaggedWhere = orgId
      ? and(eq(learnersTable.flaggedForSupport, true), eq(learnersTable.orgId, orgId))
      : eq(learnersTable.flaggedForSupport, true);
    const flagged = await db.select({ count: sql<number>`count(*)` }).from(learnersTable).where(flaggedWhere);
    const flaggedCount = Number(flagged[0].count);
    if (flaggedCount > 0) {
      priorities.push({ text: `${flaggedCount} learner${flaggedCount > 1 ? "s" : ""} flagged for support`, href: "/learners?sort=status&dir=asc", urgency: "high" });
    }

    // Learners with low readiness (<25)
    const lowWhere = orgId
      ? and(lt(learnersTable.readiness, 25), eq(learnersTable.orgId, orgId))
      : lt(learnersTable.readiness, 25);
    const lowReadiness = await db.select({ count: sql<number>`count(*)` }).from(learnersTable).where(lowWhere);
    const lowCount = Number(lowReadiness[0].count);
    if (lowCount > 0) {
      priorities.push({ text: `${lowCount} learner${lowCount > 1 ? "s" : ""} with low readiness scores`, href: "/learners?sort=readiness&dir=asc", urgency: "medium" });
    }

    // Funding sources expiring within 30 days
    const now = new Date();
    const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const expiringWhere = orgId
      ? and(gt(fundingSourcesTable.endDate, now.toISOString().split("T")[0]), lt(fundingSourcesTable.endDate, thirtyDays.toISOString().split("T")[0]), eq(fundingSourcesTable.orgId, orgId))
      : and(gt(fundingSourcesTable.endDate, now.toISOString().split("T")[0]), lt(fundingSourcesTable.endDate, thirtyDays.toISOString().split("T")[0]));
    const expiring = await db.select({ name: fundingSourcesTable.name }).from(fundingSourcesTable).where(expiringWhere);
    for (const fs of expiring) {
      priorities.push({ text: `${fs.name} grant period ending soon`, href: "/impact?status=expiring_soon", urgency: "high" });
    }

    // Funding goals not started (join through funding_sources for org scoping)
    const notStarted = orgId
      ? await db.select({ count: sql<number>`count(*)` }).from(fundingSourceGoalsTable)
          .innerJoin(fundingSourcesTable, eq(fundingSourceGoalsTable.fundingSourceId, fundingSourcesTable.id))
          .where(and(eq(fundingSourceGoalsTable.status, "not_started"), eq(fundingSourcesTable.orgId, orgId)))
      : await db.select({ count: sql<number>`count(*)` }).from(fundingSourceGoalsTable).where(eq(fundingSourceGoalsTable.status, "not_started"));
    const nsCount = Number(notStarted[0].count);
    if (nsCount > 0) {
      priorities.push({ text: `${nsCount} funding goal${nsCount > 1 ? "s" : ""} not yet started`, href: "/impact?status=not_started", urgency: "medium" });
    }

    // Learners with zero progress
    const npWhere = orgId
      ? and(eq(learnersTable.progress, 0), eq(learnersTable.orgId, orgId))
      : eq(learnersTable.progress, 0);
    const noProgress = await db.select({ count: sql<number>`count(*)` }).from(learnersTable).where(npWhere);
    const npCount = Number(noProgress[0].count);
    if (npCount > 0) {
      priorities.push({ text: `${npCount} learner${npCount > 1 ? "s" : ""} with no progress recorded`, href: "/learners?sort=progress&dir=asc", urgency: "low" });
    }

    res.json(priorities);
  } catch (error) {
    console.error("Error computing priorities:", error);
    res.status(500).json({ error: "Failed to compute priorities" });
  }
});

export default router;
