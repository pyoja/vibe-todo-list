import fs from "fs";
import path from "path";
import { Pool } from "pg";

// .env.local 파일 파싱 함수
function loadEnv() {
  try {
    const envPath = path.join(process.cwd(), ".env.local");
    const envContent = fs.readFileSync(envPath, "utf-8");
    const env: Record<string, string> = {};

    envContent.split("\n").forEach((line) => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        // 값에 따옴표가 있으면 제거
        const key = match[1].trim();
        let value = match[2].trim();
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }
        env[key] = value;
      }
    });
    return env;
  } catch (e) {
    console.error("Failed to load .env.local", e);
    return {};
  }
}

async function migrate() {
  const env = loadEnv();
  const connectionString = process.env.DATABASE_URL || env.DATABASE_URL;

  if (!connectionString) {
    console.error("❌ DATABASE_URL not found in .env.local or process.env");
    process.exit(1);
  }

  console.log("🔌 Connecting to database...");
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    const client = await pool.connect();
    console.log("✅ Connected to database");

    try {
      console.log("🛠 Checking columns in 'folder' table...");

      const colorCheck = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='folder' AND column_name='color';
      `);

      if (colorCheck.rows.length === 0) {
        console.log("➕ Adding 'color' column to folder table...");
        await client.query(`
          ALTER TABLE folder 
          ADD COLUMN "color" TEXT DEFAULT 'blue-500';
        `);
        console.log("✅ 'color' column added.");
      } else {
        console.log("ℹ️ 'color' column already exists.");
      }

      console.log("🎉 Migration completed successfully!");
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("❌ Migration failed:", error);
  } finally {
    await pool.end();
  }
}

migrate();
