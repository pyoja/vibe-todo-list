import { Pool } from "pg";
import { loadEnvConfig } from "@next/env";

// Load environment variables from .env.local
const projectDir = process.cwd();
loadEnvConfig(projectDir);

async function migrate() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set");
    return;
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    console.log("Adding 'order' column to todo table...");

    // 1. Add column if not exists
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_name = 'todo'
          AND column_name = 'order'
        ) THEN
          ALTER TABLE todo ADD COLUMN "order" DOUBLE PRECISION DEFAULT 0;
        END IF;
      END $$;
    `);

    // 2. Initialize order based on createdAt (timestamp epoch) to keep existing order
    console.log("Initializing order values...");
    await pool.query(`
      UPDATE todo 
      SET "order" = EXTRACT(EPOCH FROM "createdAt")
      WHERE "order" = 0 OR "order" IS NULL;
    `);

    console.log("Migration completed successfully.");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await pool.end();
  }
}

migrate();
