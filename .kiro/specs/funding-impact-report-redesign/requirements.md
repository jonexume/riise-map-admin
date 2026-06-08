# Requirements Document

## Introduction

This document specifies requirements for redesigning the existing Funding Source Report into an Impact Report. The current report renders a flat organizational hierarchy (Funding Source → Program → Pathway → Learner) that functions as a relationship tree rather than an impact report. The redesigned report shifts emphasis to an impact-oriented structure (Funding Source → Progress → Outcomes → Evidence) while using only existing data fields. The report must serve funders, program operators, and executives, and must remain printable and exportable as PDF.

## Critique of Current Report

The existing Funding Source Report has the following deficiencies:

1. **Structural problem**: It renders a pure org chart — showing which programs, pathways, and learners belong to a funder — without answering "is this investment working?"
2. **No progress visibility**: The report shows no goal completion status, no learner progress aggregates, and no time-based tracking against funding targets.
3. **No outcome data**: Learner readiness scores, project completions, event participation, and placement status are all available in the database but completely absent from the report.
4. **No KPIs or health indicators**: There are no computed metrics, no traffic-light indicators, and no at-a-glance summaries to support executive decision-making.
5. **No narrative context**: The funder's objectives and narrative fields exist but are never surfaced in the report.
6. **Audience mismatch**: The report assumes a single audience (someone who needs to see the org chart) rather than serving funders (ROI), operators (activity tracking), and executives (portfolio health).
7. **No temporal context**: Start/end dates and funding amounts exist but are not used to calculate time remaining, burn rate, or pace-to-target.

## Glossary

- **Impact_Report**: The redesigned funding report component that presents progress, outcomes, and evidence organized by Funding Source.
- **Funding_Source**: A grant, contract, or investment entity with defined targets (amount, learner count, objectives, goals, start/end dates).
- **Funding_Goal**: A discrete objective attached to a Funding Source with a title, note, and status (not_started, in_progress, completed).
- **Learner_Target**: The learnerCount field on a Funding Source representing the target number of learners to serve.
- **Progress_Rate**: A computed percentage representing actual enrolled learners divided by learnerCount target.
- **Goal_Completion_Rate**: The percentage of Funding Goals in "completed" status for a given Funding Source.
- **Health_Indicator**: A traffic-light classification (on_track, at_risk, off_track) derived from computed metrics and time remaining.
- **KPI_Card**: A compact display element showing a single metric with label, value, and optional trend or status indicator.
- **Section_Panel**: A collapsible container within the report that groups related information under a heading.
- **AI_Narrative**: A generated text summary that synthesizes available data points into a human-readable impact paragraph.
- **Report_Header**: The top section of each Funding Source's report containing identity, financial, and timeline information.
- **Outcome_Evidence**: Data points (readiness scores, project completions, event participation, success stories) that demonstrate learner outcomes.
- **Time_Progress**: A computed value representing elapsed days divided by total grant duration.
- **Pace_Indicator**: A comparison of Progress_Rate against Time_Progress to determine whether targets are being met on schedule.

## Requirements

### Requirement 1: Report Information Architecture

**User Story:** As a funder, I want the report organized around progress and outcomes rather than organizational hierarchy, so that I can quickly assess whether my investment is delivering results.

#### Acceptance Criteria

1. THE Impact_Report SHALL present each Funding Source as an independent report section ordered by end date (soonest first), with ties broken by Funding Source name in alphabetical order.
2. WHEN a Funding Source section is rendered, THE Impact_Report SHALL organize content in the following section order: Report_Header, Health_Indicator summary, KPI_Cards, Funding Goal progress, Learner progress, Program activity, Pathway participation, Outcome_Evidence, AI_Narrative.
3. THE Impact_Report SHALL replace the current hierarchical tree (Funder → Program → Pathway → Learner names) with the section order defined in criterion 2.
4. THE Impact_Report SHALL support collapsible Section_Panels for all sections below the Report_Header, with each Section_Panel rendered in collapsed state by default so that users can expand only relevant detail.
5. IF no Funding Sources are available for the current user, THEN THE Impact_Report SHALL display an empty state message indicating no funding sources are associated with the account.

### Requirement 2: Report Header and Funding Context

**User Story:** As a program operator, I want to see funding identity, financial commitment, and timeline at the top of each section, so that I have immediate context for interpreting metrics.

#### Acceptance Criteria

