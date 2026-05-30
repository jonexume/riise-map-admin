import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

// This is the definitive path to the .env file for the api-server.
// By setting this explicitly, we avoid searching multiple locations and prevent errors.
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, "..", "..", "artifacts", "api-server", ".env");

// Load the environment variables from the specific path.
config({ path: envPath });

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