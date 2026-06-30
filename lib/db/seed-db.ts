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
  fundingSourcesTable,
  fundingSourceGoalsTable,
  successStoriesTable,
} from "./src/schema/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({ path: path.join(__dirname, "../.env") });
config({ path: path.join(__dirname, ".env") });

const coaches = [
  { id: 1, name: "Denise Carter", role: "Program Manager & Coach", email: "denise@atltechalliance.org", learnersCount: 5, atRisk: 1, workload: "Healthy", upcomingCheckIns: 4, overdueCheckIns: 0, assignedLearners: ["Maya Thompson", "Tasha Green", "Simone Washington", "Monique Harris", "Jasmine Parker"] },
  { id: 2, name: "Raymond Brooks", role: "Career Coach", email: "raymond@atltechalliance.org", learnersCount: 4, atRisk: 1, workload: "Healthy", upcomingCheckIns: 3, overdueCheckIns: 1, assignedLearners: ["Jordan Ellis", "Antoine Walker", "Darius Mitchell", "Brianna Foster"] },
  { id: 3, name: "Alicia Monroe", role: "Career Coach", email: "alicia@atltechalliance.org", learnersCount: 4, atRisk: 1, workload: "Healthy", upcomingCheckIns: 3, overdueCheckIns: 0, assignedLearners: ["Marcus Reed", "Keisha Davis", "Brandon Turner", "Latoya Williams"] },
  { id: 4, name: "Marcus Webb", role: "Career Coach", email: "marcus@atltechalliance.org", learnersCount: 3, atRisk: 1, workload: "Healthy", upcomingCheckIns: 2, overdueCheckIns: 0, assignedLearners: ["Renee Simmons", "Carlos Rivera", "Crystal Bell"] },
  { id: 5, name: "Tonya Fleming", role: "Career Coach", email: "tonya@atltechalliance.org", learnersCount: 2, atRisk: 0, workload: "Healthy", upcomingCheckIns: 2, overdueCheckIns: 0, assignedLearners: ["Samuel Obi", "Maria Santos"] },
  { id: 6, name: "David Park", role: "Career Coach", email: "david@atltechalliance.org", learnersCount: 2, atRisk: 1, workload: "Healthy", upcomingCheckIns: 2, overdueCheckIns: 0, assignedLearners: ["Patrick Osei", "Fatima Ali"] },
];

const programs = [
  { id: 1, name: "Tech Career Launch", programTag: "tech-career-launch", description: "A 20-week accelerated program guiding learners into IT support, help desk, and technical assistance roles through structured pathways, hands-on projects, and employer connections.", pathwayCategory: "IT & Technical Support", activeLearners: 22, completionRate: 67, readinessScore: 71, eventParticipation: 78, placementReady: 2, funderTag: "City Workforce Grant", cohort: "Spring 2025", startDate: "Jan 13, 2025", endDate: "Jun 20, 2025", pathways: ["IT Support Specialist", "Technical Support Associate", "Project Coordinator"] },
  { id: 2, name: "Customer Success Accelerator", programTag: "customer-success-accelerator", description: "An 18-week program helping learners translate customer-facing experience into technology careers in SaaS, CRM management, and client success roles.", pathwayCategory: "Customer Success & Operations", activeLearners: 17, completionRate: 58, readinessScore: 68, eventParticipation: 72, placementReady: 2, funderTag: "Tech Forward Initiative", cohort: "Spring 2025", startDate: "Jan 20, 2025", endDate: "May 30, 2025", pathways: ["Customer Success Associate"] },
  { id: 3, name: "Data Operations Starter", programTag: "data-operations-starter", description: "A 22-week program introducing learners to data entry, spreadsheet management, reporting, and junior analyst skills for operations-focused data roles.", pathwayCategory: "Data & Analytics Operations", activeLearners: 11, completionRate: 74, readinessScore: 76, eventParticipation: 80, placementReady: 1, funderTag: "Corporate Partners Fund", cohort: "Winter 2025", startDate: "Dec 9, 2024", endDate: "May 23, 2025", pathways: ["Junior Data Operations Analyst"] },
];

const pathways = [
  { id: 1, name: "Customer Success Associate", description: "Prepares learners to support customers in SaaS and technology companies through onboarding, retention, and relationship management.", targetProfile: "Customer-facing professionals, retail workers, service industry workers", estimatedWeeks: 18, activeLearners: 17, skills: ["CRM platforms", "Customer communication", "Data analysis basics", "Onboarding workflows", "Email and Slack etiquette"], milestones: ["Career readiness assessment", "CRM foundations", "Customer onboarding simulation", "Resume review", "Mock interview"], projects: ["Customer Onboarding Simulation", "CRM Workflow Mapping Exercise", "Interview Story Builder"], readinessCriteria: ["Resume reviewed by coach", "CRM simulation completed", "Mock interview attended", "Portfolio with 2 projects"] },
  { id: 2, name: "IT Support Specialist", description: "Builds foundational IT skills for help desk, desktop support, and entry-level technical assistance roles.", targetProfile: "Career changers with problem-solving aptitude, recent graduates", estimatedWeeks: 20, activeLearners: 8, skills: ["Help desk fundamentals", "CompTIA A+ basics", "Ticketing systems", "Remote support tools", "Documentation"], milestones: ["CompTIA A+ Module 1", "Help desk fundamentals", "Support ticket exercise", "Technical resume review", "Mock technical interview"], projects: ["Support Ticket Troubleshooting Exercise", "Interview Story Builder"], readinessCriteria: ["Technical assessment passed", "Support ticket simulation completed", "Technical resume reviewed", "Coach approval"] },
  { id: 3, name: "Junior Data Operations Analyst", description: "Introduces data hygiene, spreadsheet analysis, reporting, and junior data operations work for business and operations teams.", targetProfile: "Detail-oriented learners, admin workers, anyone comfortable with numbers", estimatedWeeks: 22, activeLearners: 11, skills: ["Excel/Google Sheets", "Data cleaning", "Basic SQL concepts", "Reporting and dashboards", "Data documentation"], milestones: ["Data fundamentals", "Spreadsheet proficiency assessment", "Data cleanup challenge", "Portfolio project", "Employer panel attendance"], projects: ["Data Cleanup Spreadsheet Challenge", "Interview Story Builder"], readinessCriteria: ["Spreadsheet assessment passed", "Data cleanup project completed", "Portfolio reviewed", "Coach approval"] },
  { id: 4, name: "Project Coordinator", description: "Develops project management and coordination skills for administrative, operations, and junior PM roles in tech-adjacent companies.", targetProfile: "Organized professionals, admin workers, those with team coordination experience", estimatedWeeks: 16, activeLearners: 7, skills: ["Project management basics", "Asana/Monday.com", "Meeting facilitation", "Documentation", "Stakeholder communication"], milestones: ["PM fundamentals", "Tool proficiency", "Project simulation", "Resume review", "Portfolio completion"], projects: ["CRM Workflow Mapping Exercise", "Interview Story Builder"], readinessCriteria: ["PM simulation completed", "Portfolio with project examples", "Resume reviewed", "Mock interview passed"] },
];

