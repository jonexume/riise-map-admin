# Requirements Document

## Introduction

The Learner Portal is the learner-facing interface of the Riise Map platform. It provides individual learners with self-service access to their assigned pathway, milestone tracking, project updates, event participation, readiness self-assessment, and activity history. The portal operates as a separate frontend application communicating with learner-scoped API endpoints, authenticated via Supabase with role-based access control.

## Glossary

- **Portal**: The learner-facing web application (`artifacts/learner-portal/`) built with React, Vite, shadcn/ui, and wouter
- **API_Server**: The Express backend serving both admin and portal routes
- **Portal_API**: The `/api/portal/*` route namespace serving learner-scoped endpoints
- **Learner_Auth_Middleware**: Middleware (`requireLearnerAuth`) that validates learner tokens and attaches learner context to requests
- **Derived_Value_Service**: The computation service that calculates progress, readiness, lastActive, and nextAction from underlying data
- **Learner**: An authenticated user with `app_metadata.role === "learner"` and a corresponding record in the `learners` database table
- **Admin**: An authenticated user with `app_metadata.role === "admin"` who uses the separate admin application
- **Roadmap_Item**: A milestone entry in `learner_roadmaps` with a state (Not Started, In Progress, Complete) and due date
- **Readiness_Score**: A per-dimension self-assessment score (1–5) stored in `learner_readiness_scores`
- **Activity_Record**: A timestamped log entry in `learner_activities` recording learner actions
- **Pathway**: A structured learning path containing milestones, skills, projects, and readiness criteria

## Requirements

### Requirement 1: Learner Authentication

**User Story:** As a learner, I want to sign in to the portal with my email and password, so that I can securely access my personal learning data.

#### Acceptance Criteria

1. WHEN a learner submits valid email and password credentials, THE Portal SHALL authenticate the learner via Supabase Auth and establish a session with an access token
2. WHEN a learner navigates to any portal page without a valid, non-expired Supabase session token, THE Portal SHALL redirect the learner to the login page
3. WHEN a learner clicks the sign-out action, THE Portal SHALL terminate the Supabase session and redirect the learner to the login page
4. IF a learner submits invalid credentials (unrecognized email or incorrect password), THEN THE Portal SHALL display an error message indicating that authentication failed and SHALL NOT establish a session
5. WHEN the Supabase session token expires during an active browser session, THE Portal SHALL redirect the learner to the login page on the next navigation or API request

### Requirement 2: Learner Authorization Enforcement

**User Story:** As a platform operator, I want only enrolled learners to access portal endpoints, so that unauthorized users cannot view or modify learner data.

#### Acceptance Criteria

1. WHEN a request to `/api/portal/*` lacks an Authorization header or contains a token that Supabase Auth rejects (malformed, expired, or revoked), THE Learner_Auth_Middleware SHALL respond with 401 status and an error message indicating the authentication failure reason (missing token, invalid token, or expired token)
2. WHEN a request to `/api/portal/*` contains a valid token with `app_metadata.role` not equal to "learner", THE Learner_Auth_Middleware SHALL respond with 403 status and the message "Learner access required"
3. WHEN a request to `/api/portal/*` contains a valid learner token but no matching record exists in the learners table for that email, THE Learner_Auth_Middleware SHALL respond with 403 status and the message "Account not enrolled. Contact your program administrator."
4. WHEN a request to `/api/portal/*` contains a valid learner token with a matching learner record, THE Learner_Auth_Middleware SHALL attach the learner record to the request and proceed to the route handler
5. IF the Supabase Auth service is unreachable or returns a non-parseable response during token verification, THEN THE Learner_Auth_Middleware SHALL respond with 401 status and an error message indicating that authentication verification failed
6. WHEN a CORS preflight (OPTIONS) request is received on `/api/portal/*`, THE Learner_Auth_Middleware SHALL bypass token verification and pass the request to the next handler

### Requirement 3: Ownership Isolation

**User Story:** As a learner, I want to be certain that only my own data is visible and modifiable through the portal, so that my information remains private.

#### Acceptance Criteria

