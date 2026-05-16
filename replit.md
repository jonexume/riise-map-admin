# RiiseMap Admin

A workforce pathway and career mobility platform admin dashboard for Org X — helping program managers guide learners into tech careers through roadmaps, projects, events, coaching, community support, readiness tracking, and impact reporting.

## Run & Operate

- `pnpm --filter @workspace/riisemap run dev` — run the RiiseMap frontend (PORT assigned by workflow)
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS + shadcn/ui
- Routing: wouter
- Charts: Recharts
- Animation: framer-motion
- Icons: lucide-react
- API: Express 5 (API server, not used in MVP)
- DB: PostgreSQL + Drizzle ORM (not used in MVP — all mock data)

## Where things live

- `artifacts/riisemap/src/` — React frontend
- `artifacts/riisemap/src/data/mockData.ts` — all mock data (learners, programs, events, etc.)
- `artifacts/riisemap/src/pages/` — one file per route
- `artifacts/riisemap/src/components/` — shared components
- `artifacts/riisemap/src/App.tsx` — router setup
- `artifacts/riisemap/src/index.css` — theme/CSS variables
- `artifacts/api-server/src/routes/` — API routes (health only for now)
- `lib/api-spec/openapi.yaml` — API contract source of truth

## Architecture decisions

- Frontend-only MVP: all data is local mock data in `mockData.ts`, no API calls needed
- Left sidebar navigation with 10 sections matching the Org X admin spec
- wouter for client-side routing, all routes under `/`
- Recharts for all data visualizations in Impact & Reporting
- shadcn/ui component library for consistent, accessible UI

## Product

RiiseMap Org X Admin MVP — a calm operational command center for workforce program managers. Includes:
- Home daily command center with priorities, metrics, and quick actions
- Learner management with detail views, roadmap tracking, readiness scoring
- Program, Pathway, Project, and Event management
- Coach workload and caseload management
- Intervention alerts with supportive language
- Impact & Reporting with grant report builder, success stories, and exports
- Settings with organization profile and reporting defaults

## User preferences

- App should feel like Notion/Linear/modern nonprofit dashboards — not Salesforce
- Supportive language throughout: "learners who may need support" not "low performers"
- No emojis in UI
- Mock data organization: Atlanta Workforce Tech Alliance

## Gotchas

- All CSS variables in index.css must be set (scaffold defaults to `red` placeholders)
- wouter routing: use Link component, not window.location
- Don't import React explicitly — Vite JSX transformer handles it
- Unused imports will fail TypeScript build

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
