import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Try loading .env files with explicit paths
console.log("Attempting to load .env files...");
console.log("__dirname:", __dirname);

const pathsToTry = [
  join(__dirname, "..", "..", ".env"), // Project root
  join(__dirname, "..", ".env"),        // lib/db directory
];

for (const envPath of pathsToTry) {
  console.log("Trying path:", envPath);
  const result = config({ path: envPath });
  if (!result.error) {
    console.log("Loaded .env from:", envPath);
    break;
  } else {
    console.log("Failed to load from:", envPath, result.error);
  }
}

console.log("DATABASE_URL from process.env:", process.env.DATABASE_URL ? "Set (length: " + process.env.DATABASE_URL.length + ")" : "Not set");

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });

export * from "./schema";
