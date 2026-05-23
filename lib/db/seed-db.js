import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { db } from "./src/index.js";
import {
  learnersTable,
  coachesTable,
  programsTable,
  pathwaysTable,
  learnerRoadmapsTable,
  learnerProjectsTable,
  learnerEventsTable,
  learnerNotesTable,
  learnerReadinessScoresTable,
  learnerActivitiesTable,
} from "./src/schema/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({ path: path.join(__dirname, "../.env") });
config({ path: path.join(__dirname, ".env") });

// Mock Data
const coaches = [
  {
    id: 1,
    name: "Denise Carter",
    role: "Program Manager & Coach",
    email: "denise@atltechalliance.org",
    learnersCount: 11,
    atRisk: 1,
    workload: "Healthy",
    upcomingCheckIns: 5,
    overdueCheckIns: 0,
    assignedLearners: ["Maya Thompson", "Tasha Green"],
  },
  {
    id: 2,
    name: "Raymond Brooks",
    role: "Career Coach",
    email: "raymond@atltechalliance.org",
    learnersCount: 14,
    atRisk: 3,
    workload: "Near Capacity",
    upcomingCheckIns: 7,
    overdueCheckIns: 1,
    assignedLearners: ["Jordan Ellis"],
  },
];

const programs = [
  {
    id: 1,
    name: "Tech Career Launch",
    description: "A 20-week accelerated program",
    pathwayCategory: "IT & Technical Support",
    activeLearners: 22,
    completionRate: 67,
    readinessScore: 71,
    eventParticipation: 78,
    placementReady: 2,
    funderTag: "City Workforce Grant",
    cohort: "Spring 2025",
    startDate: "Jan 13, 2025",
    endDate: "Jun 20, 2025",
    pathways: ["IT Support Specialist"],
  },
  {
    id: 2,
    name: "Customer Success Accelerator",
    description: "An 18-week program",
    pathwayCategory: "Customer Success & Operations",
    activeLearners: 17,
    completionRate: 58,
    readinessScore: 68,
    eventParticipation: 72,
    placementReady: 2,
    funderTag: "Tech Forward Initiative",
    cohort: "Spring 2025",
    startDate: "Jan 20, 2025",
    endDate: "May 30, 2025",
    pathways: ["Customer Success Associate"],
  },
];

const pathways = [
  {
    id: 1,
    name: "Customer Success Associate",
    description: "Prepares learners for customer success roles",
    targetProfile: "Customer-facing professionals",
    estimatedWeeks: 18,
    activeLearners: 17,
    skills: ["CRM platforms", "Customer communication"],
    milestones: ["Career readiness assessment"],
    projects: ["Customer Onboarding Simulation"],
    readinessCriteria: ["Resume reviewed by coach"],
  },
  {
    id: 2,
    name: "IT Support Specialist",
    description: "Builds foundational IT skills",
    targetProfile: "Career changers",
    estimatedWeeks: 20,
    activeLearners: 8,
    skills: ["Help desk fundamentals"],
    milestones: ["CompTIA A+ Module 1"],
    projects: ["Support Ticket Troubleshooting"],
    readinessCriteria: ["Technical assessment passed"],
  },
];

const learners = [
  {
    id: 1,
    name: "Maya Thompson",
    pathway: "Customer Success Associate",
    program: "Customer Success Accelerator",
    coach: "Denise Carter",
    progress: 64,
    readiness: 72,
    status: "On Track",
    lastActive: "2 hours ago",
    nextAction: "Complete CRM Workflow Mapping Exercise",
    joinDate: "Jan 15, 2025",
    email: "m.thompson@email.com",
    photo: "/maya.jpg",
    background: "Former retail supervisor",
    strengths: ["Strong communication skills"],
    risks: ["Interview confidence needs development"],
    profileStrength: 82,
  },
  {
    id: 2,
    name: "Jordan Ellis",
    pathway: "IT Support Specialist",
    program: "Tech Career Launch",
    coach: "Raymond Brooks",
    progress: 38,
    readiness: 55,
    status: "Needs Support",
    lastActive: "1 day ago",
    nextAction: "Schedule check-in with Raymond",
    joinDate: "Feb 3, 2025",
    email: "j.ellis@email.com",
  },
];

async function seedDatabase() {
  console.log("🌱 Starting database seed...");

  try {
    // Insert Coaches
    console.log("Inserting coaches...");
    await db.delete(coachesTable);
    await db.insert(coachesTable).values(coaches);
    console.log("✅ Coaches inserted");

    // Insert Programs
    console.log("Inserting programs...");
    await db.delete(programsTable);
    await db.insert(programsTable).values(programs);
    console.log("✅ Programs inserted");

    // Insert Pathways
    console.log("Inserting pathways...");
    await db.delete(pathwaysTable);
    await db.insert(pathwaysTable).values(pathways);
    console.log("✅ Pathways inserted");

    // Insert Learners
    console.log("Inserting learners...");
    await db.delete(learnersTable);
    await db.insert(learnersTable).values(learners);
    console.log("✅ Learners inserted");

    // Insert sample learner details
    console.log("Inserting learner details...");
    
    await db.delete(learnerRoadmapsTable);
    await db.insert(learnerRoadmapsTable).values([
      { learnerId: 1, title: "Complete Career Readiness Assessment", state: "completed", dueDate: "Feb 1, 2025" },
    ]);

    await db.delete(learnerProjectsTable);
    await db.insert(learnerProjectsTable).values([
      { learnerId: 1, title: "Customer Onboarding Simulation", completion: 100, status: "completed" },
    ]);

    console.log("✅ Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();