const learners = [
  { id: 1, name: "Maya Thompson", pathway: "Customer Success Associate", program: "Customer Success Accelerator", coach: "Denise Carter", progress: 64, readiness: 72, status: "On Track", lastActive: "2 hours ago", nextAction: "Complete CRM Workflow Mapping Exercise", joinDate: "Jan 15, 2025", email: "m.thompson@email.com", photo: "/maya.jpg", background: "Former retail supervisor with 5 years of customer-facing leadership experience.", strengths: ["Strong communication skills", "Customer empathy", "Leadership experience"], risks: ["Networking milestone overdue"], profileStrength: 82 },
  { id: 2, name: "Jordan Ellis", pathway: "IT Support Specialist", program: "Tech Career Launch", coach: "Raymond Brooks", progress: 38, readiness: 55, status: "Needs Support", lastActive: "1 day ago", nextAction: "Schedule check-in with Raymond", joinDate: "Feb 3, 2025", email: "j.ellis@email.com" },
  { id: 3, name: "Tasha Green", pathway: "Junior Data Operations Analyst", program: "Data Operations Starter", coach: "Denise Carter", progress: 81, readiness: 84, status: "Placement Ready", lastActive: "3 hours ago", nextAction: "Begin job application process", joinDate: "Dec 8, 2024", email: "t.green@email.com", profileStrength: 90 },
  { id: 4, name: "Simone Washington", pathway: "Customer Success Associate", program: "Customer Success Accelerator", coach: "Denise Carter", progress: 72, readiness: 70, status: "On Track", lastActive: "5 hours ago", nextAction: "Submit portfolio draft", joinDate: "Jan 20, 2025", email: "s.washington@email.com", background: "Former call center team lead transitioning to tech.", strengths: ["Team leadership", "Conflict resolution"], profileStrength: 75 },
  { id: 5, name: "Antoine Walker", pathway: "IT Support Specialist", program: "Tech Career Launch", coach: "Raymond Brooks", progress: 52, readiness: 60, status: "On Track", lastActive: "1 day ago", nextAction: "Complete CompTIA A+ Module 2", joinDate: "Jan 27, 2025", email: "a.walker@email.com" },
  { id: 6, name: "Darius Mitchell", pathway: "Project Coordinator", program: "Tech Career Launch", coach: "Raymond Brooks", progress: 25, readiness: 40, status: "Stalled", lastActive: "5 days ago", nextAction: "Respond to coach outreach", joinDate: "Feb 10, 2025", email: "d.mitchell@email.com", risks: ["No login in 5 days", "Missed last check-in"] },
  { id: 7, name: "Monique Harris", pathway: "Customer Success Associate", program: "Customer Success Accelerator", coach: "Denise Carter", progress: 88, readiness: 85, status: "Placement Ready", lastActive: "1 hour ago", nextAction: "Finalize resume for employer review", joinDate: "Jan 13, 2025", email: "m.harris@email.com", profileStrength: 92 },
  { id: 8, name: "Marcus Reed", pathway: "Junior Data Operations Analyst", program: "Data Operations Starter", coach: "Alicia Monroe", progress: 45, readiness: 52, status: "Needs Support", lastActive: "3 days ago", nextAction: "Resubmit data cleanup project", joinDate: "Jan 6, 2025", email: "m.reed@email.com", risks: ["Portfolio project incomplete"] },
  { id: 9, name: "Keisha Davis", pathway: "Customer Success Associate", program: "Customer Success Accelerator", coach: "Alicia Monroe", progress: 70, readiness: 68, status: "On Track", lastActive: "4 hours ago", nextAction: "Attend mock interview session", joinDate: "Jan 22, 2025", email: "k.davis@email.com" },
  { id: 10, name: "Brianna Foster", pathway: "Project Coordinator", program: "Tech Career Launch", coach: "Raymond Brooks", progress: 60, readiness: 63, status: "On Track", lastActive: "6 hours ago", nextAction: "Complete project simulation", joinDate: "Jan 27, 2025", email: "b.foster@email.com", strengths: ["Organized", "Detail-oriented"] },
  { id: 11, name: "Renee Simmons", pathway: "IT Support Specialist", program: "Tech Career Launch", coach: "Marcus Webb", progress: 90, readiness: 88, status: "Placement Ready", lastActive: "2 hours ago", nextAction: "Schedule employer info session", joinDate: "Dec 16, 2024", email: "r.simmons@email.com", profileStrength: 95 },
  { id: 12, name: "Carlos Rivera", pathway: "Junior Data Operations Analyst", program: "Data Operations Starter", coach: "Marcus Webb", progress: 55, readiness: 58, status: "On Track", lastActive: "1 day ago", nextAction: "Complete SQL basics module", joinDate: "Jan 13, 2025", email: "c.rivera@email.com" },
  { id: 13, name: "Brandon Turner", pathway: "IT Support Specialist", program: "Tech Career Launch", coach: "Alicia Monroe", progress: 33, readiness: 42, status: "Needs Support", lastActive: "4 days ago", nextAction: "Re-engage with help desk module", joinDate: "Feb 17, 2025", email: "b.turner@email.com", risks: ["Low engagement", "Behind on milestones"] },
  { id: 14, name: "Latoya Williams", pathway: "Customer Success Associate", program: "Customer Success Accelerator", coach: "Alicia Monroe", progress: 78, readiness: 75, status: "On Track", lastActive: "3 hours ago", nextAction: "Polish CRM portfolio project", joinDate: "Jan 20, 2025", email: "l.williams@email.com", strengths: ["CRM proficiency", "Strong writing"] },
  { id: 15, name: "Crystal Bell", pathway: "Project Coordinator", program: "Tech Career Launch", coach: "Marcus Webb", progress: 15, readiness: 35, status: "Stalled", lastActive: "8 days ago", nextAction: "Respond to engagement outreach", joinDate: "Mar 3, 2025", email: "c.bell@email.com", risks: ["No activity in over a week", "Has not completed onboarding"] },
  { id: 16, name: "Samuel Obi", pathway: "Junior Data Operations Analyst", program: "Data Operations Starter", coach: "Tonya Fleming", progress: 68, readiness: 72, status: "On Track", lastActive: "5 hours ago", nextAction: "Submit reporting dashboard project", joinDate: "Dec 16, 2024", email: "s.obi@email.com", background: "Former accountant pivoting to data operations." },
  { id: 17, name: "Maria Santos", pathway: "Customer Success Associate", program: "Customer Success Accelerator", coach: "Tonya Fleming", progress: 47, readiness: 50, status: "Needs Support", lastActive: "2 days ago", nextAction: "Complete onboarding simulation", joinDate: "Feb 10, 2025", email: "m.santos@email.com" },
  { id: 18, name: "Patrick Osei", pathway: "IT Support Specialist", program: "Tech Career Launch", coach: "David Park", progress: 73, readiness: 70, status: "On Track", lastActive: "6 hours ago", nextAction: "Take technical mock interview", joinDate: "Jan 13, 2025", email: "p.osei@email.com", strengths: ["Strong problem-solving", "Self-motivated"] },
  { id: 19, name: "Fatima Ali", pathway: "Junior Data Operations Analyst", program: "Data Operations Starter", coach: "David Park", progress: 20, readiness: 38, status: "Stalled", lastActive: "6 days ago", nextAction: "Schedule re-engagement call with David", joinDate: "Feb 24, 2025", email: "f.ali@email.com", risks: ["Childcare scheduling conflicts"] },
  { id: 20, name: "Jasmine Parker", pathway: "Project Coordinator", program: "Tech Career Launch", coach: "Denise Carter", progress: 95, readiness: 92, status: "Placement Ready", lastActive: "1 hour ago", nextAction: "Accept employer interview invitation", joinDate: "Dec 9, 2024", email: "j.parker@email.com", profileStrength: 97, background: "Former office manager with 8 years experience in operations.", strengths: ["Project management", "Stakeholder communication", "Documentation"] },
];

