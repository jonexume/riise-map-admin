# RiiseMap Admin — Architecture, Tech Stack & Infrastructure

## Overview

RiiseMap Admin is a single-tenant SaaS admin platform for funded organizations to manage programs, track learner progress, and generate impact reports for funders. It is structured as a pnpm monorepo with a React SPA frontend, an Express API running on AWS Lambda, and a PostgreSQL database hosted on Supabase.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         End Users (Browser)                         │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
              ┌────────────────┴────────────────┐
              │                                 │
┌─────────────▼─────────────┐     ┌────────────▼────────────────┐
│    AWS Amplify Hosting     │     │   AWS API Gateway (HTTP)    │
│    (CloudFront + S3)       │     │         + Lambda            │
│                            │     │    (Express via             │
│    Static SPA              │     │     serverless-http)        │
│    React + Vite build      │     │                            │
└────────────────────────────┘     └────────────┬───────────────┘
                                                │
                                   ┌────────────▼───────────────┐
                                   │     Supabase PostgreSQL     │
                                   │     (pooled, port 6543)     │
                                   └────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                    Authentication                                 │
│                                                                  │
│  Frontend: AWS Amplify SDK → Cognito User Pool                   │
│  Backend:  JWT verification via JWKS (jose library)              │
└──────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

### Frontend (`artifacts/riisemap/`)

| Layer | Technology |
|-------|-----------|
| Framework | React 18 |
| Language | TypeScript |
| Build tool | Vite 7 |
| Routing | Wouter |
| Data fetching | TanStack React Query |
| API client | Auto-generated via Orval from OpenAPI spec |
| UI primitives | Radix UI (shadcn/ui pattern) |
| Styling | Tailwind CSS 4 |
| Charts | Recharts |
| Forms | React Hook Form + Zod validation |
| Auth SDK | AWS Amplify (`aws-amplify`) → Cognito |
| CSV parsing | PapaParse |

### Backend (`artifacts/api-server/`)

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 20 (Lambda runtime: nodejs24.x) |
| Framework | Express 5 |
| Language | TypeScript |
| ORM | Drizzle ORM |
| Schema validation | Zod (via `drizzle-zod` + `@workspace/api-zod`) |
| Logging | Pino + pino-http |
| Bundler | esbuild |
| Lambda adapter | serverless-http |
| Auth verification | jose (Cognito JWKS), with pluggable adapter pattern |

### Database (`lib/db/`)

| Layer | Technology |
|-------|-----------|
| Engine | PostgreSQL (hosted on Supabase) |
| Connection pooling | PgBouncer (transaction mode, port 6543) |
| ORM / query builder | Drizzle ORM |
| Migrations | Drizzle Kit (`drizzle-kit push`) |
| Schema | ~16 tables |

### Authentication

| Layer | Technology |
|-------|-----------|
| Identity provider | AWS Cognito User Pool |
| Frontend SDK | AWS Amplify Auth |
| Token format | JWT (ID token from Cognito) |
| Backend verification | JWKS-based verification via `jose` library |
| Adapter pattern | `auth-factory.ts` supports Cognito (primary) and Supabase (legacy) |

---

## Infrastructure

### AWS Services

| Service | Purpose |
|---------|---------|
| **AWS Amplify Hosting** | Static SPA hosting (CloudFront CDN + S3), auto-deploys from `rollback-may27` branch |
| **AWS Lambda** | API compute — Express app wrapped in `serverless-http` |
| **AWS API Gateway** (HTTP API) | Request routing, CORS handling |
| **AWS CloudFormation** (via SAM) | Infrastructure as Code |
| **AWS S3** | SAM deployment artifact storage |
| **AWS Cognito** | User Pool for authentication |

### External Services

| Service | Purpose |
|---------|---------|
| **Supabase** | PostgreSQL database hosting + connection pooling |
| **GitHub** | Source control (`lawscause/Riise-Map-Admin`) |
| **GitHub Actions** | CI/CD for API deployment |

### Account & Region

- AWS Account: `991258367031`
- Region: `us-east-1`
- Deploy branch: `rollback-may27`

---

## CI/CD Pipeline

### API Deployment (GitHub Actions)

```
Push to rollback-may27
       │
       ▼
.github/workflows/deploy-api.yml
       │
       ├── Checkout
       ├── Setup Node.js 24
       ├── Setup SAM CLI
       ├── Configure AWS credentials (from GitHub Secrets)
       ├── pnpm install
       ├── pnpm run build:lambda (esbuild bundle)
       └── sam deploy → CloudFormation stack "riisemap-api"
           - Parameter overrides from GitHub Secrets:
             DatabaseUrl, AuthProvider, CognitoUserPoolId, CognitoClientId
```

### Frontend Deployment (AWS Amplify)

Amplify watches the same branch and auto-builds on push using `amplify.yml`:

1. Installs pnpm, runs `pnpm install`
2. Builds the Lambda bundle (included in Amplify build for artifact availability)
3. Builds the frontend with `pnpm --filter @workspace/riisemap build`
4. Deploys `artifacts/riisemap/dist/public/` to CloudFront

---

## SAM Template (`template.yaml`)

Provisions:
- **`AWS::Serverless::Function`** — Lambda (nodejs24.x, 512MB, 30s timeout)
- **`AWS::Serverless::HttpApi`** — HTTP API with permissive CORS (all origins)

