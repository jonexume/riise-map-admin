# RiiseMap Admin

Organization-side admin platform for managing funded programs, tracking learner progress, and generating impact reports.

## Getting Started

```bash
pnpm install
pnpm --filter @workspace/api-server dev   # API on port 8080
pnpm --filter @workspace/riisemap dev     # Frontend on port 3000
```

## Deploy

```bash
pnpm run build:lambda && sam deploy        # API to AWS Lambda
git push origin rollback-may27             # Frontend via Amplify (auto-deploys)
```

## End-to-End Tests

Tests run against the deployed site using Playwright.

### Run all tests

```bash
pnpm test:e2e
```

### Run specific test file

```bash
npx playwright test tests/crud.spec.ts
npx playwright test tests/navigation.spec.ts
```

### Run a single test by name

```bash
npx playwright test --grep "Create a funding source"
```

### View HTML report with screenshots

```bash
npx playwright test --reporter=html
npx playwright show-report
```

### What the tests cover

**Auth Flow Tests** (`tests/auth-flow.spec.ts`) — 20 tests

| Section | What it tests |
|---------|--------------|
| Login Page (5) | Form renders, "Create one" link, "Forgot password?" link, invalid credentials error, loading state |
| Signup Page (5) | Navigation from login, form fields, password hint, back-to-login link, duplicate email error, loading state |
| Forgot Password Page (4) | Navigation from login, form fields, back-to-login link, submitting navigates to reset page |
| Reset Password Page (4) | Code & password fields render, displays target email, back-to-login link, invalid code error |
| Cross-Page Navigation (3) | Login↔Signup round trip, Login→Forgot→Reset→Login round trip, successful login reaches app |

**CRUD Tests** (`tests/crud.spec.ts`) — 10 tests

| Test | What it does |
|------|-------------|
| Create a funding source | Opens modal, fills name/objectives/amount/learners, submits, verifies record appears |
| Delete a funding source | Finds the test record, deletes it, verifies removal |
| Create a program | Opens modal, fills name/description, verifies form is submittable |
| Delete a program | Selects program via checkbox, bulk-deletes |
| Create a learner | Opens invite flow, fills name/email, submits |
| Delete a learner | Selects learner via checkbox, bulk-deletes, verifies removal |
| Home page loads | Verifies priorities section renders |
| Impact page loads | Verifies portfolio overview renders |
| Pathways page loads | Verifies heading appears |
| Settings page loads | Verifies heading appears |

**Navigation & Button Tests** (`tests/navigation.spec.ts`) — 37 tests

| Section | What it tests |
|---------|--------------|
| Sidebar Navigation (6) | Every sidebar link navigates to the correct page |
| Home Page Buttons (5) | All quick action buttons link to correct destinations, priority "View" button navigates |
| Learners Page Buttons (5) | Invite modal opens, Import CSV dialog opens, View goes to detail, Edit opens form, Back returns to list |
| Programs Page Buttons (4) | Create modal opens, View goes to detail, Back returns to list, Edit opens modal |
| Pathways Page Buttons (2) | Add Pathway opens form, Import CSV opens dialog |
| Funding Sources Buttons (2) | Add opens modal, View goes to detail |
| Impact Page Buttons (3) | Print Report button exists, Email Report button exists, Funding source selector has options |
| Input & Selection (10) | Search filters learners, status/coach/pathway dropdowns work, column sorting works, grid/list toggle works, Impact selectors change view, form fields accept input, Pathways multi-step form navigates |

### Failure screenshots

When a test fails, a screenshot is saved to `test-results/[test-name]/test-failed-1.png`. Open the folder:

```bash
open test-results/
```

### Configuration

- **Target URL:** `https://app.riisemap.org`
- **Browser:** Chromium (headless)
- **Timeout:** 60 seconds per test
- **Config file:** `playwright.config.ts`
