import { Router, type IRouter } from "express";
import { db, fundingSourcesTable, insertFundingSourceSchema } from "@workspace/db";
import { eq } from "drizzle-orm";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx"];

function getMimeType(fileName: string): string {
  const ext = fileName.toLowerCase().split(".").pop();
  if (ext === "pdf") return "application/pdf";
  if (ext === "doc") return "application/msword";
  if (ext === "docx") return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  return "application/octet-stream";
}

const router: IRouter = Router();

router.get("/funding-sources", async (req, res) => {
  try {
    const sources = await db.select().from(fundingSourcesTable);
    res.json(sources);
  } catch (error) {
    console.error("Error fetching funding sources:", error);
    res.status(500).json({ error: "Failed to fetch funding sources" });
  }
});

router.get("/funding-sources/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [source] = await db.select().from(fundingSourcesTable).where(eq(fundingSourcesTable.id, id));
    if (!source) { res.status(404).json({ error: "Funding source not found" }); return; }
    res.json(source);
  } catch (error) {
    console.error("Error fetching funding source:", error);
    res.status(500).json({ error: "Failed to fetch funding source" });
  }
});

router.post("/funding-sources", async (req, res) => {
  try {
    if (req.body.amount != null) req.body.amount = String(req.body.amount);
    const data = insertFundingSourceSchema.parse(req.body);
    const [created] = await db.insert(fundingSourcesTable).values(data).returning();
    res.status(201).json(created);
  } catch (error) {
    console.error("Error creating funding source:", error);
    res.status(400).json({ error: "Invalid data" });
  }
});

router.put("/funding-sources/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (req.body.amount != null) req.body.amount = String(req.body.amount);
    const data = insertFundingSourceSchema.parse(req.body);
    const [updated] = await db.update(fundingSourcesTable).set(data).where(eq(fundingSourcesTable.id, id)).returning();
    if (!updated) { res.status(404).json({ error: "Funding source not found" }); return; }
    res.json(updated);
  } catch (error) {
    console.error("Error updating funding source:", error);
    res.status(400).json({ error: "Invalid data" });
  }
});

router.delete("/funding-sources/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [deleted] = await db.delete(fundingSourcesTable).where(eq(fundingSourcesTable.id, id)).returning();
    if (!deleted) { res.status(404).json({ error: "Funding source not found" }); return; }
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error deleting funding source:", error);
    res.status(500).json({ error: "Failed to delete funding source" });
  }
});

// Upload narrative file
router.put("/funding-sources/:id/narrative-file", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { fileName, fileData } = req.body;
    if (!fileName || !fileData) { res.status(400).json({ error: "fileName and fileData are required" }); return; }
    const ext = "." + fileName.toLowerCase().split(".").pop();
    if (!ALLOWED_EXTENSIONS.includes(ext)) { res.status(400).json({ error: "Only .pdf, .doc, .docx files are allowed" }); return; }
    const buffer = Buffer.from(fileData, "base64");
    if (buffer.length > MAX_FILE_SIZE) { res.status(400).json({ error: "File must be under 5MB" }); return; }
    await db.update(fundingSourcesTable).set({ narrativeFile: buffer, narrativeFileName: fileName, updatedAt: new Date() }).where(eq(fundingSourcesTable.id, id));
    res.json({ success: true, fileName });
  } catch (error) {
    console.error("Error uploading narrative file:", error);
    res.status(500).json({ error: "Failed to upload file" });
  }
});

// Download narrative file
router.get("/funding-sources/:id/narrative-file", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [source] = await db.select({ narrativeFile: fundingSourcesTable.narrativeFile, narrativeFileName: fundingSourcesTable.narrativeFileName }).from(fundingSourcesTable).where(eq(fundingSourcesTable.id, id));
    if (!source?.narrativeFile || !source.narrativeFileName) { res.status(404).json({ error: "No narrative file" }); return; }
    res.set("Content-Type", getMimeType(source.narrativeFileName));
    res.set("Content-Disposition", `attachment; filename="${source.narrativeFileName}"`);
    res.send(source.narrativeFile);
  } catch (error) {
    console.error("Error downloading narrative file:", error);
    res.status(500).json({ error: "Failed to download file" });
  }
});

// Delete narrative file
router.delete("/funding-sources/:id/narrative-file", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.update(fundingSourcesTable).set({ narrativeFile: null, narrativeFileName: null, updatedAt: new Date() }).where(eq(fundingSourcesTable.id, id));
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting narrative file:", error);
    res.status(500).json({ error: "Failed to delete file" });
  }
});

export default router;
