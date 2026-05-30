CREATE TABLE "coaches" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"role" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"learnersCount" integer NOT NULL,
	"atRisk" integer NOT NULL,
	"workload" varchar(50) NOT NULL,
	"upcomingCheckIns" integer NOT NULL,
	"overdueCheckIns" integer NOT NULL,
	"assignedLearners" jsonb,
	CONSTRAINT "coaches_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "funding_source_learners" (
	"id" serial PRIMARY KEY NOT NULL,
	"funding_source_id" integer NOT NULL,
	"learner_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "funding_source_pathways" (
	"id" serial PRIMARY KEY NOT NULL,
	"funding_source_id" integer NOT NULL,
	"pathway_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "funding_source_programs" (
	"id" serial PRIMARY KEY NOT NULL,
	"funding_source_id" integer NOT NULL,
	"program_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "funding_sources" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"objectives" text,
	"start_date" date,
	"end_date" date,
	"amount" numeric(12, 2),
	"learner_count" integer,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "learner_activities" (
	"id" serial PRIMARY KEY NOT NULL,
	"learnerId" integer NOT NULL,
	"date" varchar(255) NOT NULL,
	"event" text NOT NULL,
	"type" varchar(50) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "learner_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"learnerId" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"date" varchar(255) NOT NULL,
	"status" varchar(50) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "learner_notes" (
	"id" serial PRIMARY KEY NOT NULL,
	"learnerId" integer NOT NULL,
	"author" varchar(255) NOT NULL,
	"date" varchar(255) NOT NULL,
	"content" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "learner_projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"learnerId" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"completion" integer NOT NULL,
	"status" varchar(50) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "learner_readiness_scores" (
	"id" serial PRIMARY KEY NOT NULL,
	"learnerId" integer NOT NULL,
	"dimension" varchar(255) NOT NULL,
	"score" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "learner_roadmaps" (
	"id" serial PRIMARY KEY NOT NULL,
	"learnerId" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"state" varchar(50) NOT NULL,
	"dueDate" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "learners" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"pathway" varchar(255) NOT NULL,
	"program" varchar(255) NOT NULL,
	"coach" varchar(255) NOT NULL,
	"progress" integer NOT NULL,
	"readiness" integer NOT NULL,
	"status" varchar(50) NOT NULL,
	"lastActive" varchar(255) NOT NULL,
	"nextAction" varchar(255) NOT NULL,
	"joinDate" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"photo" varchar(255),
	"background" text,
	"strengths" jsonb,
	"risks" jsonb,
	"profileStrength" integer,
	CONSTRAINT "learners_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "pathways" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"targetProfile" text NOT NULL,
	"estimatedWeeks" integer NOT NULL,
	"activeLearners" integer NOT NULL,
	"skills" jsonb,
	"milestones" jsonb,
	"projects" jsonb,
	"readinessCriteria" jsonb
);
--> statement-breakpoint
CREATE TABLE "programs" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"pathwayCategory" varchar(255) NOT NULL,
	"activeLearners" integer NOT NULL,
	"completionRate" integer NOT NULL,
	"readinessScore" integer NOT NULL,
	"eventParticipation" integer NOT NULL,
	"placementReady" integer NOT NULL,
	"funderTag" varchar(255) NOT NULL,
	"cohort" varchar(255) NOT NULL,
	"startDate" varchar(255) NOT NULL,
	"endDate" varchar(255) NOT NULL,
	"pathways" jsonb
);
--> statement-breakpoint
ALTER TABLE "funding_source_learners" ADD CONSTRAINT "funding_source_learners_funding_source_id_funding_sources_id_fk" FOREIGN KEY ("funding_source_id") REFERENCES "public"."funding_sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "funding_source_learners" ADD CONSTRAINT "funding_source_learners_learner_id_learners_id_fk" FOREIGN KEY ("learner_id") REFERENCES "public"."learners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "funding_source_pathways" ADD CONSTRAINT "funding_source_pathways_funding_source_id_funding_sources_id_fk" FOREIGN KEY ("funding_source_id") REFERENCES "public"."funding_sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "funding_source_pathways" ADD CONSTRAINT "funding_source_pathways_pathway_id_pathways_id_fk" FOREIGN KEY ("pathway_id") REFERENCES "public"."pathways"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "funding_source_programs" ADD CONSTRAINT "funding_source_programs_funding_source_id_funding_sources_id_fk" FOREIGN KEY ("funding_source_id") REFERENCES "public"."funding_sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "funding_source_programs" ADD CONSTRAINT "funding_source_programs_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learner_activities" ADD CONSTRAINT "learner_activities_learnerId_learners_id_fk" FOREIGN KEY ("learnerId") REFERENCES "public"."learners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learner_events" ADD CONSTRAINT "learner_events_learnerId_learners_id_fk" FOREIGN KEY ("learnerId") REFERENCES "public"."learners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learner_notes" ADD CONSTRAINT "learner_notes_learnerId_learners_id_fk" FOREIGN KEY ("learnerId") REFERENCES "public"."learners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learner_projects" ADD CONSTRAINT "learner_projects_learnerId_learners_id_fk" FOREIGN KEY ("learnerId") REFERENCES "public"."learners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learner_readiness_scores" ADD CONSTRAINT "learner_readiness_scores_learnerId_learners_id_fk" FOREIGN KEY ("learnerId") REFERENCES "public"."learners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learner_roadmaps" ADD CONSTRAINT "learner_roadmaps_learnerId_learners_id_fk" FOREIGN KEY ("learnerId") REFERENCES "public"."learners"("id") ON DELETE cascade ON UPDATE no action;