const roadmaps = [
  { learnerId: 1, title: "Complete Career Readiness Assessment", state: "completed", dueDate: "Feb 1, 2025" },
  { learnerId: 1, title: "Build LinkedIn Profile", state: "completed", dueDate: "Feb 15, 2025" },
  { learnerId: 1, title: "Complete CRM Foundations Module", state: "completed", dueDate: "Mar 1, 2025" },
  { learnerId: 1, title: "Resume Review with Coach", state: "in-progress", dueDate: "Apr 30, 2025" },
  { learnerId: 2, title: "Complete Onboarding Checklist", state: "completed", dueDate: "Feb 17, 2025" },
  { learnerId: 2, title: "CompTIA A+ Module 1", state: "in-progress", dueDate: "Mar 28, 2025" },
  { learnerId: 2, title: "Schedule Coach Check-in", state: "overdue", dueDate: "Mar 15, 2025" },
  { learnerId: 3, title: "Data Fundamentals Module", state: "completed", dueDate: "Jan 10, 2025" },
  { learnerId: 3, title: "Spreadsheet Proficiency Assessment", state: "completed", dueDate: "Feb 14, 2025" },
  { learnerId: 3, title: "Portfolio Project Submission", state: "completed", dueDate: "Mar 28, 2025" },
  { learnerId: 3, title: "Employer Panel Attendance", state: "completed", dueDate: "Apr 15, 2025" },
  { learnerId: 4, title: "Career Readiness Assessment", state: "completed", dueDate: "Feb 3, 2025" },
  { learnerId: 4, title: "CRM Foundations Module", state: "completed", dueDate: "Mar 7, 2025" },
  { learnerId: 4, title: "Customer Onboarding Simulation", state: "in-progress", dueDate: "Apr 25, 2025" },
  { learnerId: 5, title: "Onboarding Checklist", state: "completed", dueDate: "Feb 10, 2025" },
  { learnerId: 5, title: "CompTIA A+ Module 1", state: "completed", dueDate: "Mar 14, 2025" },
  { learnerId: 5, title: "Help Desk Fundamentals", state: "in-progress", dueDate: "Apr 18, 2025" },
  { learnerId: 6, title: "Onboarding Checklist", state: "completed", dueDate: "Feb 24, 2025" },
  { learnerId: 6, title: "PM Fundamentals Module", state: "in-progress", dueDate: "Mar 28, 2025" },
  { learnerId: 6, title: "Schedule First Check-in", state: "overdue", dueDate: "Mar 3, 2025" },
  { learnerId: 7, title: "Career Readiness Assessment", state: "completed", dueDate: "Jan 27, 2025" },
  { learnerId: 7, title: "CRM Foundations Module", state: "completed", dueDate: "Feb 28, 2025" },
  { learnerId: 7, title: "Mock Interview Prep", state: "completed", dueDate: "Mar 21, 2025" },
  { learnerId: 7, title: "Resume Final Review", state: "in-progress", dueDate: "May 2, 2025" },
  { learnerId: 8, title: "Data Fundamentals Module", state: "completed", dueDate: "Jan 24, 2025" },
  { learnerId: 8, title: "Spreadsheet Assessment", state: "in-progress", dueDate: "Mar 14, 2025" },
  { learnerId: 8, title: "Data Cleanup Challenge", state: "overdue", dueDate: "Apr 4, 2025" },
  { learnerId: 9, title: "Career Readiness Assessment", state: "completed", dueDate: "Feb 5, 2025" },
  { learnerId: 9, title: "CRM Foundations Module", state: "completed", dueDate: "Mar 12, 2025" },
  { learnerId: 9, title: "Customer Onboarding Simulation", state: "completed", dueDate: "Apr 9, 2025" },
  { learnerId: 10, title: "PM Fundamentals Module", state: "completed", dueDate: "Feb 14, 2025" },
  { learnerId: 10, title: "Tool Proficiency (Asana)", state: "completed", dueDate: "Mar 14, 2025" },
  { learnerId: 10, title: "Project Simulation", state: "in-progress", dueDate: "Apr 25, 2025" },
  { learnerId: 11, title: "CompTIA A+ Module 1", state: "completed", dueDate: "Jan 6, 2025" },
  { learnerId: 11, title: "Help Desk Fundamentals", state: "completed", dueDate: "Feb 7, 2025" },
  { learnerId: 11, title: "Support Ticket Exercise", state: "completed", dueDate: "Mar 7, 2025" },
  { learnerId: 11, title: "Technical Resume Review", state: "completed", dueDate: "Apr 4, 2025" },
  { learnerId: 12, title: "Data Fundamentals Module", state: "completed", dueDate: "Jan 27, 2025" },
  { learnerId: 12, title: "Spreadsheet Assessment", state: "completed", dueDate: "Mar 7, 2025" },
  { learnerId: 12, title: "SQL Basics Module", state: "in-progress", dueDate: "Apr 18, 2025" },
  { learnerId: 13, title: "Onboarding Checklist", state: "completed", dueDate: "Mar 3, 2025" },
  { learnerId: 13, title: "CompTIA A+ Module 1", state: "in-progress", dueDate: "Apr 4, 2025" },
  { learnerId: 13, title: "Help Desk Fundamentals", state: "overdue", dueDate: "Apr 18, 2025" },
  { learnerId: 14, title: "Career Readiness Assessment", state: "completed", dueDate: "Feb 3, 2025" },
  { learnerId: 14, title: "CRM Foundations Module", state: "completed", dueDate: "Mar 7, 2025" },
  { learnerId: 14, title: "Customer Onboarding Simulation", state: "completed", dueDate: "Apr 4, 2025" },
  { learnerId: 14, title: "Portfolio Draft Submission", state: "in-progress", dueDate: "May 9, 2025" },
  { learnerId: 15, title: "Onboarding Checklist", state: "in-progress", dueDate: "Mar 17, 2025" },
  { learnerId: 15, title: "PM Fundamentals Module", state: "overdue", dueDate: "Apr 7, 2025" },
  { learnerId: 16, title: "Data Fundamentals Module", state: "completed", dueDate: "Jan 6, 2025" },
  { learnerId: 16, title: "Spreadsheet Assessment", state: "completed", dueDate: "Feb 14, 2025" },
  { learnerId: 16, title: "Reporting Dashboard Project", state: "in-progress", dueDate: "Apr 25, 2025" },
  { learnerId: 17, title: "Career Readiness Assessment", state: "completed", dueDate: "Feb 24, 2025" },
  { learnerId: 17, title: "CRM Foundations Module", state: "in-progress", dueDate: "Apr 4, 2025" },
  { learnerId: 17, title: "Customer Onboarding Simulation", state: "overdue", dueDate: "Apr 18, 2025" },
  { learnerId: 18, title: "CompTIA A+ Module 1", state: "completed", dueDate: "Feb 3, 2025" },
  { learnerId: 18, title: "Help Desk Fundamentals", state: "completed", dueDate: "Mar 7, 2025" },
  { learnerId: 18, title: "Support Ticket Exercise", state: "completed", dueDate: "Apr 4, 2025" },
  { learnerId: 18, title: "Technical Mock Interview", state: "in-progress", dueDate: "May 9, 2025" },
  { learnerId: 19, title: "Onboarding Checklist", state: "completed", dueDate: "Mar 10, 2025" },
  { learnerId: 19, title: "Data Fundamentals Module", state: "overdue", dueDate: "Apr 7, 2025" },
  { learnerId: 20, title: "PM Fundamentals Module", state: "completed", dueDate: "Jan 6, 2025" },
  { learnerId: 20, title: "Tool Proficiency (Monday.com)", state: "completed", dueDate: "Feb 7, 2025" },
  { learnerId: 20, title: "Project Simulation", state: "completed", dueDate: "Mar 14, 2025" },
  { learnerId: 20, title: "Portfolio Completion", state: "completed", dueDate: "Apr 11, 2025" },
];

