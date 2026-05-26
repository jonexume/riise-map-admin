import { Router, type IRouter } from "express";
import { db, learnersTable, insertLearnerSchema } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

// Get all learners
router.get("/learners", async (req, res) => {
  try {
    const learners = await db.select().from(learnersTable);
    res.json(learners);
  } catch (error) {
    console.error("Error fetching learners:", error);
    res.status(500).json({ error: "Failed to fetch learners" });
  }
});

// Get single learner
router.get("/learners/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const learner = await db.select().from(learnersTable).where(eq(learnersTable.id, id));
    if (learner.length === 0) {
      res.status(404).json({ error: "Learner not found" });
      return;
    }
    res.json(learner[0]);
  } catch (error) {
    console.error("Error fetching learner:", error);
    res.status(500).json({ error: "Failed to fetch learner" });
  }
});

// Create learner
router.post("/learners", async (req, res) => {
  try {
    const data = insertLearnerSchema.parse(req.body);
    const [newLearner] = await db.insert(learnersTable).values(data).returning();
    res.status(201).json(newLearner);
  } catch (error) {
    console.error("Error creating learner:", error);
    res.status(400).json({ error: "Invalid data" });
  }
});

// Update learner
router.put("/learners/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = insertLearnerSchema.parse(req.body);
    const [updatedLearner] = await db.update(learnersTable).set(data).where(eq(learnersTable.id, id)).returning();
    if (!updatedLearner) {
      res.status(404).json({ error: "Learner not found" });
      return;
    }
    res.json(updatedLearner);
  } catch (error) {
    console.error("Error updating learner:", error);
    res.status(400).json({ error: "Invalid data" });
  }
});

export default router;