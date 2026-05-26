import { Router, type IRouter } from "express";
import { db, programsTable, insertProgramSchema } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

// Get all programs
router.get("/programs", async (req, res) => {
  try {
    const programs = await db.select().from(programsTable);
    res.json(programs);
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
    res.json(program[0]);
  } catch (error) {
    console.error("Error fetching program:", error);
    res.status(500).json({ error: "Failed to fetch program" });
  }
});

// Create program
router.post("/programs", async (req, res) => {
  try {
    const data = insertProgramSchema.parse(req.body);
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
    const data = insertProgramSchema.parse(req.body);
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

export default router;