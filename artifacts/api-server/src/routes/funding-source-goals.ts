import { Router, type IRouter } from "express";
import { db, fundingSourceGoalsTable, insertFundingSourceGoalSchema } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx"];

function getMimeType(fileName: string): string {
  const ext = fileName.toLowerCase().split(".").pop();
  if (ext === "pdf") return "application/pdf";
  if (ext === "doc") return "application/msword";
  if (ext === "docx") return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  return "application/octet-stream";
}

const router: IRouter = Router();

// List all goals across all funding sources
router.get("/funding-source-goals", async (req, res) => {
  try {
    const goals = await db.select().from(fundingSourceGoalsTable);
    res.json(goals);
  } catch (error) {
    console.error("Error fetching all goals:", error);
    res.status(500).json({ error: "Failed to fetch goals" });
  }
});

// List goals for a funding source
router.get("/funding-sources/:fundingSourceId/goals", async (req, res) => {
  try {
    const fundingSourceId = parseInt(req.params.fundingSourceId);
    const goals = await db.select().from(fundingSourceGoalsTable).where(eq(fundingSourceGoalsTable.fundingSourceId, fundingSourceId));
    res.json(goals);
  } catch (error) {
    console.error("Error fetching goals:", error);
    res.status(500).json({ error: "Failed to fetch goals" });
  }
});

// Create a goal
router.post("/funding-sources/:fundingSourceId/goals", async (req, res) => {
  try {
    const fundingSourceId = parseInt(req.params.fundingSourceId);
    const data = insertFundingSourceGoalSchema.parse({ ...req.body, fundingSourceId });
    const [created] = await db.insert(fundingSourceGoalsTable).values(data).returning();
    res.status(201).json(created);
  } catch (error) {
    console.error("Error creating goal:", error);
    res.status(400).json({ error: "Invalid data" });
  }
});

// Update a goal
router.put("/funding-sources/:fundingSourceId/goals/:goalId", async (req, res) => {
  try {
    const goalId = parseInt(req.params.goalId);
    const fundingSourceId = parseInt(req.params.fundingSourceId);
    const { title, note, status } = req.body;
    const [updated] = await db.update(fundingSourceGoalsTable)
      .set({ title, note, status, updatedAt: new Date() })
      .where(and(eq(fundingSourceGoalsTable.id, goalId), eq(fundingSourceGoalsTable.fundingSourceId, fundingSourceId)))
      .returning();
    if (!updated) { res.status(404).json({ error: "Goal not found" }); return; }
    res.json(updated);
  } catch (error) {
    console.error("Error updating goal:", error);
    res.status(400).json({ error: "Invalid data" });
  }
});

// Delete a goal
router.delete("/funding-sources/:fundingSourceId/goals/:goalId", async (req, res) => {
  try {
    const goalId = parseInt(req.params.goalId);
    const fundingSourceId = parseInt(req.params.fundingSourceId);
    const [deleted] = await db.delete(fundingSourceGoalsTable)
      .where(and(eq(fundingSourceGoalsTable.id, goalId), eq(fundingSourceGoalsTable.fundingSourceId, fundingSourceId)))
      .returning();
    if (!deleted) { res.status(404).json({ error: "Goal not found" }); return; }
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error deleting goal:", error);
    res.status(500).json({ error: "Failed to delete goal" });
  }
});

// Upload goal document
router.put("/funding-sources/:fundingSourceId/goals/:goalId/document", async (req, res) => {
  try {
    const goalId = parseInt(req.params.goalId);
    const fundingSourceId = parseInt(req.params.fundingSourceId);
    const { fileName, fileData } = req.body;
    if (!fileName || !fileData) { res.status(400).json({ error: "fileName and fileData are required" }); return; }
    const ext = "." + fileName.toLowerCase().split(".").pop();
    if (!ALLOWED_EXTENSIONS.includes(ext)) { res.status(400).json({ error: "Only .pdf, .doc, .docx files are allowed" }); return; }
    const buffer = Buffer.from(fileData, "base64");
    if (buffer.length > MAX_FILE_SIZE) { res.status(400).json({ error: "File must be under 5MB" }); return; }
    const [updated] = await db.update(fundingSourceGoalsTable)
      .set({ documentFile: buffer, documentFileName: fileName, updatedAt: new Date() })
      .where(and(eq(fundingSourceGoalsTable.id, goalId), eq(fundingSourceGoalsTable.fundingSourceId, fundingSourceId)))
      .returning();
    if (!updated) { res.status(404).json({ error: "Goal not found" }); return; }
    res.json({ success: true, fileName });
  } catch (error) {
    console.error("Error uploading goal document:", error);
    res.status(500).json({ error: "Failed to upload file" });
  }
});

// Download goal document
router.get("/funding-sources/:fundingSourceId/goals/:goalId/document", async (req, res) => {
  try {
    const goalId = parseInt(req.params.goalId);
    const fundingSourceId = parseInt(req.params.fundingSourceId);
    const [goal] = await db.select({ documentFile: fundingSourceGoalsTable.documentFile, documentFileName: fundingSourceGoalsTable.documentFileName })
      .from(fundingSourceGoalsTable)
      .where(and(eq(fundingSourceGoalsTable.id, goalId), eq(fundingSourceGoalsTable.fundingSourceId, fundingSourceId)));
    if (!goal?.documentFile || !goal.documentFileName) { res.status(404).json({ error: "No document" }); return; }
    res.set("Content-Type", getMimeType(goal.documentFileName));
    res.set("Content-Disposition", `attachment; filename="${goal.documentFileName}"`);
    res.send(goal.documentFile);
  } catch (error) {
    console.error("Error downloading goal document:", error);
    res.status(500).json({ error: "Failed to download file" });
  }
});

// Delete goal document
router.delete("/funding-sources/:fundingSourceId/goals/:goalId/document", async (req, res) => {
  try {
    const goalId = parseInt(req.params.goalId);
    const fundingSourceId = parseInt(req.params.fundingSourceId);
    const [updated] = await db.update(fundingSourceGoalsTable)
      .set({ documentFile: null, documentFileName: null, updatedAt: new Date() })
      .where(and(eq(fundingSourceGoalsTable.id, goalId), eq(fundingSourceGoalsTable.fundingSourceId, fundingSourceId)))
      .returning();
    if (!updated) { res.status(404).json({ error: "Goal not found" }); return; }
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting goal document:", error);
    res.status(500).json({ error: "Failed to delete file" });
  }
});

export default router;
