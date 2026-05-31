import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

// In Lambda, DATABASE_URL is set via environment variables.
// Locally, try to load from .env files.
if (!process.env.DATABASE_URL) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const dotenv = require("dotenv");
    const path = require("path");
    dotenv.config({ path: path.resolve(process.cwd(), ".env") });
  } catch {
    // dotenv not available or failed — that's fine if DATABASE_URL is already set
  }
}

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });

export * from "./schema";
