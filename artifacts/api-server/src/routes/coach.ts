import { Router } from "express";
import { db } from "../../../../lib/db/src/index";
import { coachesTable, insertCoachSchema } from "../../../../lib/db/src/schema/index";

export const coachRouter = Router();

// Get all coaches
coachRouter.get("/coaches", async (req, res) => {
  try {
    const coaches = await db.select().from(coachesTable);
    res.json(coaches);
  } catch (error) {
    console.error("Error fetching coaches:", error);
    res.status(500).json({ error: "Failed to fetch coaches" });
  }
});

// Create coach
coachRouter.post("/coaches", async (req, res) => {
  try {
    const data = insertCoachSchema.parse(req.body);
    const [newCoach] = await db.insert(coachesTable).values(data).returning();
    res.status(201).json(newCoach);
  } catch (error) {
    console.error("Error creating coach:", error);
    res.status(400).json({ error: "Invalid data" });
  }
});