const projects = [
  { learnerId: 1, title: "Customer Onboarding Simulation", completion: 100, status: "completed" },
  { learnerId: 1, title: "CRM Workflow Mapping Exercise", completion: 60, status: "in-progress" },
  { learnerId: 2, title: "Support Ticket Troubleshooting Exercise", completion: 30, status: "in-progress" },
  { learnerId: 3, title: "Data Cleanup Spreadsheet Challenge", completion: 100, status: "completed" },
  { learnerId: 3, title: "Interview Story Builder", completion: 100, status: "completed" },
  { learnerId: 4, title: "Customer Onboarding Simulation", completion: 75, status: "in-progress" },
  { learnerId: 4, title: "CRM Workflow Mapping Exercise", completion: 40, status: "in-progress" },
  { learnerId: 5, title: "Support Ticket Troubleshooting Exercise", completion: 50, status: "in-progress" },
  { learnerId: 6, title: "CRM Workflow Mapping Exercise", completion: 10, status: "in-progress" },
  { learnerId: 7, title: "Customer Onboarding Simulation", completion: 100, status: "completed" },
  { learnerId: 7, title: "Interview Story Builder", completion: 85, status: "in-progress" },
  { learnerId: 8, title: "Data Cleanup Spreadsheet Challenge", completion: 35, status: "in-progress" },
  { learnerId: 9, title: "Customer Onboarding Simulation", completion: 100, status: "completed" },
  { learnerId: 9, title: "CRM Workflow Mapping Exercise", completion: 55, status: "in-progress" },
  { learnerId: 10, title: "CRM Workflow Mapping Exercise", completion: 70, status: "in-progress" },
  { learnerId: 10, title: "Interview Story Builder", completion: 45, status: "in-progress" },
  { learnerId: 11, title: "Support Ticket Troubleshooting Exercise", completion: 100, status: "completed" },
  { learnerId: 11, title: "Interview Story Builder", completion: 100, status: "completed" },
  { learnerId: 12, title: "Data Cleanup Spreadsheet Challenge", completion: 65, status: "in-progress" },
  { learnerId: 13, title: "Support Ticket Troubleshooting Exercise", completion: 15, status: "in-progress" },
  { learnerId: 14, title: "Customer Onboarding Simulation", completion: 100, status: "completed" },
  { learnerId: 14, title: "CRM Workflow Mapping Exercise", completion: 80, status: "in-progress" },
  { learnerId: 15, title: "CRM Workflow Mapping Exercise", completion: 0, status: "in-progress" },
  { learnerId: 16, title: "Data Cleanup Spreadsheet Challenge", completion: 100, status: "completed" },
  { learnerId: 16, title: "Interview Story Builder", completion: 50, status: "in-progress" },
  { learnerId: 17, title: "Customer Onboarding Simulation", completion: 25, status: "in-progress" },
  { learnerId: 18, title: "Support Ticket Troubleshooting Exercise", completion: 90, status: "in-progress" },
  { learnerId: 18, title: "Interview Story Builder", completion: 60, status: "in-progress" },
  { learnerId: 19, title: "Data Cleanup Spreadsheet Challenge", completion: 10, status: "in-progress" },
  { learnerId: 20, title: "CRM Workflow Mapping Exercise", completion: 100, status: "completed" },
  { learnerId: 20, title: "Interview Story Builder", completion: 100, status: "completed" },
];

