import { Router, type IRouter } from "express";
import { db, fundingSourcesTable, insertFundingSourceSchema, fundingSourceLearnersTable, fundingSourceProgramsTable, fundingSourcePathwaysTable, insertFundingSourceLearnerSchema, insertFundingSourceProgramSchema, insertFundingSourcePathwaySchema } from "@workspace/db";
import { eq, and, inArray } from "drizzle-orm";

const router: IRouter = Router();

// Get all funding sources with associations
router.get("/funding-sources", async (req, res) => {
  try {
    const fundingSources = await db.select().from(fundingSourcesTable);
    const fundingSourceLearners = await db.select().from(fundingSourceLearnersTable);
    const fundingSourcePrograms = await db.select().from(fundingSourceProgramsTable);
    const fundingSourcePathways = await db.select().from(fundingSourcePathwaysTable);

    const result = fundingSources.map(fs => ({
      ...fs,
      associatedLearners: fundingSourceLearners.filter(fsl => fsl.fundingSourceId === fs.id).map(fsl => fsl.learnerId),
      associatedPrograms: fundingSourcePrograms.filter(fsp => fsp.fundingSourceId === fs.id).map(fsp => fsp.programId),
      associatedPathways: fundingSourcePathways.filter(fsp => fsp.fundingSourceId === fs.id).map(fsp => fsp.pathwayId),
    }));

    res.json(result);
  } catch (error) {
    console.error("Error fetching funding sources:", error);
    res.status(500).json({ error: "Failed to fetch funding sources" });
  }
});

// Get single funding source
router.get("/funding-sources/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const fundingSource = await db.select().from(fundingSourcesTable).where(eq(fundingSourcesTable.id, id));
    if (fundingSource.length === 0) {
      res.status(404).json({ error: "Funding source not found" });
      return;
    }

    const fs = fundingSource[0];
    const fundingSourceLearners = await db.select().from(fundingSourceLearnersTable).where(eq(fundingSourceLearnersTable.fundingSourceId, id));
    const fundingSourcePrograms = await db.select().from(fundingSourceProgramsTable).where(eq(fundingSourceProgramsTable.fundingSourceId, id));
    const fundingSourcePathways = await db.select().from(fundingSourcePathwaysTable).where(eq(fundingSourcePathwaysTable.fundingSourceId, id));

    const result = {
      ...fs,
      associatedLearners: fundingSourceLearners.map(fsl => fsl.learnerId),
      associatedPrograms: fundingSourcePrograms.map(fsp => fsp.programId),
      associatedPathways: fundingSourcePathways.map(fsp => fsp.pathwayId),
    };

    res.json(result);
  } catch (error) {
    console.error("Error fetching funding source:", error);
    res.status(500).json({ error: "Failed to fetch funding source" });
  }
});

// Create funding source
router.post("/funding-sources", async (req, res) => {
  try {
    const { associatedLearners, associatedPrograms, associatedPathways, ...rest } = req.body;
    const data = insertFundingSourceSchema.parse(rest);

    const [newFundingSource] = await db.insert(fundingSourcesTable).values(data).returning();

    // Insert associations
    if (associatedLearners && associatedLearners.length > 0) {
      await db.insert(fundingSourceLearnersTable).values(
        associatedLearners.map((learnerId: number) => ({
          fundingSourceId: newFundingSource.id,
          learnerId,
        }))
      );
    }
    if (associatedPrograms && associatedPrograms.length > 0) {
      await db.insert(fundingSourceProgramsTable).values(
        associatedPrograms.map((programId: number) => ({
          fundingSourceId: newFundingSource.id,
          programId,
        }))
      );
    }
    if (associatedPathways && associatedPathways.length > 0) {
      await db.insert(fundingSourcePathwaysTable).values(
        associatedPathways.map((pathwayId: number) => ({
          fundingSourceId: newFundingSource.id,
          pathwayId,
        }))
      );
    }

    const result = {
      ...newFundingSource,
      associatedLearners: associatedLearners || [],
      associatedPrograms: associatedPrograms || [],
      associatedPathways: associatedPathways || [],
    };

    res.status(201).json(result);
  } catch (error) {
    console.error("Error creating funding source:", error);
    res.status(400).json({ error: "Invalid data" });
  }
});

