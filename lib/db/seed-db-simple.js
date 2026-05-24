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
        ('Denise Carter', 'Program Manager & Coach', 'denise@atltechalliance.org', 11, 1, 'Healthy', 5, 0, '["Maya Thompson","Tasha Green","Simone Washington","Destiny Clark","Monique Harris","Jasmine Parker","Maria Rodriguez","Victor Nguyen","Priya Patel","Michael Jenkins","Angela Robinson"]'::jsonb),
        ('Raymond Brooks', 'Career Coach', 'raymond@atltechalliance.org', 14, 3, 'Near Capacity', 7, 1, '["Jordan Ellis","Alina Brooks","Camille Johnson","Antoine Walker","Darius Mitchell","Brianna Foster","Elijah Scott","Andre Davis","Christopher Lee","Amber Reid","James Harrison","Whitney Thomas","Nicole Adams","Isaiah Park"]'::jsonb),
        ('Alicia Monroe', 'Career Coach', 'alicia@atltechalliance.org', 13, 2, 'Healthy', 6, 0, '["Marcus Reed","DeShawn Price","Keisha Davis","Kevin Brown","Terrance Holmes","Brandon Turner","Isaiah Coleman","Latoya Williams","Nathaniel Cross","Chantel Jackson","Emmanuel Okafor","Evelyn Torres","Tyrone Bailey"]'::jsonb),
        ('Marcus Webb', 'Career Coach', 'marcus@atltechalliance.org', 4, 2, 'Healthy', 3, 0, '["Renee Simmons","Kwame Johnson","Carlos Rivera","Crystal Bell"]'::jsonb),
        ('Tonya Fleming', 'Career Coach', 'tonya@atltechalliance.org', 4, 1, 'Healthy', 3, 0, '["Darryl Foster","Bethany Moore","Samuel Obi","Maria Santos"]'::jsonb),
        ('David Park', 'Career Coach', 'david@atltechalliance.org', 4, 1, 'Healthy', 3, 0, '["Darrell Washington","Sarah Chen","Patrick Osei","Fatima Ali"]'::jsonb)
      ON CONFLICT DO NOTHING;
    `);
    console.log("✅ Coaches inserted");

    // 2. Insert Programs
    console.log("Inserting programs...");
    await client.query(`
      INSERT INTO programs (name, description, "pathwayCategory", "activeLearners", "completionRate", "readinessScore", "eventParticipation", "placementReady", "funderTag", cohort, "startDate", "endDate", pathways)
      VALUES 
        ('Tech Career Launch', 'A 20-week accelerated program guiding learners into IT support, help desk, and technical assistance roles through structured pathways, hands-on projects, and employer connections.', 'IT & Technical Support', 22, 67, 71, 78, 2, 'City Workforce Grant', 'Spring 2025', 'Jan 13, 2025', 'Jun 20, 2025', '["IT Support Specialist","Technical Support Associate","Project Coordinator"]'::jsonb),
        ('Customer Success Accelerator', 'An 18-week program helping learners translate customer-facing experience into technology careers in SaaS, CRM management, and client success roles.', 'Customer Success & Operations', 17, 58, 68, 72, 2, 'Tech Forward Initiative', 'Spring 2025', 'Jan 20, 2025', 'May 30, 2025', '["Customer Success Associate"]'::jsonb),
        ('Data Operations Starter', 'A 22-week program introducing learners to data entry, spreadsheet management, reporting, and junior analyst skills for operations-focused data roles.', 'Data & Analytics Operations', 11, 74, 76, 80, 1, 'Corporate Partners Fund', 'Winter 2025', 'Dec 9, 2024', 'May 23, 2025', '["Junior Data Operations Analyst"]'::jsonb)
      ON CONFLICT DO NOTHING;
    `);
    console.log("✅ Programs inserted");

    // 3. Insert Pathways
    console.log("Inserting pathways...");
    await client.query(`
      INSERT INTO pathways (name, description, "targetProfile", "estimatedWeeks", "activeLearners", skills, milestones, projects, "readinessCriteria")
      VALUES 
        ('Customer Success Associate', 'Prepares learners to support customers in SaaS and technology companies through onboarding, retention, and relationship management.', 'Customer-facing professionals, retail workers, service industry workers', 18, 17, '["CRM platforms","Customer communication","Data analysis basics","Onboarding workflows","Email and Slack etiquette"]'::jsonb, '["Career readiness assessment","CRM foundations","Customer onboarding simulation","Resume review","Mock interview"]'::jsonb, '["Customer Onboarding Simulation","CRM Workflow Mapping Exercise","Interview Story Builder"]'::jsonb, '["Resume reviewed by coach","CRM simulation completed","Mock interview attended","Portfolio with 2 projects"]'::jsonb),
        ('IT Support Specialist', 'Builds foundational IT skills for help desk, desktop support, and entry-level technical assistance roles.', 'Career changers with problem-solving aptitude, recent graduates', 20, 8, '["Help desk fundamentals","CompTIA A+ basics","Ticketing systems","Remote support tools","Documentation"]'::jsonb, '["CompTIA A+ Module 1","Help desk fundamentals","Support ticket exercise","Technical resume review","Mock technical interview"]'::jsonb, '["Support Ticket Troubleshooting Exercise","Interview Story Builder"]'::jsonb, '["Technical assessment passed","Support ticket simulation completed","Technical resume reviewed","Coach approval"]'::jsonb),
        ('Junior Data Operations Analyst', 'Introduces data hygiene, spreadsheet analysis, reporting, and junior data operations work for business and operations teams.', 'Detail-oriented learners, admin workers, anyone comfortable with numbers', 22, 11, '["Excel/Google Sheets","Data cleaning","Basic SQL concepts","Reporting and dashboards","Data documentation"]'::jsonb, '["Data fundamentals","Spreadsheet proficiency assessment","Data cleanup challenge","Portfolio project","Employer panel attendance"]'::jsonb, '["Data Cleanup Spreadsheet Challenge","Interview Story Builder"]'::jsonb, '["Spreadsheet assessment passed","Data cleanup project completed","Portfolio reviewed","Coach approval"]'::jsonb),
        ('Project Coordinator', 'Develops project management and coordination skills for administrative, operations, and junior PM roles in tech-adjacent companies.', 'Organized professionals, admin workers, those with team coordination experience', 16, 7, '["Project management basics","Asana/Monday.com","Meeting facilitation","Documentation","Stakeholder communication"]'::jsonb, '["PM fundamentals","Tool proficiency","Project simulation","Resume review","Portfolio completion"]'::jsonb, '["CRM Workflow Mapping Exercise","Interview Story Builder"]'::jsonb, '["PM simulation completed","Portfolio with project examples","Resume reviewed","Mock interview passed"]'::jsonb)
      ON CONFLICT DO NOTHING;
    `);
    console.log("✅ Pathways inserted");

    // 4. Insert Learners
    console.log("Inserting learners...");
    await client.query(`
      INSERT INTO learners (name, pathway, program, coach, progress, readiness, status, "lastActive", "nextAction", "joinDate", email, photo, background, strengths, risks, "profileStrength")
      VALUES 
        ('Maya Thompson', 'Customer Success Associate', 'Customer Success Accelerator', 'Denise Carter', 64, 72, 'On Track', '2 hours ago', 'Complete CRM Workflow Mapping Exercise', 'Jan 15, 2025', 'm.thompson@email.com', '/maya.jpg', 'Former retail supervisor with 5 years of customer-facing leadership experience. Entering technology through the Customer Success pathway.', '["Strong communication skills","Customer empathy","Leadership experience","Quick learner"]'::jsonb, '["Networking milestone overdue","Interview confidence needs development"]'::jsonb, 82),
        ('Jordan Ellis', 'IT Support Specialist', 'Tech Career Launch', 'Raymond Brooks', 38, 55, 'Needs Support', '1 day ago', 'Schedule check-in with Raymond', 'Feb 3, 2025', 'j.ellis@email.com', NULL, NULL, NULL, NULL, NULL),
        ('Tasha Green', 'Junior Data Operations Analyst', 'Data Operations Starter', 'Denise Carter', 81, 84, 'Placement Ready', '3 hours ago', 'Begin job application process', 'Dec 8, 2024', 't.green@email.com', NULL, NULL, NULL, NULL, 90),
        ('Marcus Reed', 'Technical Support Associate', 'Tech Career Launch', 'Alicia Monroe', 22, 41, 'Stalled', '12 days ago', 'Immediate coach outreach needed', 'Mar 1, 2025', 'm.reed@email.com', NULL, NULL, NULL, NULL, NULL),
        ('Alina Brooks', 'Project Coordinator', 'Tech Career Launch', 'Raymond Brooks', 57, 68, 'On Track', '5 hours ago', 'Attend Networking Practice Session', 'Jan 28, 2025', 'a.brooks@email.com', NULL, NULL, NULL, NULL, NULL),
        ('DeShawn Price', 'Customer Success Associate', 'Customer Success Accelerator', 'Alicia Monroe', 45, 52, 'Needs Support', '2 days ago', 'Review confidence check-in results', 'Feb 14, 2025', 'd.price@email.com', NULL, NULL, NULL, NULL, NULL),
        ('Camille Johnson', 'IT Support Specialist', 'Tech Career Launch', 'Raymond Brooks', 73, 77, 'On Track', '4 hours ago', 'Complete final technical milestone', 'Jan 10, 2025', 'c.johnson@email.com', NULL, NULL, NULL, NULL, NULL),
        ('Antoine Walker', 'IT Support Specialist', 'Tech Career Launch', 'Raymond Brooks', 62, 69, 'On Track', '3 hours ago', 'Complete CompTIA A+ Module 2', 'Jan 20, 2025', 'a.walker@email.com', NULL, NULL, NULL, NULL, NULL),
        ('Keisha Davis', 'Technical Support Associate', 'Tech Career Launch', 'Alicia Monroe', 48, 61, 'On Track', '6 hours ago', 'Submit troubleshooting simulation', 'Feb 3, 2025', 'k.davis@email.com', NULL, NULL, NULL, NULL, NULL),
        ('Darius Mitchell', 'Project Coordinator', 'Tech Career Launch', 'Raymond Brooks', 35, 49, 'Needs Support', '3 days ago', 'Schedule check-in with Raymond', 'Feb 10, 2025', 'd.mitchell@email.com', NULL, NULL, NULL, NULL, NULL),
        ('Simone Washington', 'IT Support Specialist', 'Tech Career Launch', 'Denise Carter', 71, 75, 'On Track', '2 hours ago', 'Attend Mock Technical Interview', 'Jan 13, 2025', 's.washington@email.com', NULL, NULL, NULL, NULL, NULL),
        ('Kevin Brown', 'Technical Support Associate', 'Tech Career Launch', 'Alicia Monroe', 18, 38, 'Stalled', '16 days ago', 'Urgent coach outreach needed', 'Mar 3, 2025', 'k.brown@email.com', NULL, NULL, NULL, NULL, NULL),
        ('Brianna Foster', 'Project Coordinator', 'Tech Career Launch', 'Raymond Brooks', 55, 66, 'On Track', '5 hours ago', 'Complete PM tool proficiency module', 'Jan 27, 2025', 'b.foster@email.com', NULL, NULL, NULL, NULL, NULL),
        ('Terrance Holmes', 'IT Support Specialist', 'Tech Career Launch', 'Alicia Monroe', 42, 53, 'Needs Support', '2 days ago', 'Review missed help desk fundamentals module', 'Feb 17, 2025', 't.holmes@email.com', NULL, NULL, NULL, NULL, NULL),
        ('Destiny Clark', 'Technical Support Associate', 'Tech Career Launch', 'Denise Carter', 68, 72, 'On Track', '4 hours ago', 'Review technical resume with Denise', 'Jan 20, 2025', 'd.clark@email.com', NULL, NULL, NULL, NULL, NULL),
        ('Elijah Scott', 'Project Coordinator', 'Tech Career Launch', 'Raymond Brooks', 79, 80, 'On Track', '1 hour ago', 'Begin portfolio completion milestone', 'Jan 6, 2025', 'e.scott@email.com', NULL, NULL, NULL, NULL, NULL),
        ('Brandon Turner', 'IT Support Specialist', 'Tech Career Launch', 'Alicia Monroe', 88, 87, 'Placement Ready', '1 hour ago', 'Begin job application process', 'Dec 16, 2024', 'b.turner@email.com', NULL, NULL, NULL, NULL, NULL),
        ('Monique Harris', 'Technical Support Associate', 'Tech Career Launch', 'Denise Carter', 33, 48, 'Needs Support', '4 days ago', 'Check in on missed milestones', 'Feb 24, 2025', 'm.harris@email.com', NULL, NULL, NULL, NULL, NULL),
        ('Isaiah Coleman', 'Project Coordinator', 'Tech Career Launch', 'Alicia Monroe', 61, 70, 'On Track', '3 hours ago', 'Complete project simulation exercise', 'Jan 27, 2025', 'i.coleman@email.com', NULL, NULL, NULL, NULL, NULL),
        ('Andre Davis', 'IT Support Specialist', 'Tech Career Launch', 'Raymond Brooks', 54, 64, 'On Track', '6 hours ago', 'Review network fundamentals', 'Feb 7, 2025', 'a.davis@email.com', NULL, NULL, NULL, NULL, NULL)
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