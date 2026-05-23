import pg from "pg";

const { Pool } = pg;

// Use the EXACT connection string directly in the script
const DATABASE_URL = "postgresql://postgres.lmirhhmprmotogdyubyv:c0detv2026@@@aws-1-us-west-2.pooler.supabase.com:6543/postgres";

async function testConnection() {
  console.log("Testing database connection...");
  console.log("Using hostname:", new URL(DATABASE_URL).hostname);

  try {
    const pool = new Pool({ 
      connectionString: DATABASE_URL,
      connectionTimeoutMillis: 15000
    });
    
    const client = await pool.connect();
    console.log("✅ Successfully connected to Supabase!");
    
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