// Update funding source
router.put("/funding-sources/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { associatedLearners, associatedPrograms, associatedPathways, ...rest } = req.body;
    const data = insertFundingSourceSchema.parse(rest);

    const [updatedFundingSource] = await db.update(fundingSourcesTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(fundingSourcesTable.id, id))
      .returning();

    if (!updatedFundingSource) {
      res.status(404).json({ error: "Funding source not found" });
      return;
    }

    // Update learner associations
    const currentLearners = await db.select().from(fundingSourceLearnersTable).where(eq(fundingSourceLearnersTable.fundingSourceId, id));
    const currentLearnerIds = currentLearners.map(l => l.learnerId);
    const newLearnerIds = associatedLearners || [];

    const learnersToAdd = newLearnerIds.filter(lid => !currentLearnerIds.includes(lid));
    const learnersToRemove = currentLearnerIds.filter(lid => !newLearnerIds.includes(lid));

    if (learnersToRemove.length > 0) {
      await db.delete(fundingSourceLearnersTable).where(and(
        eq(fundingSourceLearnersTable.fundingSourceId, id),
        inArray(fundingSourceLearnersTable.learnerId, learnersToRemove)
      ));
    }
    if (learnersToAdd.length > 0) {
      await db.insert(fundingSourceLearnersTable).values(
        learnersToAdd.map(learnerId => ({ fundingSourceId: id, learnerId }))
      );
    }

    // Update program associations
    const currentPrograms = await db.select().from(fundingSourceProgramsTable).where(eq(fundingSourceProgramsTable.fundingSourceId, id));
    const currentProgramIds = currentPrograms.map(p => p.programId);
    const newProgramIds = associatedPrograms || [];

    const programsToAdd = newProgramIds.filter(pid => !currentProgramIds.includes(pid));
    const programsToRemove = currentProgramIds.filter(pid => !newProgramIds.includes(pid));

    if (programsToRemove.length > 0) {
      await db.delete(fundingSourceProgramsTable).where(and(
        eq(fundingSourceProgramsTable.fundingSourceId, id),
        inArray(fundingSourceProgramsTable.programId, programsToRemove)
      ));
    }
    if (programsToAdd.length > 0) {
      await db.insert(fundingSourceProgramsTable).values(
        programsToAdd.map(programId => ({ fundingSourceId: id, programId }))
      );
    }

    // Update pathway associations
    const currentPathways = await db.select().from(fundingSourcePathwaysTable).where(eq(fundingSourcePathwaysTable.fundingSourceId, id));
    const currentPathwayIds = currentPathways.map(p => p.pathwayId);
    const newPathwayIds = associatedPathways || [];

    const pathwaysToAdd = newPathwayIds.filter(pid => !currentPathwayIds.includes(pid));
    const pathwaysToRemove = currentPathwayIds.filter(pid => !newPathwayIds.includes(pid));

    if (pathwaysToRemove.length > 0) {
      await db.delete(fundingSourcePathwaysTable).where(and(
        eq(fundingSourcePathwaysTable.fundingSourceId, id),
        inArray(fundingSourcePathwaysTable.pathwayId, pathwaysToRemove)
      ));
    }
    if (pathwaysToAdd.length > 0) {
      await db.insert(fundingSourcePathwaysTable).values(
        pathwaysToAdd.map(pathwayId => ({ fundingSourceId: id, pathwayId }))
      );
    }

    const result = {
      ...updatedFundingSource,
      associatedLearners: newLearnerIds,
      associatedPrograms: newProgramIds,
      associatedPathways: newPathwayIds,
    };

    res.json(result);
  } catch (error) {
    console.error("Error updating funding source:", error);
    res.status(400).json({ error: "Invalid data" });
  }
});

export default router;