1. THE Portal_API SHALL scope every database query to the authenticated learner's ID, including queries for roadmaps, projects, events, readiness scores, and activities
2. WHEN a learner requests a resource (roadmap, project, event, readiness score, or activity) by ID that does not belong to the authenticated learner, THE Portal_API SHALL respond with 404 status and the message "Resource not found"
3. WHEN a learner submits a write operation (PATCH or PUT) targeting a resource that does not belong to the authenticated learner, THE Portal_API SHALL respond with 404 status and the message "Resource not found" without modifying any data
4. THE Portal_API SHALL never include fields or records belonging to a different learner in any response payload, including list endpoints and individual resource responses

### Requirement 4: Learner Profile Viewing and Editing

**User Story:** As a learner, I want to view and edit my profile information, so that I can keep my personal details up to date.

#### Acceptance Criteria

1. WHEN a learner requests `GET /api/portal/me`, THE Portal_API SHALL return the learner's full profile including all fields (id, name, email, photo, background, strengths, pathway, program, coach, status, joinDate) and computed fields (progress, readiness, lastActive, nextAction)
2. WHEN a learner submits `PUT /api/portal/me` with one or more valid editable fields (name, photo, background, strengths), THE Portal_API SHALL update only the submitted editable fields, leave unsubmitted editable fields unchanged, and return the updated full profile
3. WHEN a learner submits `PUT /api/portal/me` attempting to change immutable fields (email, pathway, program, coach, status, progress, readiness), THE Portal_API SHALL ignore those fields and apply only permitted changes
4. WHEN a learner submits a name that is empty or exceeds 255 characters, THE Portal_API SHALL reject the request with 400 status and a descriptive error message
5. WHEN a learner submits strengths with more than 10 items or any item exceeding 100 characters, THE Portal_API SHALL reject the request with 400 status and a descriptive error message
6. WHEN a learner submits a photo value exceeding 2048 characters or a background value exceeding 2000 characters, THE Portal_API SHALL reject the request with 400 status and a descriptive error message
7. WHEN a learner submits `PUT /api/portal/me` with no editable fields present in the request body, THE Portal_API SHALL reject the request with 400 status and a descriptive error message
8. WHEN a learner's profile is successfully updated via `PUT /api/portal/me`, THE API_Server SHALL log an activity record with type "profile"

### Requirement 5: Pathway Viewing

**User Story:** As a learner, I want to view my assigned pathway details, so that I can understand the milestones, skills, and criteria for my learning journey.

#### Acceptance Criteria

1. WHEN a learner requests `GET /api/portal/pathway`, THE Portal_API SHALL look up the pathway by matching the learner's assigned pathway name to pathways.name and return the pathway record including name, description, targetProfile, estimatedWeeks, programCategory, skills, milestones, projects, and readinessCriteria
2. THE Portal_API SHALL return pathway data as read-only (no mutation endpoints for pathway)
3. IF the authenticated learner has no pathway assigned (pathway field is null or empty), THEN THE Portal_API SHALL respond with 404 status and an error message indicating no pathway is assigned
4. IF the learner's assigned pathway name does not match any record in the pathways table, THEN THE Portal_API SHALL respond with 404 status and an error message indicating the pathway was not found

### Requirement 6: Roadmap Milestone Management

**User Story:** As a learner, I want to view my roadmap milestones and mark them as complete, so that I can track my progress through the pathway.

#### Acceptance Criteria

1. WHEN a learner requests `GET /api/portal/roadmaps`, THE Portal_API SHALL return all roadmap items belonging to the authenticated learner, ordered by dueDate ascending
2. WHEN a learner submits `PATCH /api/portal/roadmaps/:id` with a valid state value ("Not Started", "In Progress", or "Complete"), THE Portal_API SHALL update the roadmap item state and return the updated roadmap item along with the recomputed progress percentage and nextAction string
3. IF a learner submits `PATCH /api/portal/roadmaps/:id` for a roadmap item that does not belong to the learner or does not exist, THEN THE Portal_API SHALL respond with 404 status
4. WHEN a roadmap item state is updated, THE Derived_Value_Service SHALL recompute the learner's progress as `round((completed_items / total_items) * 100)`, returning 0 when total_items is 0
5. WHEN a roadmap item state is updated, THE Derived_Value_Service SHALL recompute the learner's nextAction field based on the priority rules defined in Requirement 11
6. WHEN a roadmap item state is updated, THE API_Server SHALL log an activity record with type "milestone"
7. IF a learner submits `PATCH /api/portal/roadmaps/:id` with a state value that is not one of "Not Started", "In Progress", or "Complete", THEN THE Portal_API SHALL reject the request with 400 status
8. IF a roadmap item's current state is "Complete", THEN THE Portal_API SHALL reject any PATCH request that changes the state to "Not Started" or "In Progress" with 400 status and a message indicating that completed milestones cannot be reverted

