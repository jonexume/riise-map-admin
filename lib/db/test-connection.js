import { config } from "dotenv";
import path from "path";
import pg from "pg";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({ path: path.join(__dirname, "../.env") });
config({ path: path.join(__dirname, ".env") });

const { Pool } = pg;

async function testConnection() {
  console.log("Testing database connection...");
  console.log("\n🔍 Debug info:");
  
  const envPaths = [
    path.join(__dirname, "../.env"),
    path.join(__dirname, ".env")
  ];
  
  console.log("Trying to load .env files from:");
  envPaths.forEach(p => console.log("  -", p));
  
  console.log("\nBefore dotenv config - DATABASE_URL:", process.env.DATABASE_URL ? "Found" : "Not found");
  
  // Clear any existing DATABASE_URL first
  delete process.env.DATABASE_URL;
  
  // Load dotenv files again explicitly
  config({ path: envPaths[0], override: true });
  config({ path: envPaths[1], override: true });
  
  console.log("After dotenv config - DATABASE_URL:", process.env.DATABASE_URL ? "Found" : "Not found");

  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL is not set!");
    process.exit(1);
  }

  // Show full connection string (for debugging only)
  console.log("\nFull connection string:", process.env.DATABASE_URL);
  
  // Show masked connection string
  const maskedUrl = process.env.DATABASE_URL.replace(/:\/\/([^:]+):([^@]+)@/, '://$1:***@');
  console.log("Connection string (masked):", maskedUrl);

  try {
    console.log("\nAttempting to connect (this might take 10-30 seconds)...");
    
    // Add timeout
    const pool = new Pool({ 
      connectionString: process.env.DATABASE_URL,
      connectionTimeoutMillis: 15000,
      idleTimeoutMillis: 15000
    });
    
    const client = await Promise.race([
      pool.connect(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Connection timeout after 15 seconds")), 15000)
      )
    ]);
    
    console.log("✅ Successfully connected to Supabase!");
    
    // Test a simple query
    const result = await client.query("SELECT NOW()");
    console.log("✅ Test query successful:", result.rows[0]);
    
    client.release();
    await pool.end();
    console.log("✅ Connection test complete!");
  } catch (error) {
    console.error("❌ Connection failed:", error);
    console.error("\n💡 Hint:");
    console.error("1. Double-check your connection string in Supabase dashboard");
    console.error("2. Make sure your Supabase project is not paused");
    console.error("3. Verify your password is correct");
    process.exit(1);
  }
}

testConnection();