Parameters:
- `DatabaseUrl` (NoEcho) — Supabase PostgreSQL connection string
- `AuthProvider` — `cognito` (default)
- `CognitoUserPoolId` — Cognito User Pool ID
- `CognitoClientId` — Cognito App Client ID
- `Stage` — `dev` | `staging` | `prod`

---

## Monorepo Structure

```
Riise-Map-Admin/
├── artifacts/
│   ├── api-server/              # Express API (deployed to Lambda)
│   │   ├── src/
│   │   │   ├── routes/          # REST route handlers
│   │   │   ├── middlewares/     # Auth middleware
│   │   │   ├── lib/             # Auth adapters, logger
│   │   │   ├── app.ts           # Express app setup
│   │   │   ├── lambda.ts        # Lambda entry point
│   │   │   └── index.ts         # Local dev entry point
│   │   ├── build.mjs            # esbuild config (dev + lambda modes)
│   │   └── dist-lambda/         # Built Lambda bundle
│   ├── riisemap/                # React SPA frontend
│   │   ├── src/
│   │   │   ├── pages/           # Route-level page components
│   │   │   ├── components/      # Shared UI (shadcn/ui, layout, charts)
│   │   │   ├── lib/             # Auth helpers, fetch utilities
│   │   │   ├── hooks/           # Custom React hooks
│   │   │   └── App.tsx          # Root component + routing
│   │   └── vite.config.ts
│   └── mockup-sandbox/          # UI prototyping sandbox
├── lib/
│   ├── db/                      # Drizzle schema, migrations, seed scripts
│   │   ├── src/schema/          # Table definitions
│   │   └── drizzle.config.ts
│   ├── api-spec/                # OpenAPI specification + Orval config
│   │   └── openapi.yaml
│   ├── api-client-react/        # Generated React Query hooks (via Orval)
│   └── api-zod/                 # Generated Zod schemas (via Orval)
├── tests/                       # Playwright E2E tests
├── scripts/                     # Utility scripts
├── template.yaml                # SAM IaC template
├── amplify.yml                  # Amplify build configuration
├── pnpm-workspace.yaml          # Workspace config + security settings
└── .github/workflows/           # CI/CD pipeline
```

---

## Data Model

### Core Entities

| Table | Purpose |
|-------|---------|
| `learners` | Enrolled participants |
| `programs` | Funded initiatives |
| `pathways` | Career tracks within programs |
| `funding_sources` | Grants and funding entities |
| `funding_source_goals` | Objectives per funding source |
| `learner_statuses` | Reference: status options |

### Relationship Tables (many-to-many)

| Table | Links |
|-------|-------|
| `pathway_programs` | Pathways ↔ Programs |
| `funding_source_learners` | Funding Sources ↔ Learners |
| `funding_source_programs` | Funding Sources ↔ Programs |
| `funding_source_pathways` | Funding Sources ↔ Pathways |

### Learner Detail (schema exists, partially populated)

`learner_roadmaps`, `learner_projects`, `learner_events`, `learner_notes`, `learner_readiness_scores`, `learner_activities`

---

## API Design

- RESTful resource-based routing under `/api/*`
- All routes (except `GET /` health check) require Bearer JWT via `requireAuth` middleware
- Bulk operations: `POST /api/{resource}/bulk-delete`, `POST /api/{resource}/import`
- Typed with Zod schemas shared between client and server
- API client code auto-generated from OpenAPI spec using Orval → React Query hooks

---

## Security Model

| Concern | Approach |
|---------|----------|
| Authentication | Cognito JWTs verified server-side via JWKS |
| Authorization | All API routes gated by auth middleware (no role-based access yet) |
| CORS | Permissive (`*`) — suitable for MVP |
| Secrets in CI | GitHub Secrets → SAM parameter overrides |
| Secrets in IaC | `NoEcho: true` on sensitive CloudFormation parameters |
| Supply chain | `minimumReleaseAge: 1440` in pnpm config (24-hour delay for new packages) |
| Connection security | SSL for RDS connections; PgBouncer pooling for Lambda concurrency |

---

## Environment Variables

### Lambda (production, via SAM)

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Supabase pooled PostgreSQL connection string |
| `AUTH_PROVIDER` | `cognito` |
| `COGNITO_USER_POOL_ID` | Cognito User Pool ID |
| `COGNITO_CLIENT_ID` | Cognito App Client ID |
| `NODE_ENV` | `production` |
| `STAGE` | `prod` |

### Frontend (Amplify build-time)

| Variable | Purpose |
|----------|---------|
| `VITE_API_URL` | API Gateway endpoint URL |
| `VITE_COGNITO_USER_POOL_ID` | Cognito User Pool ID |
| `VITE_COGNITO_CLIENT_ID` | Cognito App Client ID |

---

## Testing

| Type | Tool | Target |
|------|------|--------|
| E2E | Playwright (Chromium, headless) | Deployed site on Amplify |
| API direct | Playwright test runner | API Gateway endpoints |

Tests run against `https://app.riisemap.org` with 60s timeout. Screenshots captured on failure.

---

## Local Development

```bash
pnpm install
pnpm --filter @workspace/api-server dev   # API on port 8080
pnpm --filter @workspace/riisemap dev     # Frontend on port 3000 (proxies /api → 8080)
```

The frontend Vite config proxies `/api` requests to the local Express server during development.