1. THE Report_Header SHALL display: Funding Source name, total amount (formatted as US dollar currency with two decimal places), start date, end date, learner count target, and objectives text.
2. WHEN a Funding Source has a narrative field populated, THE Report_Header SHALL display the narrative text below the objectives.
3. IF a Funding Source has both startDate and endDate defined and the current date is on or after the startDate and on or before the endDate, THEN THE Report_Header SHALL display a timeline progress bar showing Time_Progress as a percentage of elapsed days since startDate divided by total days from startDate to endDate.
4. WHEN the current date is past the Funding Source end date, THE Report_Header SHALL display an "Expired" badge instead of the timeline progress bar.
5. IF a Funding Source is missing startDate or endDate, THEN THE Report_Header SHALL omit the timeline progress bar and display the available date or a "Dates not set" label.
6. IF a Funding Source has a null amount or null learnerCount, THEN THE Report_Header SHALL display "N/A" in place of the missing value rather than hiding the field.
7. IF the current date is before the Funding Source startDate, THEN THE Report_Header SHALL display the timeline progress bar at 0% with a "Not Started" label.

### Requirement 3: Health and Risk Indicators

**User Story:** As an executive, I want at-a-glance health indicators for each funding source, so that I can identify which investments need attention without reading detailed metrics.

#### Acceptance Criteria

1. THE Impact_Report SHALL compute a Pace_Indicator by comparing Progress_Rate (enrolled learners / learnerCount target) against Time_Progress (elapsed days / total days).
2. WHEN Progress_Rate is greater than or equal to Time_Progress, THE Health_Indicator SHALL display "On Track" status.
3. WHEN Progress_Rate is less than Time_Progress by greater than 0 and up to and including 20 percentage points, THE Health_Indicator SHALL display "At Risk" status.
4. WHEN Progress_Rate is less than Time_Progress by more than 20 percentage points, THE Health_Indicator SHALL display "Off Track" status.
5. THE Impact_Report SHALL compute a Goal_Completion_Rate and display it as a count of completed goals versus total goals (e.g., "3 of 5 goals completed").
6. WHEN a Funding Source has no learnerCount target defined, THE Health_Indicator SHALL omit the Pace_Indicator and display only Goal_Completion_Rate.
7. THE Health_Indicator SHALL use color coding (green for On Track, amber for At Risk, red for Off Track) accompanied by a text label displaying the status name so that status is not communicated by color alone.
8. IF the current date is before the Funding Source start date, THEN THE Health_Indicator SHALL display the Pace_Indicator as "Not Started" without a color-coded health status.
9. IF a Funding Source has no learnerCount target defined and has zero Funding Goals, THEN THE Health_Indicator SHALL display a "No Targets Defined" message instead of computed indicators.
10. WHEN the current date is past the Funding Source end date, THE Health_Indicator SHALL compute the final Pace_Indicator using the full grant duration (Time_Progress capped at 100%) and append an "Expired" badge to the status.

### Requirement 4: KPI Cards

**User Story:** As a funder, I want to see key performance indicators computed from real data, so that I can assess measurable progress without reading raw tables.

#### Acceptance Criteria

1. THE Impact_Report SHALL display KPI_Cards for each Funding Source showing: enrolled learner count, Progress_Rate percentage, Goal_Completion_Rate percentage, average learner progress percentage, average learner readiness percentage, and count of learners flagged for support. All percentage values SHALL be rounded to the nearest whole number.
2. WHEN a Funding Source has linked programs (via the funding_source_programs join table or via funderTag match), THE Impact_Report SHALL compute and display: aggregate completion rate (arithmetic mean of linked program completionRate values), aggregate event participation (arithmetic mean of linked program eventParticipation values), and total placement-ready learner count (sum of linked program placementReady values).
3. THE Impact_Report SHALL derive KPI values exclusively from existing database fields without requiring new data collection.
4. WHEN a KPI value is zero because the associated data exists but evaluates to zero, THE Impact_Report SHALL display the KPI_Card with a value of "0".
5. IF a KPI cannot be computed because the required association does not exist (e.g., no linked learners for learner-based KPIs, no linked programs for program-based KPIs, or no learnerCount target for Progress_Rate), THEN THE Impact_Report SHALL display the KPI_Card with a value of "N/A" rather than hiding the card.

### Requirement 5: Funding Goal Progress

