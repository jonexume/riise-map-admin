import { Router, type IRouter } from "express";
import { db, successStoriesTable, insertSuccessStorySchema } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/success-stories", async (req, res) => {
  try {
    const stories = await db.select().from(successStoriesTable).orderBy(successStoriesTable.createdAt);
    res.json(stories);
  } catch (error) {
    console.error("Error fetching success stories:", error);
    res.status(500).json({ error: "Failed to fetch success stories" });
  }
});

router.post("/success-stories", async (req, res) => {
  try {
    const data = insertSuccessStorySchema.parse(req.body);
    const [created] = await db.insert(successStoriesTable).values(data).returning();
    res.status(201).json(created);
  } catch (error) {
    console.error("Error creating success story:", error);
    res.status(400).json({ error: "Invalid data" });
  }
});

router.delete("/success-stories/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [deleted] = await db.delete(successStoriesTable).where(eq(successStoriesTable.id, id)).returning();
    if (!deleted) { res.status(404).json({ error: "Story not found" }); return; }
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting success story:", error);
    res.status(500).json({ error: "Failed to delete story" });
  }
});

export default router;
