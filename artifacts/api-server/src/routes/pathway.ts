import { Router, type IRouter } from "express";
import { db, pathwaysTable, insertPathwaySchema, learnersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

// Get all pathways
router.get("/pathways", async (req, res) => {
  try {
    const pathways = await db.select().from(pathwaysTable);
    res.json(pathways);
  } catch (error) {
    console.error("Error fetching pathways:", error);
    res.status(500).json({ error: "Failed to fetch pathways" });
  }
});

// Get single pathway
router.get("/pathways/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const pathway = await db.select().from(pathwaysTable).where(eq(pathwaysTable.id, id));
    if (pathway.length === 0) {
      res.status(404).json({ error: "Pathway not found" });
      return;
    }
    res.json(pathway[0]);
  } catch (error) {
    console.error("Error fetching pathway:", error);
    res.status(500).json({ error: "Failed to fetch pathway" });
  }
});

// Create pathway
router.post("/pathways", async (req, res) => {
  try {
    const data = insertPathwaySchema.parse(req.body);
    const [newPathway] = await db.insert(pathwaysTable).values(data).returning();
    res.status(201).json(newPathway);
  } catch (error) {
    console.error("Error creating pathway:", error);
    res.status(400).json({ error: "Invalid data" });
  }
});

// Update pathway
router.put("/pathways/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = insertPathwaySchema.partial().parse(req.body);
    const [updatedPathway] = await db.update(pathwaysTable).set(data).where(eq(pathwaysTable.id, id)).returning();
    if (!updatedPathway) {
      res.status(404).json({ error: "Pathway not found" });
      return;
    }
    res.json(updatedPathway);
  } catch (error) {
    console.error("Error updating pathway:", error);
    res.status(400).json({ error: "Invalid data" });
  }
});

// Delete pathway
router.delete("/pathways/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [deleted] = await db.delete(pathwaysTable).where(eq(pathwaysTable.id, id)).returning();
    if (!deleted) {
      res.status(404).json({ error: "Pathway not found" });
      return;
    }
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error deleting pathway:", error);
    res.status(500).json({ error: "Failed to delete pathway" });
  }
});

// Bulk delete pathways
router.post("/pathways/bulk-delete", async (req, res) => {
  try {
    const ids: number[] = req.body.ids;
    if (!Array.isArray(ids) || ids.length === 0) { res.status(400).json({ error: "ids array is required" }); return; }
    const learners = await db.select().from(learnersTable);
    const blocked: { id: number; reason: string }[] = [];
    const deleted: number[] = [];
    for (const id of ids) {
      const [pathway] = await db.select().from(pathwaysTable).where(eq(pathwaysTable.id, id));
      if (!pathway) continue;
      const assigned = learners.filter(l => l.pathway === pathway.name);
      if (assigned.length > 0) {
        blocked.push({ id, reason: `${assigned.length} learner${assigned.length > 1 ? "s" : ""} assigned` });
      } else {
        await db.delete(pathwaysTable).where(eq(pathwaysTable.id, id));
        deleted.push(id);
      }
    }
    res.json({ deleted: deleted.length, blocked });
  } catch (error) {
    console.error("Error bulk deleting pathways:", error);
    res.status(500).json({ error: "Bulk delete failed" });
  }
});

export default router;