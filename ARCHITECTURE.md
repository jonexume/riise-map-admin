# RiiseMap — Architecture & Tech Stack

## Overview

RiiseMap is a SaaS platform for funded organizations to manage programs, track learner progress, and generate impact reports for funders. The current deployment is the **organization admin MVP** — a single-tenant web application with a REST API backend.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      End Users                          │
│                  (Browser / Desktop)                    │
└──────────────────────┬──────────────────────────────────┘
                       │
          ┌────────────┴────────────┐
          │                         │
┌─────────▼──────────┐   ┌─────────▼──────────┐
│   AWS Amplify      │   │  API Gateway (HTTP) │
│   (Static SPA)     │   │  + AWS Lambda       │
│                    │   │  (Express.js)       │
│   React Frontend   │   │                     │
│   Vite Build       │   │  SAM-deployed       │
└────────────────────┘   └─────────┬───────────┘
                                   │
                         ┌─────────▼───────────┐
                         │  Supabase           │
                         │  PostgreSQL         │
                         │  (Pooled via port   │
                         │   6543)             │
                         └─────────────────────┘
                                   │
                         ┌─────────▼───────────┐
                         │  Supabase Auth      │
                         │  (JWT tokens)       │
                         └─────────────────────┘
```

---

## Tech Stack

### Frontend

| Component | Technology |
|-----------|-----------|
| Framework | React 18 |
| Build Tool | Vite 7 |
| Language | TypeScript |
| UI Components | shadcn/ui (Radix primitives + Tailwind) |
| Styling | Tailwind CSS 4 |
| Routing | Wouter (lightweight client-side router) |
| State/Data Fetching | TanStack React Query |
| API Client | Generated via Orval from OpenAPI spec |
| Charts | Recharts (used on Impact Report) |
| Form Validation | Zod |
| CSV Parsing | PapaParse |

### Backend (API Server)

| Component | Technology |
|-----------|-----------|
| Runtime | Node.js 20 |
| Framework | Express 5 |
| Language | TypeScript |
| ORM | Drizzle ORM |
| Schema Validation | Zod (via drizzle-zod) |
| Logging | Pino + pino-http |
| Bundler | esbuild |
| Lambda Adapter | serverless-http |

### Database

| Component | Technology |
|-----------|-----------|
| Database | PostgreSQL (via Supabase) |
| Connection | Pooled connection on port 6543 |
| Migrations | Drizzle Kit (push-based) |
| Schema | 16 tables (see Data Model below) |

### Authentication

| Component | Technology |
|-----------|-----------|
| Provider | Supabase Auth |
| Token Format | JWT (Bearer token) |
| Verification | Server-side via Supabase `/auth/v1/user` endpoint |
| Frontend SDK | @supabase/supabase-js |

---

## Infrastructure

### Hosting & Deployment

| Service | Purpose | Account |
|---------|---------|---------|
| AWS Amplify | Frontend hosting (static SPA) | 991258367031 |
| AWS Lambda | API compute (Express wrapped in serverless-http) | 991258367031 |
| AWS API Gateway (HTTP API) | API routing, CORS | 991258367031 |
| AWS S3 | SAM deployment artifacts | 991258367031 |
| AWS CloudFormation | Infrastructure as Code (via SAM) | 991258367031 |
| Supabase | PostgreSQL database + Auth | External |
| GitHub | Source control | lawscause/Riise-Map-Admin |

### CI/CD Pipeline

```
GitHub Push (rollback-may27 branch)
       │
       ▼
GitHub Actions Workflow (.github/workflows/deploy-api.yml)
       │
       ├── Checkout code
       ├── Setup Node.js 20
       ├── Setup AWS SAM CLI
       ├── Configure AWS credentials
       ├── Install dependencies (pnpm)
       ├── Build Lambda bundle (esbuild)
       └── sam deploy → CloudFormation stack update