### Requirement 7: Project Progress Management

**User Story:** As a learner, I want to update my project completion percentage and status, so that my coach and I can track project progress.

#### Acceptance Criteria

1. WHEN a learner requests `GET /api/portal/projects`, THE Portal_API SHALL return all projects belonging to the authenticated learner
2. WHEN a learner submits `PATCH /api/portal/projects/:id` with a completion value between 0 and 100, THE Portal_API SHALL update the project completion and return the updated project record
3. IF a learner submits a completion value that is not an integer between 0 and 100 inclusive, THEN THE Portal_API SHALL reject the request with 400 status
4. IF a project's current status is "Complete", THEN THE Portal_API SHALL reject any PATCH request that changes the status to "In Progress" or "Not Started" with 400 status and the message "Cannot revert completed project"
5. WHEN a project's completion reaches 100, THE Portal_API SHALL automatically set the project status to "Complete"
6. WHEN a project's completion changes from 0 to a value greater than 0 and the current status is "Not Started", THE Portal_API SHALL automatically set the project status to "In Progress"
7. WHEN a project is updated, THE API_Server SHALL log an activity record with type "project"
8. WHEN a learner submits `PATCH /api/portal/projects/:id` for a project that does not belong to the authenticated learner, THE Portal_API SHALL respond with 404 status
9. WHEN a learner submits `PATCH /api/portal/projects/:id` with a status field, THE Portal_API SHALL ignore the status field and derive status solely from the completion value and auto-transition rules

### Requirement 8: Event Participation

**User Story:** As a learner, I want to view my assigned events and update their attendance status, so that I can manage my participation in scheduled activities.

#### Acceptance Criteria

1. WHEN a learner requests `GET /api/portal/events`, THE Portal_API SHALL return all events belonging to the authenticated learner
2. WHEN a learner submits `PATCH /api/portal/events/:id` with a status transition from "Upcoming" to "Registered" or from "Registered" to "Attended", THE Portal_API SHALL update the event status and return the updated event record
3. WHEN a learner submits `PATCH /api/portal/events/:id` with a status value that is not one of "Upcoming", "Registered", "Attended", or "Missed", THE Portal_API SHALL reject the request with 400 status
4. IF a learner submits `PATCH /api/portal/events/:id` with a status transition that is not "Upcoming" to "Registered" or "Registered" to "Attended", THEN THE Portal_API SHALL reject the request with 400 status and an error message indicating the invalid transition
5. WHEN a learner submits `PATCH /api/portal/events/:id` for an event that does not belong to the learner, THE Portal_API SHALL respond with 404 status
6. WHEN an event is updated, THE API_Server SHALL log an activity record with type "event"

### Requirement 9: Readiness Self-Assessment

**User Story:** As a learner, I want to self-assess my readiness across multiple dimensions, so that I can track my growth and identify areas for improvement.

#### Acceptance Criteria

1. WHEN a learner requests `GET /api/portal/readiness`, THE Portal_API SHALL return all readiness scores belonging to the authenticated learner, including the dimension name, score, and last-updated timestamp for each entry
2. WHEN a learner submits `PUT /api/portal/readiness` with scores for all dimensions defined in the learner's pathway readiness criteria, THE Portal_API SHALL upsert readiness scores (update existing dimensions, insert new ones) and return the updated scores
3. IF a readiness submission includes a score that is not an integer or falls outside the range 1–5, THEN THE Portal_API SHALL reject the request with 400 status
4. IF a readiness submission includes a dimension that does not exist in the learner's pathway readiness criteria, THEN THE Portal_API SHALL reject the request with 400 status and include the expected and received dimensions in the error response
5. IF a readiness submission does not include scores for all dimensions defined in the learner's pathway readiness criteria, THEN THE Portal_API SHALL reject the request with 400 status and include the missing dimensions in the error response
6. WHEN readiness scores are upserted, THE Derived_Value_Service SHALL recompute the learner's overall readiness as `round((average_score / 5) * 100)`, returning 0 when no scores exist
7. WHEN readiness scores are submitted, THE API_Server SHALL log an activity record with type "assessment"

