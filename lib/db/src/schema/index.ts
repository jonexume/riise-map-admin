import { pgTable, text, serial, integer, varchar, date, boolean, jsonb, foreignKey, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Learners Table
export const learnersTable = pgTable("learners", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  pathway: varchar("pathway", { length: 255 }).notNull(),
  program: varchar("program", { length: 255 }).notNull(),
  coach: varchar("coach", { length: 255 }).notNull(),
  progress: integer("progress").notNull(),
  readiness: integer("readiness").notNull(),
  status: varchar("status", { length: 50 }).notNull(),
  lastActive: varchar("lastActive", { length: 255 }).notNull(),
  nextAction: varchar("nextAction", { length: 255 }).notNull(),
  joinDate: varchar("joinDate", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  photo: varchar("photo", { length: 255 }),
  background: text("background"),
  strengths: jsonb("strengths"),
  risks: jsonb("risks"),
  profileStrength: integer("profileStrength"),
});

export const insertLearnerSchema = createInsertSchema(learnersTable).omit({ id: true });
export type InsertLearner = z.infer<typeof insertLearnerSchema>;
export type Learner = typeof learnersTable.$inferSelect;

// Coaches Table
export const coachesTable = pgTable("coaches", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  role: varchar("role", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  learnersCount: integer("learnersCount").notNull(),
  atRisk: integer("atRisk").notNull(),
  workload: varchar("workload", { length: 50 }).notNull(),
  upcomingCheckIns: integer("upcomingCheckIns").notNull(),
  overdueCheckIns: integer("overdueCheckIns").notNull(),
  assignedLearners: jsonb("assignedLearners"),
});

export const insertCoachSchema = createInsertSchema(coachesTable).omit({ id: true });
export type InsertCoach = z.infer<typeof insertCoachSchema>;
export type Coach = typeof coachesTable.$inferSelect;

// Programs Table
export const programsTable = pgTable("programs", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  pathwayCategory: varchar("pathwayCategory", { length: 255 }).notNull(),
  activeLearners: integer("activeLearners").notNull(),
  completionRate: integer("completionRate").notNull(),
  readinessScore: integer("readinessScore").notNull(),
  eventParticipation: integer("eventParticipation").notNull(),
  placementReady: integer("placementReady").notNull(),
  funderTag: varchar("funderTag", { length: 255 }).notNull(),
  cohort: varchar("cohort", { length: 255 }).notNull(),
  startDate: varchar("startDate", { length: 255 }).notNull(),
  endDate: varchar("endDate", { length: 255 }).notNull(),
  pathways: jsonb("pathways"),
});

export const insertProgramSchema = createInsertSchema(programsTable).omit({ id: true });
export type InsertProgram = z.infer<typeof insertProgramSchema>;
export type Program = typeof programsTable.$inferSelect;

// Pathways Table
export const pathwaysTable = pgTable("pathways", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  targetProfile: text("targetProfile").notNull(),
  estimatedWeeks: integer("estimatedWeeks").notNull(),
  activeLearners: integer("activeLearners").notNull(),
  skills: jsonb("skills"),
  milestones: jsonb("milestones"),
  projects: jsonb("projects"),
  readinessCriteria: jsonb("readinessCriteria"),
});

export const insertPathwaySchema = createInsertSchema(pathwaysTable).omit({ id: true });
export type InsertPathway = z.infer<typeof insertPathwaySchema>;
export type Pathway = typeof pathwaysTable.$inferSelect;

// Learner Roadmaps Table
export const learnerRoadmapsTable = pgTable("learner_roadmaps", {
  id: serial("id").primaryKey(),
  learnerId: integer("learnerId").notNull().references(() => learnersTable.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  state: varchar("state", { length: 50 }).notNull(),
  dueDate: varchar("dueDate", { length: 255 }).notNull(),
});

export const insertLearnerRoadmapSchema = createInsertSchema(learnerRoadmapsTable).omit({ id: true });
export type InsertLearnerRoadmap = z.infer<typeof insertLearnerRoadmapSchema>;
export type LearnerRoadmap = typeof learnerRoadmapsTable.$inferSelect;

// Learner Projects Table
export const learnerProjectsTable = pgTable("learner_projects", {
  id: serial("id").primaryKey(),
  learnerId: integer("learnerId").notNull().references(() => learnersTable.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  completion: integer("completion").notNull(),
  status: varchar("status", { length: 50 }).notNull(),
});

export const insertLearnerProjectSchema = createInsertSchema(learnerProjectsTable).omit({ id: true });
export type InsertLearnerProject = z.infer<typeof insertLearnerProjectSchema>;
export type LearnerProject = typeof learnerProjectsTable.$inferSelect;

// Learner Events Table
export const learnerEventsTable = pgTable("learner_events", {
  id: serial("id").primaryKey(),
  learnerId: integer("learnerId").notNull().references(() => learnersTable.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  date: varchar("date", { length: 255 }).notNull(),
  status: varchar("status", { length: 50 }).notNull(),
});

export const insertLearnerEventSchema = createInsertSchema(learnerEventsTable).omit({ id: true });
export type InsertLearnerEvent = z.infer<typeof insertLearnerEventSchema>;
export type LearnerEvent = typeof learnerEventsTable.$inferSelect;

// Learner Notes Table
export const learnerNotesTable = pgTable("learner_notes", {
  id: serial("id").primaryKey(),
  learnerId: integer("learnerId").notNull().references(() => learnersTable.id, { onDelete: "cascade" }),
  author: varchar("author", { length: 255 }).notNull(),
  date: varchar("date", { length: 255 }).notNull(),
  content: text("content").notNull(),
});

export const insertLearnerNoteSchema = createInsertSchema(learnerNotesTable).omit({ id: true });
export type InsertLearnerNote = z.infer<typeof insertLearnerNoteSchema>;
export type LearnerNote = typeof learnerNotesTable.$inferSelect;

// Learner Readiness Scores Table
export const learnerReadinessScoresTable = pgTable("learner_readiness_scores", {
  id: serial("id").primaryKey(),
  learnerId: integer("learnerId").notNull().references(() => learnersTable.id, { onDelete: "cascade" }),
  dimension: varchar("dimension", { length: 255 }).notNull(),
  score: integer("score").notNull(),
});

export const insertLearnerReadinessScoreSchema = createInsertSchema(learnerReadinessScoresTable).omit({ id: true });
export type InsertLearnerReadinessScore = z.infer<typeof insertLearnerReadinessScoreSchema>;
export type LearnerReadinessScore = typeof learnerReadinessScoresTable.$inferSelect;

// Learner Activities Table
export const learnerActivitiesTable = pgTable("learner_activities", {
  id: serial("id").primaryKey(),
  learnerId: integer("learnerId").notNull().references(() => learnersTable.id, { onDelete: "cascade" }),
  date: varchar("date", { length: 255 }).notNull(),
  event: text("event").notNull(),
  type: varchar("type", { length: 50 }).notNull(),
});

export const insertLearnerActivitySchema = createInsertSchema(learnerActivitiesTable).omit({ id: true });
export type InsertLearnerActivity = z.infer<typeof insertLearnerActivitySchema>;
export type LearnerActivity = typeof learnerActivitiesTable.$inferSelect;
