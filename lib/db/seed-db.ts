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

// Mock Data - copy from your mockData.ts
const organization = {
  name: "BlueWorkforce",
  tagline: "Empowering careers in technology",
  location: "Atlanta, GA",
  founded: "2018",
  website: "blueworkforce.com",
  logo: "BW",
};

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
    assignedLearners: ["Maya Thompson", "Tasha Green", "Simone Washington", "Destiny Clark", "Monique Harris", "Jasmine Parker", "Maria Rodriguez", "Victor Nguyen", "Priya Patel", "Michael Jenkins", "Angela Robinson"],
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
    assignedLearners: ["Jordan Ellis", "Alina Brooks", "Camille Johnson", "Antoine Walker", "Darius Mitchell", "Brianna Foster", "Elijah Scott", "Andre Davis", "Christopher Lee", "Amber Reid", "James Harrison", "Whitney Thomas", "Nicole Adams", "Isaiah Park"],
  },
  {
    id: 3,
    name: "Alicia Monroe",
    role: "Career Coach",
    email: "alicia@atltechalliance.org",
    learnersCount: 13,
    atRisk: 2,
    workload: "Healthy",
    upcomingCheckIns: 6,
    overdueCheckIns: 0,
    assignedLearners: ["Marcus Reed", "DeShawn Price", "Keisha Davis", "Kevin Brown", "Terrance Holmes", "Brandon Turner", "Isaiah Coleman", "Latoya Williams", "Nathaniel Cross", "Chantel Jackson", "Emmanuel Okafor", "Evelyn Torres", "Tyrone Bailey"],
  },
  {
    id: 4,
    name: "Marcus Webb",
    role: "Career Coach",
    email: "marcus@atltechalliance.org",
    learnersCount: 4,
    atRisk: 2,
    workload: "Healthy",
    upcomingCheckIns: 3,
    overdueCheckIns: 0,
    assignedLearners: ["Renee Simmons", "Kwame Johnson", "Carlos Rivera", "Crystal Bell"],
  },
  {
    id: 5,
    name: "Tonya Fleming",
    role: "Career Coach",
    email: "tonya@atltechalliance.org",
    learnersCount: 4,
    atRisk: 1,
    workload: "Healthy",
    upcomingCheckIns: 3,
    overdueCheckIns: 0,
    assignedLearners: ["Darryl Foster", "Bethany Moore", "Samuel Obi", "Maria Santos"],
  },
  {
    id: 6,
    name: "David Park",
    role: "Career Coach",
    email: "david@atltechalliance.org",
    learnersCount: 4,
    atRisk: 1,
    workload: "Healthy",
    upcomingCheckIns: 3,
    overdueCheckIns: 0,
    assignedLearners: ["Darrell Washington", "Sarah Chen", "Patrick Osei", "Fatima Ali"],
  },
];