### Requirement 10: Activity History

**User Story:** As a learner, I want to view my activity history, so that I can review what actions I have taken over time.

#### Acceptance Criteria

1. WHEN a learner requests `GET /api/portal/activities`, THE Portal_API SHALL return activity records belonging to the authenticated learner ordered by most recent first (descending by id), including each record's id, date, event, and type fields
2. WHEN a learner requests `GET /api/portal/activities` without pagination parameters, THE Portal_API SHALL apply a default limit of 20 and offset of 0, and SHALL include the total count of the learner's activity records in the response
3. WHEN a learner requests `GET /api/portal/activities` with valid limit (1–100) and offset (0 or greater) parameters, THE Portal_API SHALL return the corresponding page of activity records and the total count
4. IF a learner provides a limit or offset value that is not a non-negative integer, or a limit value exceeding 100, THEN THE Portal_API SHALL reject the request with 400 status

### Requirement 11: Derived Value Computation

**User Story:** As a learner, I want my progress, readiness, last active date, and next action to be automatically computed from my actual data, so that I always see accurate and current information.

#### Acceptance Criteria

1. WHEN any state-changing portal action occurs, THE Derived_Value_Service SHALL update the learner's `lastActive` field to the current date
2. THE Derived_Value_Service SHALL compute progress as `round((count_of_complete_roadmaps / count_of_all_roadmaps) * 100)`, returning 0 when no roadmaps exist
3. THE Derived_Value_Service SHALL compute readiness as `round((average_readiness_score / 5) * 100)`, scaled from the 1–5 score range to 0–100, returning 0 when no readiness scores exist
4. THE Derived_Value_Service SHALL compute nextAction by priority: first incomplete milestone by due date, then first in-progress project, then first upcoming event, defaulting to "All caught up!"
5. WHEN any state-changing portal action occurs, THE API_Server SHALL insert a corresponding activity record into `learner_activities` with the learner ID, event description, type, and current date

### Requirement 12: Portal Frontend Application

**User Story:** As a learner, I want a dedicated web application with clear navigation, so that I can easily access my dashboard, pathway, projects, readiness assessment, profile, and activity history.

#### Acceptance Criteria

1. THE Portal SHALL provide a login page at `/login` for learner authentication
2. THE Portal SHALL provide a dashboard page at `/` showing the learner's progress percentage, readiness percentage, next action, last active date, and upcoming milestones
3. THE Portal SHALL provide a pathway page at `/pathway` displaying milestones, projects, and events
4. THE Portal SHALL provide a projects page at `/projects` for viewing and updating project details
5. THE Portal SHALL provide a readiness page at `/readiness` for completing self-assessments based on pathway criteria
6. THE Portal SHALL provide a profile page at `/profile` for editing learner profile information
7. THE Portal SHALL provide an activity page at `/activity` displaying the learner's action timeline in reverse chronological order
8. THE Portal SHALL provide a persistent navigation element visible on all authenticated pages containing links to dashboard, pathway, projects, readiness, activity, and profile
9. IF the Portal fails to load data from the Portal_API for any page, THEN THE Portal SHALL display an error indication describing the failure and provide a retry action
10. WHILE data is being fetched from the Portal_API, THE Portal SHALL display a loading indicator on the affected page section

### Requirement 13: Input Validation

**User Story:** As a platform operator, I want all portal inputs validated server-side, so that invalid data cannot corrupt the system.

#### Acceptance Criteria

1. THE Portal_API SHALL validate all request bodies using Zod schemas before processing
2. WHEN a request body fails schema validation, THE Portal_API SHALL respond with 400 status and a JSON error response containing field-level validation messages identifying each invalid field and the reason for rejection
3. THE Portal_API SHALL enforce completion values as integers between 0 and 100 inclusive
4. THE Portal_API SHALL enforce readiness scores as integers between 1 and 5 inclusive
5. THE Portal_API SHALL enforce string length limits (name max 255 characters, background max 2000 characters, strengths items max 100 characters, max 10 strengths items)
6. IF a request body contains fields not defined in the corresponding Zod schema, THEN THE Portal_API SHALL strip those fields before processing and not persist them
7. IF a request to a portal endpoint that expects a JSON body contains a malformed or non-JSON body, THEN THE Portal_API SHALL respond with 400 status and an error message indicating invalid request format
