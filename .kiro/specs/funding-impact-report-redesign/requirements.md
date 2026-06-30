# Requirements Document

## Introduction

This document specifies requirements for redesigning the existing Funding Source Report into an Impact Report. The current report renders a flat organizational hierarchy (Funding Source → Program → Pathway → Learner) that functions as a relationship tree rather than an impact report. The redesigned report shifts emphasis to an impact-oriented structure (Funding Source → Progress → Outcomes → Evidence) while using only data that is currently populated in the database.

## Data Availability Constraints

The following tables contain actual data and form the basis of all report features:

- **funding_sources** (11 records) — name, objectives, narrative, amount, startDate, endDate, learnerCount, narrative files
- **funding_source_goals** (48 records) — title, note, status (not_started, in_progress, completed), document attachments
- **programs** (4 records) — name, description, activeLearners, completionRate, readinessScore, eventParticipation, placementReady, funderTag, startDate, endDate
- **pathways** (5 records) — name, estimatedWeeks, activeLearners, skills, milestones, programCategory
- **learners** (11 records) — name, program, pathway, progress, readiness, status, coach, flaggedForSupport

**Association method:** Programs link to Funding Sources via `programs.funderTag` matching `funding_sources.name`. Pathways link to Programs via `pathways.programCategory` matching `programs.name`. Learners link to Programs via `learners.program` matching `programs.name`.

**Empty tables excluded from scope:** funding_source_learners, funding_source_programs, funding_source_pathways, learner_roadmaps, learner_projects, learner_events, learner_readiness_scores, learner_activities, success_stories.

## Critique of Current Report

1. **Structural problem**: It renders a pure org chart without answering "is this investment working?"
2. **No progress visibility**: No goal completion status, no learner progress aggregates, no time-based tracking against funding targets.
3. **No outcome data**: Program-level metrics (completionRate, readinessScore, placementReady) exist but are not surfaced.
4. **No KPIs or health indicators**: No computed metrics, no traffic-light indicators, no at-a-glance summaries.
5. **No narrative context**: The funder's objectives and narrative fields exist but are never surfaced.
6. **No temporal context**: Start/end dates and funding amounts exist but are not used to calculate time remaining or pace-to-target.

## Glossary

- **Impact_Report**: The redesigned funding report component.
- **Funding_Source**: A grant or investment entity with defined targets.
- **Funding_Goal**: A discrete objective attached to a Funding Source with title, note, and status.
- **Learner_Target**: The learnerCount field on a Funding Source.
- **Progress_Rate**: Enrolled learners (sum of activeLearners from linked programs) divided by learnerCount target.
- **Goal_Completion_Rate**: Percentage of Funding Goals in "completed" status.
- **Health_Indicator**: A traffic-light classification (on_track, at_risk, off_track) derived from pace and goal completion.
- **KPI_Card**: A compact display element showing a single metric.
- **Section_Panel**: A collapsible container grouping related information.
- **Report_Header**: The top section containing identity, financial, and timeline information.
- **Time_Progress**: Elapsed days divided by total grant duration.
- **Pace_Indicator**: Comparison of Progress_Rate against Time_Progress.
- **Template_Narrative**: A deterministic text summary generated from available data points (no AI/LLM required).

## Requirements

### Requirement 1: Report Information Architecture

**User Story:** As a funder, I want the report organized around progress and outcomes rather than organizational hierarchy, so that I can quickly assess whether my investment is delivering results.

#### Acceptance Criteria

1. THE Impact_Report SHALL present each Funding Source as an independent report section ordered by end date (soonest first), with ties broken by name alphabetically.
2. WHEN a Funding Source section is rendered, THE Impact_Report SHALL organize content in this order: Report_Header, Health_Indicator summary, KPI_Cards, Funding Goal progress, Program activity, Pathway participation, Template_Narrative.
3. THE Impact_Report SHALL support collapsible Section_Panels for all sections below the Report_Header, defaulting to collapsed.
4. IF no Funding Sources exist, THEN THE Impact_Report SHALL display an empty state message.

### Requirement 2: Report Header and Funding Context

**User Story:** As a program operator, I want to see funding identity, financial commitment, and timeline at the top of each section.

#### Acceptance Criteria