**User Story:** As a funder, I want to see the status of each goal I defined for my grant, so that I can track deliverable completion.

#### Acceptance Criteria

1. THE Impact_Report SHALL display all Funding Goals for a Funding Source as a list ordered by status (in_progress first, then not_started, then completed) with title, status, and note for each goal.
2. THE Impact_Report SHALL display each Funding Goal status using visual indicators: a checkbox icon for completed, a spinner icon for in_progress, and a circle icon for not_started.
3. THE Impact_Report SHALL display Goal_Completion_Rate as a progress bar above the goal list showing completed count out of total count (e.g., "2 of 5 goals completed").
4. WHEN a Funding Goal has a document file attached (documentFileName is not null), THE Impact_Report SHALL display a document icon with the file name as a downloadable link.
5. WHEN a Funding Goal has a null or empty note field, THE Impact_Report SHALL omit the note display area for that goal rather than showing an empty space.
6. IF a Funding Source has zero Funding Goals defined, THEN THE Impact_Report SHALL display a message stating "No goals defined for this funding source."

### Requirement 6: Learner Target Progress

**User Story:** As a program operator, I want to see how many learners are enrolled against the funding target, so that I can assess recruitment progress.

#### Acceptance Criteria

1. THE Impact_Report SHALL display enrolled learner count (from the funding_source_learners join table) against the learnerCount target as a progress bar with the format "X of Y learners enrolled."
2. IF the Funding Source has a null or zero learnerCount target, THEN THE Impact_Report SHALL display the enrolled learner count without a progress bar, showing "X learners enrolled (no target set)."
3. THE Impact_Report SHALL display a summary table of linked learners showing: name, program, pathway, progress percentage, readiness percentage, and status, sorted by progress percentage descending (highest progress first).
4. WHEN the learner list exceeds 10 entries, THE Impact_Report SHALL display the first 10 learners and provide an "Show all (X)" expand control to reveal the remaining learners.
5. THE Impact_Report SHALL compute and display the average progress and average readiness across all linked learners, rounded to the nearest whole number.
6. IF zero learners are linked to the Funding Source, THEN THE Impact_Report SHALL display a message stating "No learners enrolled yet" and omit the summary table and averages.
7. THE Impact_Report SHALL display the count of learners with flaggedForSupport set to true, labeled as "Learners Needing Attention" with the count value.

### Requirement 7: Program Activity Summary

**User Story:** As a program operator, I want to see aggregate program metrics for programs funded by this source, so that I can monitor delivery activity.

#### Acceptance Criteria

