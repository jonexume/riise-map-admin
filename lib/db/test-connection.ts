import { config } from "dotenv";
import path from "path";
import pg from "pg";

config({ path: path.join(__dirname, "../.env") });
config({ path: path.join(__dirname, ".env") });

const { Pool } = pg;

async function testConnection() {
  console.log("Testing database connection...");
  console.log("DATABASE_URL:", process.env.DATABASE_URL ? "Found" : "Not found");

  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL is not set!");
    process.exit(1);
  }

  try {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const client = await pool.connect();
    
    console.log("✅ Successfully connected to Supabase!");
    
    // Test a simple query
    const result = await client.query("SELECT NOW()");
    console.log("✅ Test query successful:", result.rows[0]);
    
    client.release();
    await pool.end();
    console.log("✅ Connection test complete!");
  } catch (error) {
    console.error("❌ Connection failed:", error);
    process.exit(1);
  }
}

testConnection();