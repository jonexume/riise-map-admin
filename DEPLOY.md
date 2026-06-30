# Deployment Guide

## Architecture

```
Browser → Amplify Hosting (CloudFront + S3) → React SPA
Browser → API Gateway → Lambda (Express) → Supabase PostgreSQL
```

## Prerequisites

- AWS CLI configured (`aws configure`)
- AWS SAM CLI installed (`brew install aws-sam-cli`)
- An AWS Amplify app connected to this repo
- A Supabase project with the database schema applied

## Environment Variables

### Lambda (set during `sam deploy`)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Supabase pooled connection string (use port `6543` for connection pooling) |

### Amplify Frontend (set in Amplify Console → Environment Variables)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | API Gateway URL from SAM deploy output (e.g., `https://abc123.execute-api.us-east-1.amazonaws.com/prod`) |

## Deploy the API (Lambda + API Gateway)

First time (interactive — saves config to `samconfig.toml`):

```bash
pnpm run deploy:api
```

This will:
1. Build the Lambda bundle (`artifacts/api-server/dist-lambda/`)
2. Run `sam deploy --guided` which prompts for:
   - Stack name (e.g., `riisemap-api`)
   - Region
   - `DatabaseUrl` parameter (your Supabase connection string)
   - Confirm changeset

Subsequent deploys (after `samconfig.toml` exists):

```bash
pnpm run build:lambda && sam deploy
```

## Deploy the Frontend (Amplify)

Push to the connected branch — Amplify auto-builds and deploys via `amplify.yml`.

Make sure `VITE_API_URL` is set in Amplify Console to the API Gateway URL output from the SAM deploy.

## Local Development

```bash
# Terminal 1 — API server
cd artifacts/api-server
DATABASE_URL="your-supabase-url" PORT=8080 pnpm dev

# Terminal 2 — Frontend (proxies /api to localhost:8080 via vite config)
cd artifacts/riisemap
pnpm dev
```

## Supabase Connection String

Use the **pooled** connection string from Supabase Dashboard → Settings → Database:

```
postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
```

Port `6543` uses PgBouncer (transaction mode) which handles Lambda's concurrent connections properly.

## Updating the Database Schema

```bash
cd lib/db
npx drizzle-kit push
```

This applies schema changes directly to your Supabase database.
