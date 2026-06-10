import { Router, type IRouter } from "express";
import { db, programsTable, insertProgramSchema, pathwaysTable, learnersTable, fundingSourcesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logAudit } from "./audit-log";

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
    await logAudit(req, "created", "program", newProgram.id, newProgram.name);
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

// Bulk delete programs
router.post("/programs/bulk-delete", async (req, res) => {
  try {
    const ids: number[] = req.body.ids;
    if (!Array.isArray(ids) || ids.length === 0) { res.status(400).json({ error: "ids array is required" }); return; }
    const pathways = await db.select().from(pathwaysTable);
    const blocked: { id: number; reason: string }[] = [];
    const deleted: number[] = [];
    for (const id of ids) {
      const [program] = await db.select().from(programsTable).where(eq(programsTable.id, id));
      if (!program) continue;
      const assigned = pathways.some(p => p.pathwayCategory === program.name);
      if (assigned) {
        blocked.push({ id, reason: "Assigned to a pathway" });
      } else {
        await db.delete(programsTable).where(eq(programsTable.id, id));
        deleted.push(id);
        await logAudit(req, "deleted", "program", id, program.name);
      }
    }
    res.json({ deleted: deleted.length, blocked });
  } catch (error) {
    console.error("Error bulk deleting programs:", error);
    res.status(500).json({ error: "Bulk delete failed" });
  }
});

// Bulk import programs
router.post("/programs/import", async (req, res) => {
  try {
    const rows: unknown[] = req.body;
    if (!Array.isArray(rows) || rows.length === 0) { res.status(400).json({ error: "Request body must be a non-empty array" }); return; }
    const funders = await db.select().from(fundingSourcesTable);
    const funderNames = funders.map(f => f.name.toLowerCase().trim());
    const results = { imported: 0, errors: [] as { row: number; message: string }[] };
    for (let i = 0; i < rows.length; i++) {
      try {
        const row: any = rows[i];
        // Match funder by name
        if (row.funderTag) {
          const match = funders.find(f => f.name.toLowerCase().trim() === row.funderTag.toLowerCase().trim());
          if (match) row.funderTag = match.name;
        }
        // Set defaults for metrics
        row.activeLearners = parseInt(row.activeLearners) || 0;
        row.completionRate = parseInt(row.completionRate) || 0;
        row.readinessScore = parseInt(row.readinessScore) || 0;
        row.eventParticipation = parseInt(row.eventParticipation) || 0;
        row.placementReady = parseInt(row.placementReady) || 0;
        if (!row.pathways) row.pathways = null;
        const data = insertProgramSchema.parse(row);
        // Check unique programTag
        const existing = await db.select().from(programsTable).where(eq(programsTable.programTag, data.programTag));
        if (existing.length > 0) { results.errors.push({ row: i + 1, message: `programTag "${data.programTag}" already exists` }); continue; }
        await db.insert(programsTable).values(data);
        results.imported++;
      } catch (e: any) {
        results.errors.push({ row: i + 1, message: e.message || "Invalid data" });
      }
    }
    res.json(results);
  } catch (error) {
    console.error("Error importing programs:", error);
    res.status(500).json({ error: "Import failed" });
  }
});

export default router;