1. THE Impact_Report SHALL display all programs linked to the Funding Source (via funding_source_programs join table OR via funderTag match) with: program name, active learner count (number of learners currently enrolled in the program), completion rate (percentage of enrolled learners with progress at 100%), readiness score (average readiness percentage across enrolled learners), event participation count, and placement-ready count (learners with status "Placement Ready").
2. WHEN multiple programs are linked, THE Impact_Report SHALL display aggregate totals at the top of the section: total active learners (sum across all linked programs), weighted average completion rate (weighted by each program's active learner count), total event participation count, and total placement-ready learners.
3. THE Impact_Report SHALL display each program's start date and end date for temporal context.
4. IF zero programs are linked to the Funding Source, THEN THE Impact_Report SHALL display a message indicating no programs are associated with this funding source.
5. WHEN a single program is linked, THE Impact_Report SHALL display that program's metrics without an aggregate totals row.

### Requirement 8: Pathway Participation

**User Story:** As a funder, I want to see which career pathways my investment supports and how many learners are participating in each, so that I can understand program breadth.

#### Acceptance Criteria

1. THE Impact_Report SHALL display all pathways linked to the Funding Source (via funding_source_pathways join table OR via programCategory match to linked programs) with: name, estimated weeks, and active learner count (from the activeLearners field on the pathway record).
2. IF a pathway has a non-null skills field containing at least one element, THEN THE Impact_Report SHALL display the skills as a comma-separated list limited to the first 15 items.
3. IF a pathway has a non-null milestones field containing at least one element, THEN THE Impact_Report SHALL display the milestone count (total number of elements in the milestones array).
4. IF no pathways are linked to the Funding Source (neither via funding_source_pathways nor via programCategory match), THEN THE Impact_Report SHALL display a message stating that no pathways are associated with this funding source.

### Requirement 9: Outcome Evidence

**User Story:** As a funder, I want to see concrete evidence of learner outcomes, so that I can demonstrate return on investment to my stakeholders.

#### Acceptance Criteria

1. THE Impact_Report SHALL display a summary of outcome evidence including: count of learners with readiness above 70%, count of learners with progress above 80%, count of learners in "Placement Ready" status (matching the learner status field value), and count of learner projects with status "completed" across all linked learners.
2. WHEN Success Stories exist for learners linked to the Funding Source, THE Impact_Report SHALL display up to 3 success stories ordered by created_at descending (most recent first), each showing the learner_name, headline, and the first 150 characters of the story field followed by an ellipsis if truncated.
3. THE Impact_Report SHALL display a readiness dimension breakdown showing, for each distinct dimension value in the learner_readiness_scores table, the dimension name and the average score across all linked learners rounded to the nearest whole number.
4. WHEN zero learners are linked to the Funding Source OR all linked learners have no readiness scores, no projects, no progress data, and no success stories, THE Impact_Report SHALL display a message stating "No outcome data available yet" in place of the outcome evidence section.
5. IF some outcome metrics are available but others are not (e.g., readiness scores exist but no success stories), THEN THE Impact_Report SHALL display available metrics and omit sections with no data rather than showing the "No outcome data available yet" message.

### Requirement 10: AI-Generated Impact Narrative

**User Story:** As a funder, I want an auto-generated narrative summary of my grant's impact, so that I can quickly extract language for my own reporting without manual synthesis.

#### Acceptance Criteria

1. WHEN a Funding Source report section is rendered and the data threshold is met, THE Impact_Report SHALL generate an AI_Narrative that synthesizes: funding context (amount, duration, targets), progress metrics (enrollment rate, goal completion), outcome highlights (readiness scores, placements), and program activity summary.
2. THE AI_Narrative SHALL be limited to a single paragraph of no more than 200 words.
3. THE Impact_Report SHALL display a "Copy Narrative" button adjacent to the AI_Narrative text that copies the full narrative text to the user's clipboard, and SHALL display a confirmation indicator for 3 seconds after a successful copy action.
4. WHILE the AI_Narrative is being generated, THE Impact_Report SHALL display a loading indicator in the narrative section until generation completes or fails.
5. IF the AI_Narrative generation fails or times out after 15 seconds, THEN THE Impact_Report SHALL display an error message indicating the narrative could not be generated and SHALL provide a "Retry" control to re-attempt generation.
6. WHEN a Funding Source has fewer than 2 linked learners AND zero completed Funding Goals, THE Impact_Report SHALL display a placeholder message indicating insufficient data instead of generating a narrative.
7. THE AI_Narrative SHALL use only data present in the existing database and SHALL NOT fabricate statistics or outcomes.

### Requirement 11: Print and PDF Export

**User Story:** As a funder, I want to print the report or export it as a PDF, so that I can share impact evidence with my board without requiring system access.

#### Acceptance Criteria

1. THE Impact_Report SHALL provide a "Print Report" button that triggers the browser print dialog with print-optimized CSS.
2. WHILE in print mode, THE Impact_Report SHALL expand all collapsible sections, remove interactive controls (buttons, expand/collapse toggles), and render all content in a single-column layout.
3. THE Impact_Report SHALL render all content using standard HTML and CSS without requiring JavaScript for layout during print.
4. WHILE in print mode, THE Impact_Report SHALL include a report header on the printed page showing: report title "Funding Impact Report", generation date formatted as "MMMM D, YYYY" (e.g., "June 5, 2025"), and the Funding Source name.
5. IF a specific Funding Source is selected in the selector control, THEN THE Impact_Report SHALL print only that Funding Source's report content; IF "All Funding Sources" is selected, THEN THE Impact_Report SHALL print all Funding Source sections with page breaks inserted between each section.
6. WHILE in print mode, THE Impact_Report SHALL render all color-coded Health_Indicators with both the color and a text label ("On Track", "At Risk", "Off Track") so that the report remains interpretable when printed in grayscale.

### Requirement 12: Responsive Layout

**User Story:** As a program operator, I want to view the impact report on both desktop and mobile devices, so that I can review progress during meetings or on the go.

#### Acceptance Criteria

1. WHILE the viewport width is 1024px or greater (desktop), THE Impact_Report SHALL display KPI_Cards in a grid of 3 columns and program/pathway tables in full-width tabular format occupying 100% of the available container width.
2. WHILE the viewport width is less than 1024px (mobile/tablet), THE Impact_Report SHALL stack KPI_Cards in a single column and convert tables to card-based layouts where each row becomes an individual Card component displaying all row fields vertically.
3. THE Impact_Report SHALL support viewport widths from 320px to any maximum width without horizontal scrolling, with all text content reflowing to remain fully visible within the viewport boundaries.
4. THE Impact_Report SHALL use the existing design system components (Card, Progress, Tabs, Button) to maintain visual consistency.
5. WHILE the viewport width is less than 1024px (mobile/tablet), THE Impact_Report SHALL render all interactive elements (buttons, expand/collapse toggles, links) with a minimum touch target size of 44×44 CSS pixels.
6. WHILE the viewport width is less than 1024px (mobile/tablet), THE Impact_Report SHALL preserve the same section order as desktop (Report_Header, Health_Indicator, KPI_Cards, Goal progress, Learner progress, Program activity, Pathway participation, Outcome_Evidence, AI_Narrative) with no sections hidden or removed.

### Requirement 13: Funding Source Selector and Multi-Report View

**User Story:** As an executive, I want to view a single funding source or compare all funding sources on one page, so that I can assess portfolio health.

#### Acceptance Criteria

1. THE Impact_Report SHALL display a selector control allowing the user to choose "All Funding Sources" or a specific Funding Source by name, with funding sources listed in order of end date (soonest first).
2. THE Impact_Report SHALL default the selector to "All Funding Sources" on initial page load when no prior selection exists in the current browser session.
3. WHEN "All Funding Sources" is selected, THE Impact_Report SHALL render a portfolio summary at the top showing: total funding amount, total learner target, total enrolled learners, overall Progress_Rate, and count of funding sources by Health_Indicator status, followed by all individual Funding Source report sections below.
4. WHEN a specific Funding Source is selected, THE Impact_Report SHALL render only that funding source's full report.
5. THE Impact_Report SHALL persist the user's selector choice for the duration of the browser session (until the browser tab is closed), retaining the selection across page navigations within the application.
6. IF a previously selected Funding Source is no longer available, THEN THE Impact_Report SHALL reset the selector to "All Funding Sources" and render the portfolio summary view.

### Requirement 14: Text Wireframe Specifications

**User Story:** As a product team member, I want detailed text wireframes for every major section, so that I can immediately begin implementation without ambiguity.

#### Acceptance Criteria

1. THE Impact_Report design document SHALL include text wireframes for: Portfolio Summary view, Individual Funding Source Report Header, Health Indicator panel, KPI Card grid, Goal Progress section, Learner Progress section, Program Activity section, Pathway Participation section, Outcome Evidence section, and AI Narrative section.
2. THE text wireframes SHALL specify for each element: the display label, the source database table and field name, the visual position within the section (row and column order), and the rendered format (text, percentage, progress bar, icon, or link).
3. THE text wireframes SHALL indicate responsive behavior for desktop (viewport 1024px or greater: 3-column KPI grid, full tabular data with all columns visible) and mobile (viewport below 1024px: single-column stacked cards, tables reduced to a maximum of 3 priority columns with remaining data accessible via row expansion).
4. WHEN a wireframe section contains data that may be empty or unavailable, THE text wireframe SHALL specify the placeholder content or empty-state message to display.
5. THE text wireframes SHALL define the visual ordering of elements within each section from top to bottom, including heading, summary metrics, primary content area, and any expand/collapse controls.

### Requirement 15: Data Derivation Constraints

**User Story:** As a developer, I want clarity that all report data is derived from existing tables, so that I do not introduce new database fields or entities.

#### Acceptance Criteria

1. THE Impact_Report SHALL compute all displayed values using only fields from: funding_sources, funding_source_goals, funding_source_learners, funding_source_programs, funding_source_pathways, learners, programs, pathways, learner_roadmaps, learner_projects, learner_events, learner_readiness_scores, learner_activities, and success_stories tables.
2. THE Impact_Report SHALL NOT require schema migrations, new database columns, or new database tables.
3. THE Impact_Report SHALL derive the following computed values from existing fields using client-side or API-level computation: Health_Indicator, Pace_Indicator, Progress_Rate, Goal_Completion_Rate, Time_Progress, average learner progress, average learner readiness, aggregate program completion rate, aggregate event participation, total placement-ready count, and outcome evidence counts.