1. THE Report_Header SHALL display: Funding Source name, total amount (US dollar, two decimals), start date, end date, learner count target, and objectives text.
2. WHEN a Funding Source has a narrative field populated, THE Report_Header SHALL display the narrative text below the objectives.
3. IF a Funding Source has both startDate and endDate defined and the current date is between them, THEN THE Report_Header SHALL display a timeline progress bar showing Time_Progress as a percentage.
4. WHEN the current date is past the end date, THE Report_Header SHALL display an "Expired" badge instead of the progress bar.
5. IF startDate or endDate is missing, THEN THE Report_Header SHALL omit the timeline progress bar and display "Dates not set."
6. IF amount or learnerCount is null, THEN THE Report_Header SHALL display "N/A" for the missing value.
7. IF the current date is before startDate, THEN THE Report_Header SHALL display the progress bar at 0% with a "Not Started" label.

### Requirement 3: Health and Risk Indicators

**User Story:** As an executive, I want at-a-glance health indicators for each funding source.

#### Acceptance Criteria

1. THE Impact_Report SHALL compute a Pace_Indicator by comparing Progress_Rate (sum of activeLearners from linked programs / learnerCount target) against Time_Progress (elapsed days / total days).
2. WHEN Progress_Rate >= Time_Progress, THE Health_Indicator SHALL display "On Track" (green).
3. WHEN Progress_Rate is below Time_Progress by up to 20 percentage points, THE Health_Indicator SHALL display "At Risk" (amber).
4. WHEN Progress_Rate is below Time_Progress by more than 20 percentage points, THE Health_Indicator SHALL display "Off Track" (red).
5. THE Impact_Report SHALL display Goal_Completion_Rate as "X of Y goals completed."
6. WHEN learnerCount is null, THE Health_Indicator SHALL omit Pace_Indicator and display only Goal_Completion_Rate.
7. Health indicators SHALL use color AND text labels so status is not communicated by color alone.
8. IF the current date is before startDate, display "Not Started" without color-coded status.
9. IF no learnerCount target and zero goals, display "No Targets Defined."
10. WHEN past end date, compute final Pace_Indicator with Time_Progress capped at 100% and append "Expired" badge.

### Requirement 4: KPI Cards

**User Story:** As a funder, I want key performance indicators computed from real data.

#### Acceptance Criteria

1. THE Impact_Report SHALL display KPI_Cards for each Funding Source showing:
   - Enrolled learners (sum of activeLearners from linked programs)
   - Progress_Rate percentage (enrolled / learnerCount target)
   - Goal_Completion_Rate percentage
   - Average program completion rate (mean of completionRate from linked programs)
   - Average program readiness score (mean of readinessScore from linked programs)
   - Total placement-ready count (sum of placementReady from linked programs)
2. All percentage values SHALL be rounded to the nearest whole number.
3. IF a KPI cannot be computed (e.g., no linked programs or no learnerCount target), display "N/A" rather than hiding the card.
4. WHEN a KPI value is zero because the data evaluates to zero, display "0."

### Requirement 5: Funding Goal Progress

**User Story:** As a funder, I want to see the status of each goal I defined for my grant.

#### Acceptance Criteria

1. THE Impact_Report SHALL display all Funding Goals ordered by status (in_progress first, then not_started, then completed) with title, status, and note.
2. Status SHALL use visual indicators: checkbox for completed, spinner for in_progress, circle for not_started.
3. A progress bar SHALL show completed count out of total count above the goal list.
4. WHEN a goal has a documentFileName, display a document icon with the file name as a downloadable link.
5. WHEN a goal has a null/empty note, omit the note display area.
6. IF zero goals exist, display "No goals defined for this funding source."

### Requirement 6: Program Activity Summary

**User Story:** As a program operator, I want aggregate program metrics for programs funded by this source.

#### Acceptance Criteria

1. THE Impact_Report SHALL display all programs where `programs.funderTag` matches the Funding Source name, showing: program name, activeLearners, completionRate, readinessScore, eventParticipation, placementReady, startDate, endDate.
2. WHEN multiple programs are linked, display aggregate totals: total activeLearners, weighted average completionRate, total eventParticipation, total placementReady.
3. WHEN a single program is linked, display its metrics without an aggregate row.
4. IF zero programs are linked, display "No programs associated with this funding source."

