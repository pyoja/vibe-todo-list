import { Pool } from "pg";
import { loadEnvConfig } from "@next/env";

// Load environment variables using Next.js helper
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
    console.log("Adding 'deleted_at' column to todo table...");

    // 1. Add deleted_at to todo table
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_name = 'todo'
          AND column_name = 'deleted_at'
        ) THEN
          ALTER TABLE todo ADD COLUMN "deleted_at" TIMESTAMP WITH TIME ZONE DEFAULT NULL;
        END IF;
      END $$;
    `);

    console.log("Adding 'deleted_at' column to subtodos table...");

    // 2. Add deleted_at to subtodos table (optional but good for recovery)
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_name = 'subtodos'
          AND column_name = 'deleted_at'
        ) THEN
           ALTER TABLE subtodos ADD COLUMN "deleted_at" TIMESTAMP WITH TIME ZONE DEFAULT NULL;
        END IF;
      END $$;
    `);

    console.log("Migration completed successfully.");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await pool.end();
  }
}

migrate();
