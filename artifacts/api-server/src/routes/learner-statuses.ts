import { Router, type IRouter } from "express";
import { db, learnerStatusesTable } from "@workspace/db";
import { asc } from "drizzle-orm";

const router: IRouter = Router();

router.get("/learner-statuses", async (req, res) => {
  try {
    const statuses = await db.select().from(learnerStatusesTable).orderBy(asc(learnerStatusesTable.sortOrder));
    res.json(statuses);
  } catch (error) {
    console.error("Error fetching learner statuses:", error);
    res.status(500).json({ error: "Failed to fetch learner statuses" });
  }
});

export default router;
