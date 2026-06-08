# Implementation Plan: Funding Impact Report Redesign

## Overview

Replace the existing "Funding Report" tab content with an impact-oriented report. Three files: computation logic, data hook, and one report component. Print CSS in `index.css`.

## Structure

```
src/components/impact-report/
  computations.ts       — pure functions (sort, compute health, aggregate, narrative)
  useImpactReportData.ts — hook that fetches & computes all report data
  ImpactReport.tsx      — full report UI (selector, portfolio summary, per-source sections)
```

## Tasks

- [x] 1. Create `computations.ts` with all pure functions
  - `computeTimeProgress(startDate, endDate)` → percentage | "expired" | "not_started" | null
  - `computeProgressRate(enrolledLearners, target)` → percentage | null
  - `computeHealthStatus(progressRate, timeProgress)` → "on_track" | "at_risk" | "off_track" | "not_started" | "no_targets"
  - `computeGoalCompletion(goals)` → { completed, total, rate }
  - `sortGoals(goals)` → sorted by status: in_progress, not_started, completed
  - `sortFundingSources(sources)` → sorted by endDate asc, name asc
  - `filterProgramsByFunder(programs, funderName)` → matching programs
  - `filterPathwaysByPrograms(pathways, programNames)` → matching pathways
  - `computeProgramAggregates(programs)` → totals/averages
  - `generateTemplateNarrative(sourceData)` → string | null
  - `computePortfolioSummary(allSourceData)` → totals and health counts

- [x] 2. Add `GET /api/funding-source-goals` endpoint (all goals, no filter)
  - Add route to existing `funding-source-goals.ts` that returns all goals

- [x] 3. Create `useImpactReportData.ts` hook
  - Use existing hooks: `useGetFundingSources`, `useGetPrograms`, `useGetPathways`
  - Fetch all goals via `authFetch`
  - Compute and return fully assembled report data using `computations.ts`
  - Return `{ isLoading, isError, data }`

- [x] 4. Create `ImpactReport.tsx` component
  - Funding source selector (dropdown: "All" + individual sources)
  - Portfolio summary section (when "All" selected)
  - Per-source report sections, each with collapsible panels:
    - Header (name, amount, dates, timeline bar, objectives, narrative)
    - Health indicator (traffic light + text)
    - KPI cards (3-col grid desktop, 1-col mobile)
    - Goal progress (progress bar + sorted list)
    - Program activity (table desktop, cards mobile)
    - Pathway participation (cards with skills/milestones)
    - Template narrative (paragraph + copy button)
  - Print button, empty/loading/error states
  - Session persistence for selector

- [x] 5. Integrate into Impact.tsx and update print CSS
  - Replace `<TabsContent value="funding-report">` contents with `<ImpactReport />`
  - Update `@media print` in `index.css`: expand collapsibles, hide controls, page breaks, print header

- [x] 6. Verify build passes and test on localhost

## Notes

- Skip property-based tests. Add a few focused unit tests for `computations.ts` if time allows.
- One component file for the report. Extract sub-components only if a section exceeds ~100 lines.
- All data associations use string matching (funderTag, programCategory, learner.program) — no join table queries.
