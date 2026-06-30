import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { sql } from "drizzle-orm";

const router: IRouter = Router();

router.post("/reset-workspace", async (req, res) => {
  try {
    await db.execute(sql`
      BEGIN;
      TRUNCATE learners, programs, pathways, funding_sources, success_stories RESTART IDENTITY CASCADE;
      COMMIT;
    `);
    res.json({ success: true });
  } catch (error) {
    console.error("Error resetting workspace:", error);
    await db.execute(sql`ROLLBACK`);
    res.status(500).json({ error: "Failed to reset workspace" });
  }
});

export default router;