### Requirement 7: Pathway Participation

**User Story:** As a funder, I want to see which career pathways my investment supports.

#### Acceptance Criteria

1. THE Impact_Report SHALL display all pathways where `pathways.programCategory` matches a linked program's name, showing: pathway name, estimatedWeeks, activeLearners.
2. IF a pathway has skills (non-empty array), display as comma-separated list limited to 15 items.
3. IF a pathway has milestones (non-empty array), display the milestone count.
4. IF no pathways are linked, display "No pathways associated with this funding source."

### Requirement 8: Template Narrative

**User Story:** As a funder, I want a generated narrative summary of my grant's impact for use in my own reporting.

#### Acceptance Criteria

1. THE Impact_Report SHALL generate a Template_Narrative by populating a deterministic template with: funding source name, amount, duration, learner target, enrolled learner count (from linked programs), goal completion rate, program completion rates, and placement-ready count.
2. THE Template_Narrative SHALL be a single paragraph of no more than 200 words.
3. A "Copy Narrative" button SHALL copy the text to clipboard with a 3-second confirmation indicator.
4. WHEN a Funding Source has zero linked programs AND zero completed goals, display "Insufficient data to generate narrative" instead.
5. THE Template_Narrative SHALL NOT require any external AI/LLM service.

### Requirement 9: Print and PDF Export

**User Story:** As a funder, I want to print the report or export it as PDF.

#### Acceptance Criteria

1. A "Print Report" button SHALL trigger the browser print dialog with print-optimized CSS.
2. In print mode: expand all collapsed sections, remove interactive controls, render single-column layout.
3. Print SHALL use standard HTML/CSS without requiring JavaScript for layout.
4. Print SHALL include a header with: "Funding Impact Report", generation date (MMMM D, YYYY), and Funding Source name.
5. IF a specific Funding Source is selected, print only that section; IF "All" is selected, print all sections with page breaks between them.
6. Health indicators SHALL include text labels for grayscale printing.

### Requirement 10: Responsive Layout

**User Story:** As a program operator, I want to view the report on desktop and mobile.

#### Acceptance Criteria

1. At 1024px+ (desktop): KPI_Cards in 3-column grid, program/pathway data in tabular format.
2. Below 1024px (mobile): KPI_Cards stacked single-column, tables converted to card layouts.
3. Support 320px minimum width without horizontal scrolling.
4. Use existing design system components (Card, Progress, Tabs, Button).
5. Below 1024px: minimum 44×44px touch targets for interactive elements.

### Requirement 11: Funding Source Selector

**User Story:** As an executive, I want to view a single funding source or all funding sources.

#### Acceptance Criteria

1. A selector control SHALL allow choosing "All Funding Sources" or a specific one, listed by end date (soonest first).
2. Default to "All Funding Sources" on initial load.
3. WHEN "All" is selected, display a portfolio summary (total amount, total learner target, total enrolled, overall Progress_Rate, count by Health_Indicator status) above individual sections.
4. WHEN a specific Funding Source is selected, render only that section.
5. Persist selection for the browser session.
6. IF a previously selected source is no longer available, reset to "All."

### Requirement 12: Data Derivation Constraints

**User Story:** As a developer, I want clarity that all report data is derived from existing populated tables.

#### Acceptance Criteria

1. THE Impact_Report SHALL compute all values using only: funding_sources, funding_source_goals, programs (via funderTag match), pathways (via programCategory match to linked programs), and learners (via program name match to linked programs).
2. THE Impact_Report SHALL NOT require schema migrations, new tables, or new columns.
3. THE Impact_Report SHALL NOT depend on join tables (funding_source_learners, funding_source_programs, funding_source_pathways) which exist in schema but contain no data.
4. THE Impact_Report SHALL NOT depend on learner detail tables (learner_roadmaps, learner_projects, learner_events, learner_readiness_scores, learner_activities) which exist in schema but contain no data.
5. THE Impact_Report SHALL NOT require an AI/LLM service integration.
6. Computed values: Health_Indicator, Pace_Indicator, Progress_Rate, Goal_Completion_Rate, Time_Progress, aggregate program metrics — all derived client-side from the data sources listed in criterion 1.
