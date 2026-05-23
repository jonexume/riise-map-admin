/Users/batman/Downloads/ReplitExport-JonExume/Riise-Map-Admin/artifacts/api-server/src/routes/pathways.ts
import { Router, type IRouter } from "express";
import { db, pathwaysTable, insertPathwaySchema } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

// Get all pathways
router.get("/pathways", async (req, res) => {
  try {
    const pathways = await db.select().from(pathwaysTable);
    res.json(pathways);
  } catch (error) {
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
    res.status(400).json({ error: "Invalid data" });
  }
});

// Update pathway
router.put("/pathways/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = insertPathwaySchema.parse(req.body);
    const [updatedPathway] = await db.update(pathwaysTable).set(data).where(eq(pathwaysTable.id, id)).returning();
    if (!updatedPathway) {
      res.status(404).json({ error: "Pathway not found" });
      return;
    }
    res.json(updatedPathway);
  } catch (error) {
    res.status(400).json({ error: "Invalid data" });
  }
});

export default router;