```

**Frontend deployment** is handled separately by AWS Amplify, which watches the same branch and rebuilds on push.

### SAM Template (template.yaml)

Provisions:
- `AWS::Serverless::Function` — Lambda function (Node.js 20, 512MB, 30s timeout)
- `AWS::Serverless::HttpApi` — HTTP API Gateway with CORS (all origins)

Parameters passed at deploy:
- `DatabaseUrl` — Supabase PostgreSQL connection string
- `SupabaseUrl` — Supabase project URL
- `SupabaseServiceRoleKey` — Service role key for auth verification
- `Stage` — Deployment stage (prod)

---

## Data Model

### Core Tables

| Table | Purpose | Records |
|-------|---------|---------|
| `learners` | Enrolled participants | ~100 |
| `programs` | Funded initiatives | ~10 |
| `pathways` | Career tracks within programs | ~10 |
| `funding_sources` | Grants and funding entities | ~11 |
| `funding_source_goals` | Objectives per funding source | ~50 |
| `learner_statuses` | System reference: status options | 9 |

### Relationship Tables

| Table | Purpose |
|-------|---------|
| `pathway_programs` | Many-to-many: pathways ↔ programs |
| `funding_source_learners` | Many-to-many: funding sources ↔ learners |
| `funding_source_programs` | Many-to-many: funding sources ↔ programs |
| `funding_source_pathways` | Many-to-many: funding sources ↔ pathways |

### Learner Detail Tables (schema exists, not actively populated)

| Table | Purpose |
|-------|---------|
| `learner_roadmaps` | Milestone tracking |
| `learner_projects` | Applied learning projects |
| `learner_events` | Event attendance |
| `learner_notes` | Coach/admin notes |
| `learner_readiness_scores` | Per-dimension readiness |
| `learner_activities` | Activity log |

### Other

| Table | Purpose |
|-------|---------|
| `success_stories` | Impact narratives (schema only) |
| `coaches` | Coach profiles (schema only) |

---

## API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/learners` | List all learners |
| POST | `/api/learners` | Create learner |
| PUT | `/api/learners/:id` | Update learner |
| DELETE | `/api/learners/:id` | Delete learner |
| POST | `/api/learners/import` | Bulk import from CSV |
| POST | `/api/learners/bulk-delete` | Bulk delete |
| GET | `/api/learners/:id/summary` | Learner summary for stories |
| GET | `/api/programs` | List programs |
| POST | `/api/programs` | Create program |
| PUT | `/api/programs/:id` | Update program |
| DELETE | `/api/programs/:id` | Delete program |
| POST | `/api/programs/import` | Bulk import |
| POST | `/api/programs/bulk-delete` | Bulk delete |
| GET | `/api/pathways` | List pathways |
| POST | `/api/pathways` | Create pathway |
| PUT | `/api/pathways/:id` | Update pathway |
| DELETE | `/api/pathways/:id` | Delete pathway |
| POST | `/api/pathways/import` | Bulk import |
| GET | `/api/pathways/:id/programs` | Get linked programs |
| PUT | `/api/pathways/:id/programs` | Set linked programs |
| GET | `/api/pathway-programs` | All pathway-program links |
| GET | `/api/funding-sources` | List funding sources |
| POST | `/api/funding-sources` | Create funding source |
| PUT | `/api/funding-sources/:id` | Update funding source |
| DELETE | `/api/funding-sources/:id` | Delete funding source |
| GET | `/api/funding-source-goals` | All goals (all sources) |
| GET | `/api/funding-sources/:id/goals` | Goals for one source |
| POST | `/api/funding-sources/:id/goals` | Create goal |
| PUT | `/api/funding-sources/:id/goals/:gid` | Update goal |
| DELETE | `/api/funding-sources/:id/goals/:gid` | Delete goal |
| GET | `/api/learner-statuses` | List status options |
| GET | `/api/dashboard-priorities` | Computed priorities |
| POST | `/api/reset-workspace` | Truncate all user data |
| GET | `/` | Health check |

---

## Monorepo Structure

```
Riise-Map-Admin/
├── artifacts/
│   ├── api-server/          # Express API (Lambda)
│   │   ├── src/routes/      # Route handlers
│   │   ├── build.mjs        # esbuild config
│   │   └── dist-lambda/     # Built Lambda bundle
│   └── riisemap/            # React frontend
│       ├── src/pages/       # Page components
│       ├── src/components/  # Shared UI components
│       └── src/lib/         # Utilities (auth, supabase)
├── lib/
│   ├── db/                  # Drizzle schema + migrations
│   ├── api-client-react/    # Generated React Query hooks
│   ├── api-zod/             # Generated Zod schemas
│   └── api-spec/            # OpenAPI specification
├── template.yaml            # SAM infrastructure template
├── amplify.yml              # Amplify build config
└── .github/workflows/       # CI/CD pipeline
```

---

## Environment Variables

### Lambda (production)

| Variable | Source |
|----------|--------|
| `DATABASE_URL` | Supabase pooled connection string |
| `SUPABASE_URL` | `https://lmirhhmprmotogdyubyv.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role JWT |
| `NODE_ENV` | `production` |
| `STAGE` | `prod` |

### Frontend (Amplify build)

| Variable | Purpose |
|----------|---------|
| `VITE_API_URL` | API Gateway endpoint URL |
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key |

---

## Security

- All API routes (except health check) require a valid Supabase JWT token
- Auth middleware verifies tokens via Supabase's `/auth/v1/user` endpoint
- CORS allows all origins (suitable for MVP; restrict in production)
- Sensitive parameters (`DatabaseUrl`, `SupabaseServiceRoleKey`) are marked `NoEcho` in CloudFormation
- GitHub secrets store credentials for CI/CD
