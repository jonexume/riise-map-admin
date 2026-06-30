import { Router, type IRouter } from "express";
import { db, auditLogTable } from "@workspace/db";
import { desc } from "drizzle-orm";
import type { Request } from "express";

const router: IRouter = Router();

export async function logAudit(req: Request, action: string, entityType: string, entityId?: number, entityName?: string, details?: string) {
  const userEmail = (req as any).user?.email || "unknown";
  console.log("AUDIT:", action, entityType, entityId, entityName, userEmail);
  try {
    await db.insert(auditLogTable).values({ action, entityType, entityId: entityId ?? null, entityName: entityName ?? null, userEmail, details: details ?? null });
    console.log("AUDIT: logged successfully");
  } catch (e) {
    console.error("Audit log failed:", e);
  }
}

router.get("/audit-log", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const logs = await db.select().from(auditLogTable).orderBy(desc(auditLogTable.createdAt)).limit(limit);
    res.json(logs);
  } catch (error) {
    console.error("Error fetching audit log:", error);
    res.status(500).json({ error: "Failed to fetch audit log" });
  }
});

export default router;