const events = [
  { learnerId: 1, title: "Resume Translation Workshop", date: "Apr 18, 2025", status: "attended" },
  { learnerId: 1, title: "Mock Interview Night", date: "May 17, 2025", status: "upcoming" },
  { learnerId: 2, title: "Tech Career Orientation", date: "Feb 7, 2025", status: "attended" },
  { learnerId: 2, title: "Help Desk Skills Workshop", date: "May 22, 2025", status: "upcoming" },
  { learnerId: 3, title: "Data Careers Panel", date: "Mar 14, 2025", status: "attended" },
  { learnerId: 3, title: "Employer Networking Mixer", date: "Apr 25, 2025", status: "attended" },
  { learnerId: 3, title: "Job Fair Prep Session", date: "May 20, 2025", status: "upcoming" },
  { learnerId: 4, title: "Resume Translation Workshop", date: "Apr 18, 2025", status: "attended" },
  { learnerId: 4, title: "Customer Success Panel", date: "May 15, 2025", status: "upcoming" },
  { learnerId: 5, title: "Tech Career Orientation", date: "Feb 7, 2025", status: "attended" },
  { learnerId: 5, title: "CompTIA Study Group", date: "May 19, 2025", status: "upcoming" },
  { learnerId: 6, title: "Tech Career Orientation", date: "Feb 14, 2025", status: "attended" },
  { learnerId: 7, title: "Resume Translation Workshop", date: "Apr 18, 2025", status: "attended" },
  { learnerId: 7, title: "Mock Interview Night", date: "May 17, 2025", status: "upcoming" },
  { learnerId: 7, title: "Employer Networking Mixer", date: "Apr 25, 2025", status: "attended" },
  { learnerId: 8, title: "Data Careers Panel", date: "Mar 14, 2025", status: "attended" },
  { learnerId: 8, title: "Spreadsheet Skills Workshop", date: "May 23, 2025", status: "upcoming" },
  { learnerId: 9, title: "Customer Success Panel", date: "Mar 21, 2025", status: "attended" },
  { learnerId: 9, title: "Mock Interview Night", date: "May 17, 2025", status: "upcoming" },
  { learnerId: 10, title: "PM Tools Workshop", date: "Mar 28, 2025", status: "attended" },
  { learnerId: 10, title: "Project Showcase Prep", date: "May 25, 2025", status: "upcoming" },
  { learnerId: 11, title: "Tech Career Orientation", date: "Dec 20, 2024", status: "attended" },
  { learnerId: 11, title: "Employer Networking Mixer", date: "Apr 25, 2025", status: "attended" },
  { learnerId: 11, title: "Job Fair", date: "May 30, 2025", status: "upcoming" },
  { learnerId: 12, title: "Data Careers Panel", date: "Mar 14, 2025", status: "attended" },
  { learnerId: 13, title: "Tech Career Orientation", date: "Feb 21, 2025", status: "attended" },
  { learnerId: 13, title: "Help Desk Skills Workshop", date: "May 22, 2025", status: "upcoming" },
  { learnerId: 14, title: "Customer Success Panel", date: "Mar 21, 2025", status: "attended" },
  { learnerId: 14, title: "Resume Translation Workshop", date: "Apr 18, 2025", status: "attended" },
  { learnerId: 14, title: "Mock Interview Night", date: "May 17, 2025", status: "upcoming" },
  { learnerId: 15, title: "Tech Career Orientation", date: "Mar 7, 2025", status: "attended" },
  { learnerId: 16, title: "Data Careers Panel", date: "Mar 14, 2025", status: "attended" },
  { learnerId: 16, title: "Spreadsheet Skills Workshop", date: "May 23, 2025", status: "upcoming" },
  { learnerId: 17, title: "Customer Success Panel", date: "Mar 21, 2025", status: "attended" },
  { learnerId: 18, title: "Tech Career Orientation", date: "Jan 17, 2025", status: "attended" },
  { learnerId: 18, title: "CompTIA Study Group", date: "May 19, 2025", status: "upcoming" },
  { learnerId: 18, title: "Employer Networking Mixer", date: "Apr 25, 2025", status: "attended" },
  { learnerId: 19, title: "Data Careers Panel", date: "Mar 14, 2025", status: "attended" },
  { learnerId: 20, title: "PM Tools Workshop", date: "Jan 24, 2025", status: "attended" },
  { learnerId: 20, title: "Employer Networking Mixer", date: "Apr 25, 2025", status: "attended" },
  { learnerId: 20, title: "Job Fair", date: "May 30, 2025", status: "upcoming" },
];

