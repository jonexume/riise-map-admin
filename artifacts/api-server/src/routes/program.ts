import { Router, type IRouter } from "express";
import { db, programsTable, insertProgramSchema, pathwaysTable, learnersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

function computeMetrics(program: any, learners: any[]) {
  const pl = learners.filter(l => l.program === program.name);
  const count = pl.length;
  return {
    ...program,
    activeLearners: count,
    completionRate: count > 0 ? Math.round(pl.filter(l => l.progress >= 100).length / count * 100) : 0,
    readinessScore: count > 0 ? Math.round(pl.reduce((s, l) => s + l.readiness, 0) / count) : 0,
    placementReady: pl.filter(l => l.status === "Placement Ready").length,
  };
}

// Get all programs
router.get("/programs", async (req, res) => {
  try {
    const programs = await db.select().from(programsTable);
    const learners = await db.select().from(learnersTable);
    res.json(programs.map(p => computeMetrics(p, learners)));
  } catch (error) {
    console.error("Error fetching programs:", error);
    res.status(500).json({ error: "Failed to fetch programs" });
  }
});

// Get single program
router.get("/programs/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const program = await db.select().from(programsTable).where(eq(programsTable.id, id));
    if (program.length === 0) {
      res.status(404).json({ error: "Program not found" });
      return;
    }
    const learners = await db.select().from(learnersTable);
    res.json(computeMetrics(program[0], learners));
  } catch (error) {
    console.error("Error fetching program:", error);
    res.status(500).json({ error: "Failed to fetch program" });
  }
});

// Create program
router.post("/programs", async (req, res) => {
  try {
    const data = insertProgramSchema.parse(req.body);

    // Check for unique programTag
    const existing = await db.select().from(programsTable).where(eq(programsTable.programTag, data.programTag));
    if (existing.length > 0) {
      return res.status(409).json({ error: "A program with this tag already exists." });
    }

    const [newProgram] = await db.insert(programsTable).values(data).returning();
    res.status(201).json(newProgram);
  } catch (error) {
    console.error("Error creating program:", error);
    res.status(400).json({ error: "Invalid data" });
  }
});

// Update program
router.put("/programs/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = insertProgramSchema.partial().parse(req.body);

    // Check for unique programTag (exclude current program)
    const existing = await db.select().from(programsTable).where(eq(programsTable.programTag, data.programTag));
    if (existing.length > 0 && existing[0].id !== id) {
      return res.status(409).json({ error: "A program with this tag already exists." });
    }

    const [updatedProgram] = await db.update(programsTable).set(data).where(eq(programsTable.id, id)).returning();
    if (!updatedProgram) {
      res.status(404).json({ error: "Program not found" });
      return;
    }
    res.json(updatedProgram);
  } catch (error) {
    console.error("Error updating program:", error);
    res.status(400).json({ error: "Invalid data" });
  }
});

// Delete program (only if not assigned to any pathway)
router.delete("/programs/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const program = await db.select().from(programsTable).where(eq(programsTable.id, id));
    if (program.length === 0) {
      res.status(404).json({ error: "Program not found" });
      return;
    }

    // Check if program is referenced in any pathway's pathwayCategory
    const pathways = await db.select().from(pathwaysTable);
    const assigned = pathways.some(p => p.pathwayCategory === program[0].name);
    if (assigned) {
      return res.status(409).json({ error: "Cannot delete a program that is assigned to a pathway." });
    }

    await db.delete(programsTable).where(eq(programsTable.id, id));
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error deleting program:", error);
    res.status(500).json({ error: "Failed to delete program" });
  }
});

export default router;