const programs = [
  {
    id: 1,
    name: "Tech Career Launch",
    description: "A 20-week accelerated program guiding learners into IT support, help desk, and technical assistance roles through structured pathways, hands-on projects, and employer connections.",
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
    pathways: ["IT Support Specialist", "Technical Support Associate", "Project Coordinator"],
  },
  {
    id: 2,
    name: "Customer Success Accelerator",
    description: "An 18-week program helping learners translate customer-facing experience into technology careers in SaaS, CRM management, and client success roles.",
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
  {
    id: 3,
    name: "Data Operations Starter",
    description: "A 22-week program introducing learners to data entry, spreadsheet management, reporting, and junior analyst skills for operations-focused data roles.",
    pathwayCategory: "Data & Analytics Operations",
    activeLearners: 11,
    completionRate: 74,
    readinessScore: 76,
    eventParticipation: 80,
    placementReady: 1,
    funderTag: "Corporate Partners Fund",
    cohort: "Winter 2025",
    startDate: "Dec 9, 2024",
    endDate: "May 23, 2025",
    pathways: ["Junior Data Operations Analyst"],
  },
];

const pathways = [
  {
    id: 1,
    name: "Customer Success Associate",
    description: "Prepares learners to support customers in SaaS and technology companies through onboarding, retention, and relationship management.",
    targetProfile: "Customer-facing professionals, retail workers, service industry workers",
    estimatedWeeks: 18,
    activeLearners: 17,
    skills: ["CRM platforms", "Customer communication", "Data analysis basics", "Onboarding workflows", "Email and Slack etiquette"],
    milestones: ["Career readiness assessment", "CRM foundations", "Customer onboarding simulation", "Resume review", "Mock interview"],
    projects: ["Customer Onboarding Simulation", "CRM Workflow Mapping Exercise", "Interview Story Builder"],
    readinessCriteria: ["Resume reviewed by coach", "CRM simulation completed", "Mock interview attended", "Portfolio with 2 projects"],
  },
  {
    id: 2,
    name: "IT Support Specialist",
    description: "Builds foundational IT skills for help desk, desktop support, and entry-level technical assistance roles.",
    targetProfile: "Career changers with problem-solving aptitude, recent graduates",
    estimatedWeeks: 20,
    activeLearners: 8,
    skills: ["Help desk fundamentals", "CompTIA A+ basics", "Ticketing systems", "Remote support tools", "Documentation"],
    milestones: ["CompTIA A+ Module 1", "Help desk fundamentals", "Support ticket exercise", "Technical resume review", "Mock technical interview"],
    projects: ["Support Ticket Troubleshooting Exercise", "Interview Story Builder"],
    readinessCriteria: ["Technical assessment passed", "Support ticket simulation completed", "Technical resume reviewed", "Coach approval"],
  },
  {
    id: 3,
    name: "Junior Data Operations Analyst",
    description: "Introduces data hygiene, spreadsheet analysis, reporting, and junior data operations work for business and operations teams.",
    targetProfile: "Detail-oriented learners, admin workers, anyone comfortable with numbers",
    estimatedWeeks: 22,
    activeLearners: 11,
    skills: ["Excel/Google Sheets", "Data cleaning", "Basic SQL concepts", "Reporting and dashboards", "Data documentation"],
    milestones: ["Data fundamentals", "Spreadsheet proficiency assessment", "Data cleanup challenge", "Portfolio project", "Employer panel attendance"],
    projects: ["Data Cleanup Spreadsheet Challenge", "Interview Story Builder"],
    readinessCriteria: ["Spreadsheet assessment passed", "Data cleanup project completed", "Portfolio reviewed", "Coach approval"],
  },
  {
    id: 4,
    name: "Project Coordinator",
    description: "Develops project management and coordination skills for administrative, operations, and junior PM roles in tech-adjacent companies.",
    targetProfile: "Organized professionals, admin workers, those with team coordination experience",
    estimatedWeeks: 16,
    activeLearners: 7,
    skills: ["Project management basics", "Asana/Monday.com", "Meeting facilitation", "Documentation", "Stakeholder communication"],
    milestones: ["PM fundamentals", "Tool proficiency", "Project simulation", "Resume review", "Portfolio completion"],
    projects: ["CRM Workflow Mapping Exercise", "Interview Story Builder"],
    readinessCriteria: ["PM simulation completed", "Portfolio with project examples", "Resume reviewed", "Mock interview passed"],
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
    background: "Former retail supervisor with 5 years of customer-facing leadership experience. Entering technology through the Customer Success pathway.",
    strengths: ["Strong communication skills", "Customer empathy", "Leadership experience", "Quick learner"],
    risks: ["Networking milestone overdue", "Interview confidence needs development"],
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
  {
    id: 3,
    name: "Tasha Green",
    pathway: "Junior Data Operations Analyst",
    program: "Data Operations Starter",
    coach: "Denise Carter",
    progress: 81,
    readiness: 84,
    status: "Placement Ready",
    lastActive: "3 hours ago",
    nextAction: "Begin job application process",
    joinDate: "Dec 8, 2024",
    email: "t.green@email.com",
    profileStrength: 90,
  },
];

async function seedDatabase() {
  console.log("🌱 Starting database seed...");

  try {
    // 1. Insert Coaches
    console.log("Inserting coaches...");
    await db.delete(coachesTable);
    await db.insert(coachesTable).values(coaches);
    console.log("✅ Coaches inserted");

    // 2. Insert Programs
    console.log("Inserting programs...");
    await db.delete(programsTable);
    await db.insert(programsTable).values(programs);
    console.log("✅ Programs inserted");

    // 3. Insert Pathways
    console.log("Inserting pathways...");
    await db.delete(pathwaysTable);
    await db.insert(pathwaysTable).values(pathways);
    console.log("✅ Pathways inserted");

    // 4. Insert Learners
    console.log("Inserting learners...");
    await db.delete(learnersTable);
    await db.insert(learnersTable).values(learners);
    console.log("✅ Learners inserted");

    // 5. Insert sample learner details for Maya Thompson (learner 1)
    console.log("Inserting learner details...");
    
    // Roadmaps
    await db.delete(learnerRoadmapsTable);
    await db.insert(learnerRoadmapsTable).values([
      { learnerId: 1, title: "Complete Career Readiness Assessment", state: "completed", dueDate: "Feb 1, 2025" },
      { learnerId: 1, title: "Build LinkedIn Profile", state: "completed", dueDate: "Feb 15, 2025" },
      { learnerId: 1, title: "Complete CRM Foundations Module", state: "completed", dueDate: "Mar 1, 2025" },
      { learnerId: 1, title: "Resume Review with Coach", state: "in-progress", dueDate: "Apr 30, 2025" },
    ]);

    // Projects
    await db.delete(learnerProjectsTable);
    await db.insert(learnerProjectsTable).values([
      { learnerId: 1, title: "Customer Onboarding Simulation", completion: 100, status: "completed" },
      { learnerId: 1, title: "CRM Workflow Mapping Exercise", completion: 60, status: "in-progress" },
    ]);

    // Events
    await db.delete(learnerEventsTable);
    await db.insert(learnerEventsTable).values([
      { learnerId: 1, title: "Resume Translation Workshop", date: "Apr 18, 2025", status: "attended" },
      { learnerId: 1, title: "Mock Interview Night", date: "May 17, 2025", status: "upcoming" },
    ]);

    // Notes
    await db.delete(learnerNotesTable);
    await db.insert(learnerNotesTable).values([
      { learnerId: 1, author: "Denise Carter", date: "May 10, 2025", content: "Maya is making great progress on the CRM module. She mentioned feeling more confident about her transferable skills from retail. Recommended she attend Mock Interview Night." },
    ]);

    // Readiness Scores
    await db.delete(learnerReadinessScoresTable);
    await db.insert(learnerReadinessScoresTable).values([
      { learnerId: 1, dimension: "Resume", score: 78 },
      { learnerId: 1, dimension: "Interview", score: 65 },
      { learnerId: 1, dimension: "Portfolio", score: 70 },
      { learnerId: 1, dimension: "Technical Confidence", score: 68 },
      { learnerId: 1, dimension: "Communication", score: 80 },
      { learnerId: 1, dimension: "Application", score: 72 },
    ]);

    // Activities
    await db.delete(learnerActivitiesTable);
    await db.insert(learnerActivitiesTable).values([
      { learnerId: 1, date: "May 15, 2025", event: "Logged in and completed module quiz", type: "login" },
      { learnerId: 1, date: "May 10, 2025", event: "Coach note added by Denise Carter", type: "note" },
    ]);

    console.log("✅ Learner details inserted");
    console.log("\n🎉 Database seeded successfully!");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();