const notes = [
  { learnerId: 1, author: "Denise Carter", date: "May 10, 2025", content: "Maya is making great progress on the CRM module. She mentioned feeling more confident about her transferable skills from retail. Recommended she attend Mock Interview Night." },
  { learnerId: 2, author: "Raymond Brooks", date: "May 8, 2025", content: "Jordan missed our last check-in. Sent follow-up email. He mentioned work schedule conflicts—may need to adjust session times." },
  { learnerId: 3, author: "Denise Carter", date: "May 12, 2025", content: "Tasha is placement ready. Her portfolio is strong and she's actively applying. Connected her with two employer contacts." },
  { learnerId: 6, author: "Raymond Brooks", date: "May 5, 2025", content: "Darius has gone quiet. Multiple outreach attempts with no response. Will try phone call next week. Flagging for program manager review." },
  { learnerId: 7, author: "Denise Carter", date: "May 14, 2025", content: "Monique crushed her mock interview. Feedback from panelists was overwhelmingly positive. She's ready for employer introductions." },
  { learnerId: 8, author: "Alicia Monroe", date: "May 7, 2025", content: "Marcus is struggling with the data cleanup project. Scheduled extra tutoring session for spreadsheet formulas. He's motivated but needs more support." },
  { learnerId: 11, author: "Marcus Webb", date: "May 13, 2025", content: "Renee passed her technical assessment with flying colors. She's one of our strongest candidates this cohort. Scheduling employer info sessions." },
  { learnerId: 13, author: "Alicia Monroe", date: "May 9, 2025", content: "Brandon is falling behind. He expressed frustration with the technical content. Exploring whether a different pathway might be a better fit." },
  { learnerId: 15, author: "Marcus Webb", date: "May 6, 2025", content: "Crystal has not responded to any outreach in over a week. May need to consider program pause if we can't re-engage by end of month." },
  { learnerId: 19, author: "David Park", date: "May 11, 2025", content: "Fatima is dealing with childcare challenges that are affecting attendance. Exploring flexible scheduling options and connecting with support services." },
];

const readinessScores = [
  { learnerId: 1, dimension: "Resume", score: 78 }, { learnerId: 1, dimension: "Interview", score: 65 }, { learnerId: 1, dimension: "Portfolio", score: 70 }, { learnerId: 1, dimension: "Technical Confidence", score: 68 }, { learnerId: 1, dimension: "Communication", score: 80 },
  { learnerId: 2, dimension: "Resume", score: 45 }, { learnerId: 2, dimension: "Interview", score: 40 }, { learnerId: 2, dimension: "Portfolio", score: 50 }, { learnerId: 2, dimension: "Technical Confidence", score: 55 }, { learnerId: 2, dimension: "Communication", score: 60 },
  { learnerId: 3, dimension: "Resume", score: 90 }, { learnerId: 3, dimension: "Interview", score: 82 }, { learnerId: 3, dimension: "Portfolio", score: 88 }, { learnerId: 3, dimension: "Technical Confidence", score: 80 }, { learnerId: 3, dimension: "Communication", score: 85 },
  { learnerId: 4, dimension: "Resume", score: 72 }, { learnerId: 4, dimension: "Interview", score: 65 }, { learnerId: 4, dimension: "Portfolio", score: 68 }, { learnerId: 4, dimension: "Technical Confidence", score: 62 }, { learnerId: 4, dimension: "Communication", score: 78 },
  { learnerId: 5, dimension: "Resume", score: 58 }, { learnerId: 5, dimension: "Interview", score: 52 }, { learnerId: 5, dimension: "Portfolio", score: 55 }, { learnerId: 5, dimension: "Technical Confidence", score: 65 }, { learnerId: 5, dimension: "Communication", score: 60 },
  { learnerId: 6, dimension: "Resume", score: 35 }, { learnerId: 6, dimension: "Interview", score: 30 }, { learnerId: 6, dimension: "Portfolio", score: 38 }, { learnerId: 6, dimension: "Technical Confidence", score: 42 }, { learnerId: 6, dimension: "Communication", score: 45 },
  { learnerId: 7, dimension: "Resume", score: 88 }, { learnerId: 7, dimension: "Interview", score: 85 }, { learnerId: 7, dimension: "Portfolio", score: 82 }, { learnerId: 7, dimension: "Technical Confidence", score: 78 }, { learnerId: 7, dimension: "Communication", score: 92 },
  { learnerId: 8, dimension: "Resume", score: 50 }, { learnerId: 8, dimension: "Interview", score: 45 }, { learnerId: 8, dimension: "Portfolio", score: 48 }, { learnerId: 8, dimension: "Technical Confidence", score: 55 }, { learnerId: 8, dimension: "Communication", score: 58 },
  { learnerId: 9, dimension: "Resume", score: 70 }, { learnerId: 9, dimension: "Interview", score: 62 }, { learnerId: 9, dimension: "Portfolio", score: 65 }, { learnerId: 9, dimension: "Technical Confidence", score: 68 }, { learnerId: 9, dimension: "Communication", score: 75 },
  { learnerId: 10, dimension: "Resume", score: 65 }, { learnerId: 10, dimension: "Interview", score: 58 }, { learnerId: 10, dimension: "Portfolio", score: 60 }, { learnerId: 10, dimension: "Technical Confidence", score: 62 }, { learnerId: 10, dimension: "Communication", score: 70 },
  { learnerId: 11, dimension: "Resume", score: 92 }, { learnerId: 11, dimension: "Interview", score: 85 }, { learnerId: 11, dimension: "Portfolio", score: 90 }, { learnerId: 11, dimension: "Technical Confidence", score: 88 }, { learnerId: 11, dimension: "Communication", score: 82 },
  { learnerId: 12, dimension: "Resume", score: 55 }, { learnerId: 12, dimension: "Interview", score: 50 }, { learnerId: 12, dimension: "Portfolio", score: 58 }, { learnerId: 12, dimension: "Technical Confidence", score: 62 }, { learnerId: 12, dimension: "Communication", score: 60 },
  { learnerId: 13, dimension: "Resume", score: 38 }, { learnerId: 13, dimension: "Interview", score: 35 }, { learnerId: 13, dimension: "Portfolio", score: 40 }, { learnerId: 13, dimension: "Technical Confidence", score: 45 }, { learnerId: 13, dimension: "Communication", score: 50 },
  { learnerId: 14, dimension: "Resume", score: 80 }, { learnerId: 14, dimension: "Interview", score: 72 }, { learnerId: 14, dimension: "Portfolio", score: 75 }, { learnerId: 14, dimension: "Technical Confidence", score: 70 }, { learnerId: 14, dimension: "Communication", score: 78 },
  { learnerId: 15, dimension: "Resume", score: 30 }, { learnerId: 15, dimension: "Interview", score: 32 }, { learnerId: 15, dimension: "Portfolio", score: 35 }, { learnerId: 15, dimension: "Technical Confidence", score: 38 }, { learnerId: 15, dimension: "Communication", score: 40 },
  { learnerId: 16, dimension: "Resume", score: 72 }, { learnerId: 16, dimension: "Interview", score: 68 }, { learnerId: 16, dimension: "Portfolio", score: 75 }, { learnerId: 16, dimension: "Technical Confidence", score: 70 }, { learnerId: 16, dimension: "Communication", score: 74 },
  { learnerId: 17, dimension: "Resume", score: 48 }, { learnerId: 17, dimension: "Interview", score: 42 }, { learnerId: 17, dimension: "Portfolio", score: 45 }, { learnerId: 17, dimension: "Technical Confidence", score: 52 }, { learnerId: 17, dimension: "Communication", score: 58 },
  { learnerId: 18, dimension: "Resume", score: 72 }, { learnerId: 18, dimension: "Interview", score: 65 }, { learnerId: 18, dimension: "Portfolio", score: 68 }, { learnerId: 18, dimension: "Technical Confidence", score: 75 }, { learnerId: 18, dimension: "Communication", score: 70 },
  { learnerId: 19, dimension: "Resume", score: 35 }, { learnerId: 19, dimension: "Interview", score: 32 }, { learnerId: 19, dimension: "Portfolio", score: 38 }, { learnerId: 19, dimension: "Technical Confidence", score: 40 }, { learnerId: 19, dimension: "Communication", score: 42 },
  { learnerId: 20, dimension: "Resume", score: 95 }, { learnerId: 20, dimension: "Interview", score: 90 }, { learnerId: 20, dimension: "Portfolio", score: 92 }, { learnerId: 20, dimension: "Technical Confidence", score: 88 }, { learnerId: 20, dimension: "Communication", score: 95 },
];

