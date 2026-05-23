import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({ path: path.join(__dirname, "../.env") });
config({ path: path.join(__dirname, ".env") });

const { Pool } = pg;

async function seedDatabase() {
  console.log("🌱 Starting database seed...");

  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL not found!");
    process.exit(1);
  }

  try {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const client = await pool.connect();

    console.log("✅ Connected to database");

    // 1. Insert Coaches
    console.log("Inserting coaches...");
    await client.query(`
      INSERT INTO coaches (name, role, email, "learnersCount", "atRisk", workload, "upcomingCheckIns", "overdueCheckIns", "assignedLearners")
      VALUES 
        ('Denise Carter', 'Program Manager & Coach', 'denise@atltechalliance.org', 11, 1, 'Healthy', 5, 0, '["Maya Thompson"]'::jsonb),
        ('Raymond Brooks', 'Career Coach', 'raymond@atltechalliance.org', 14, 3, 'Near Capacity', 7, 1, '["Jordan Ellis"]'::jsonb)
      ON CONFLICT DO NOTHING;
    `);
    console.log("✅ Coaches inserted");

    // 2. Insert Programs
    console.log("Inserting programs...");
    await client.query(`
      INSERT INTO programs (name, description, "pathwayCategory", "activeLearners", "completionRate", "readinessScore", "eventParticipation", "placementReady", "funderTag", cohort, "startDate", "endDate", pathways)
      VALUES 
        ('Tech Career Launch', 'A 20-week accelerated program', 'IT & Technical Support', 22, 67, 71, 78, 2, 'City Workforce Grant', 'Spring 2025', 'Jan 13, 2025', 'Jun 20, 2025', '["IT Support Specialist"]'::jsonb),
        ('Customer Success Accelerator', 'An 18-week program', 'Customer Success & Operations', 17, 58, 68, 72, 2, 'Tech Forward Initiative', 'Spring 2025', 'Jan 20, 2025', 'May 30, 2025', '["Customer Success Associate"]'::jsonb)
      ON CONFLICT DO NOTHING;
    `);
    console.log("✅ Programs inserted");

    // 3. Insert Pathways
    console.log("Inserting pathways...");
    await client.query(`
      INSERT INTO pathways (name, description, "targetProfile", "estimatedWeeks", "activeLearners", skills, milestones, projects, "readinessCriteria")
      VALUES 
        ('Customer Success Associate', 'Prepares learners for customer success roles', 'Customer-facing professionals', 18, 17, '["CRM platforms"]'::jsonb, '["Career readiness assessment"]'::jsonb, '["Customer Onboarding Simulation"]'::jsonb, '["Resume reviewed by coach"]'::jsonb),
        ('IT Support Specialist', 'Builds foundational IT skills', 'Career changers', 20, 8, '["Help desk fundamentals"]'::jsonb, '["CompTIA A+ Module 1"]'::jsonb, '["Support Ticket Troubleshooting"]'::jsonb, '["Technical assessment passed"]'::jsonb)
      ON CONFLICT DO NOTHING;
    `);
    console.log("✅ Pathways inserted");

    // 4. Insert Learners
    console.log("Inserting learners...");
    await client.query(`
      INSERT INTO learners (name, pathway, program, coach, progress, readiness, status, "lastActive", "nextAction", "joinDate", email, photo, background, strengths, risks, "profileStrength")
      VALUES 
        ('Maya Thompson', 'Customer Success Associate', 'Customer Success Accelerator', 'Denise Carter', 64, 72, 'On Track', '2 hours ago', 'Complete CRM Workflow Mapping Exercise', 'Jan 15, 2025', 'm.thompson@email.com', '/maya.jpg', 'Former retail supervisor', '["Strong communication skills"]'::jsonb, '["Interview confidence needs development"]'::jsonb, 82),
        ('Jordan Ellis', 'IT Support Specialist', 'Tech Career Launch', 'Raymond Brooks', 38, 55, 'Needs Support', '1 day ago', 'Schedule check-in with Raymond', 'Feb 3, 2025', 'j.ellis@email.com', NULL, NULL, NULL, NULL, NULL)
      ON CONFLICT DO NOTHING;
    `);
    console.log("✅ Learners inserted");

    client.release();
    await pool.end();

    console.log("\n🎉 Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();