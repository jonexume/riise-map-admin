import { config } from "dotenv";
import { join } from "path";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

// When the api-server runs, its current working directory is `artifacts/api-server`.
// Therefore, the .env file is located in the current directory.
const envPath = join(process.cwd(), ".env");

const result = config({ path: envPath });

if (result.error) {
  // If there's an error loading the .env file, we throw a detailed error.
  throw new Error(
    `Failed to load .env file from path: ${envPath}. Error: ${result.error.message}`
  );
}

// Now, we can safely check for the DATABASE_URL.
if (!process.env.DATABASE_URL) {
  throw new Error(
    `DATABASE_URL must be set. Check your .env file at: ${envPath}`
  );
}

const { Pool } = pg;
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });

export * from "./schema";