const activities = [
  { learnerId: 1, date: "May 15, 2025", event: "Completed CRM module quiz", type: "milestone" },
  { learnerId: 1, date: "May 10, 2025", event: "Coach note added by Denise Carter", type: "note" },
  { learnerId: 2, date: "May 12, 2025", event: "Logged in and reviewed help desk materials", type: "login" },
  { learnerId: 3, date: "May 14, 2025", event: "Submitted final portfolio for review", type: "milestone" },
  { learnerId: 3, date: "May 12, 2025", event: "Attended employer networking mixer", type: "event" },
  { learnerId: 4, date: "May 13, 2025", event: "Started customer onboarding simulation", type: "milestone" },
  { learnerId: 5, date: "May 12, 2025", event: "Completed CompTIA A+ Module 1 assessment", type: "milestone" },
  { learnerId: 5, date: "May 10, 2025", event: "Logged in and reviewed study materials", type: "login" },
  { learnerId: 6, date: "May 8, 2025", event: "Logged in briefly", type: "login" },
  { learnerId: 7, date: "May 15, 2025", event: "Completed mock interview with positive feedback", type: "milestone" },
  { learnerId: 7, date: "May 13, 2025", event: "Updated resume with coach feedback", type: "milestone" },
  { learnerId: 8, date: "May 10, 2025", event: "Scheduled tutoring session for spreadsheets", type: "note" },
  { learnerId: 9, date: "May 14, 2025", event: "Completed CRM onboarding simulation", type: "milestone" },
  { learnerId: 10, date: "May 13, 2025", event: "Started project simulation exercise", type: "milestone" },
  { learnerId: 11, date: "May 14, 2025", event: "Passed technical assessment", type: "milestone" },
  { learnerId: 11, date: "May 13, 2025", event: "Attended employer info session", type: "event" },
  { learnerId: 12, date: "May 12, 2025", event: "Submitted SQL basics quiz", type: "milestone" },
  { learnerId: 13, date: "May 9, 2025", event: "Coach note: exploring pathway options", type: "note" },
  { learnerId: 14, date: "May 14, 2025", event: "Drafted portfolio project summary", type: "milestone" },
  { learnerId: 14, date: "May 12, 2025", event: "Attended resume workshop", type: "event" },
  { learnerId: 15, date: "May 3, 2025", event: "Last login recorded", type: "login" },
  { learnerId: 16, date: "May 13, 2025", event: "Working on reporting dashboard project", type: "milestone" },
  { learnerId: 17, date: "May 11, 2025", event: "Logged in and reviewed CRM materials", type: "login" },
  { learnerId: 18, date: "May 14, 2025", event: "Completed support ticket exercise", type: "milestone" },
  { learnerId: 18, date: "May 12, 2025", event: "Attended employer networking mixer", type: "event" },
  { learnerId: 19, date: "May 8, 2025", event: "Logged in briefly to check schedule", type: "login" },
  { learnerId: 20, date: "May 15, 2025", event: "Received employer interview invitation", type: "milestone" },
  { learnerId: 20, date: "May 14, 2025", event: "Portfolio marked as complete by coach", type: "note" },
];

const fundingSources = [
  { name: "City of Atlanta Workforce Innovation Grant", amount: "500000", startDate: "2025-01-01", endDate: "2025-12-31", objectives: "Fund 30 learners through tech career pathways", narrative: "This grant supports workforce development for underrepresented communities in metro Atlanta, providing training, coaching, and job placement assistance for residents transitioning into technology careers.", learnerCount: 30 },
  { name: "Tech Forward Initiative", amount: "250000", startDate: "2025-02-01", endDate: "2025-08-31", objectives: "Accelerate customer success career transitions", narrative: "A partnership with regional tech employers to fast-track career changers into customer success and client-facing technology roles.", learnerCount: 20 },
  { name: "Corporate Partners Fund", amount: "175000", startDate: "2024-12-01", endDate: "2025-06-30", objectives: "Support data operations training", narrative: "Pooled corporate funding to support data literacy and operations training for Atlanta residents seeking entry-level analyst positions.", learnerCount: 15 },
];

const fundingSourceGoals = [
  { fundingSourceId: 1, title: "Train 30 learners to job-ready status", status: "in_progress", note: "Currently at 18 of 30 learners on track for completion" },
  { fundingSourceId: 1, title: "Achieve 70% program completion rate", status: "in_progress", note: "Current completion rate is 67% across funded learners" },
  { fundingSourceId: 1, title: "Place 15 learners in tech roles", status: "not_started", note: "Placement phase begins after program completion" },
  { fundingSourceId: 1, title: "Host 6 employer networking events", status: "completed", note: "All 6 events completed with strong attendance" },
  { fundingSourceId: 2, title: "Enroll 20 learners in customer success pathway", status: "completed", note: "20 learners enrolled as of February 2025" },
  { fundingSourceId: 2, title: "Achieve 80% learner engagement rate", status: "in_progress", note: "Currently tracking at 72% weekly engagement" },
  { fundingSourceId: 2, title: "Connect 10 learners with employer mentors", status: "in_progress", note: "7 of 10 mentor matches completed" },
  { fundingSourceId: 3, title: "Graduate 15 learners from data operations program", status: "in_progress", note: "8 learners on track for graduation, 4 need additional support" },
  { fundingSourceId: 3, title: "Achieve 85% portfolio completion rate", status: "not_started", note: "Portfolio phase begins in final 4 weeks of program" },
  { fundingSourceId: 3, title: "Partner with 5 local employers for hiring pipeline", status: "completed", note: "Partnerships established with 5 Atlanta-area companies" },
];

const successStories = [
  {
    learnerId: 3,
    learnerName: "Tasha Green",
    headline: "From Administrative Assistant to Data Operations Analyst",
    story: "Tasha joined the Data Operations Starter program after 7 years in administrative roles. Through dedicated study and hands-on projects, she mastered spreadsheet analysis, data cleaning, and basic SQL. Her portfolio project on inventory data optimization caught the attention of a local logistics company, and she's now interviewing for a Junior Data Analyst position.",
    dataPoints: [{ label: "Program Duration", value: "22 weeks" }, { label: "Portfolio Projects", value: "3 completed" }, { label: "Readiness Score", value: "84%" }, { label: "Employer Connections", value: "2 interviews scheduled" }],
    tags: ["Data Operations", "Career Changer", "Portfolio Excellence"],
  },
  {
    learnerId: 20,
    learnerName: "Jasmine Parker",
    headline: "Office Manager to Project Coordinator in Tech",
    story: "Jasmine leveraged her 8 years of office management experience to transition into a project coordination role in the tech sector. The Tech Career Launch program helped her formalize her skills with modern PM tools and build a portfolio of simulated projects. Her strong communication skills and organizational abilities made her a standout candidate.",
    dataPoints: [{ label: "Program Duration", value: "20 weeks" }, { label: "Progress", value: "95%" }, { label: "Readiness Score", value: "92%" }, { label: "Tools Mastered", value: "Asana, Monday.com, Slack" }],
    tags: ["Project Management", "Tech Career Launch", "Leadership"],
  },
  {
    learnerId: 11,
    learnerName: "Renee Simmons",
    headline: "Career Changer Excels in IT Support Pathway",
    story: "Renee came to the program with no formal IT background but a natural aptitude for problem-solving. Within 20 weeks, she completed the CompTIA A+ fundamentals, mastered ticketing systems, and passed her technical assessment with one of the highest scores in the cohort. She's now preparing for employer interviews with two Atlanta tech companies.",
    dataPoints: [{ label: "Technical Assessment", value: "Top 5% of cohort" }, { label: "Progress", value: "90%" }, { label: "Readiness Score", value: "88%" }, { label: "Employer Matches", value: "2 companies" }],
    tags: ["IT Support", "High Achiever", "Career Changer"],
  },
];

async function seedDatabase() {
  console.log("🌱 Starting database seed...");

  try {
    // Delete in reverse FK order
    console.log("Clearing existing data...");
    await db.delete(successStoriesTable);
    await db.delete(fundingSourceGoalsTable);
    await db.delete(fundingSourcesTable);
    await db.delete(learnerActivitiesTable);
    await db.delete(learnerReadinessScoresTable);
    await db.delete(learnerNotesTable);
    await db.delete(learnerEventsTable);
    await db.delete(learnerProjectsTable);
    await db.delete(learnerRoadmapsTable);
    await db.delete(learnersTable);
    await db.delete(pathwaysTable);
    await db.delete(programsTable);
    await db.delete(coachesTable);
    console.log("✅ Existing data cleared");

    console.log("Inserting coaches...");
    await db.insert(coachesTable).values(coaches);
    console.log("✅ Coaches inserted");

    console.log("Inserting programs...");
    await db.insert(programsTable).values(programs);
    console.log("✅ Programs inserted");

    console.log("Inserting pathways...");
    await db.insert(pathwaysTable).values(pathways);
    console.log("✅ Pathways inserted");

    console.log("Inserting learners...");
    await db.insert(learnersTable).values(learners);
    console.log("✅ Learners inserted");

    console.log("Inserting roadmaps...");
    await db.insert(learnerRoadmapsTable).values(roadmaps);
    console.log("✅ Roadmaps inserted");

    console.log("Inserting projects...");
    await db.insert(learnerProjectsTable).values(projects);
    console.log("✅ Projects inserted");

    console.log("Inserting events...");
    await db.insert(learnerEventsTable).values(events);
    console.log("✅ Events inserted");

    console.log("Inserting notes...");
    await db.insert(learnerNotesTable).values(notes);
    console.log("✅ Notes inserted");

    console.log("Inserting readiness scores...");
    await db.insert(learnerReadinessScoresTable).values(readinessScores);
    console.log("✅ Readiness scores inserted");

    console.log("Inserting activities...");
    await db.insert(learnerActivitiesTable).values(activities);
    console.log("✅ Activities inserted");

    console.log("Inserting funding sources...");
    await db.insert(fundingSourcesTable).values(fundingSources);
    console.log("✅ Funding sources inserted");

    console.log("Inserting funding source goals...");
    await db.insert(fundingSourceGoalsTable).values(fundingSourceGoals);
    console.log("✅ Funding source goals inserted");

    console.log("Inserting success stories...");
    await db.insert(successStoriesTable).values(successStories);
    console.log("✅ Success stories inserted");

    console.log("\n🎉 Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
