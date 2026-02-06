import { Pool } from "pg";
import { loadEnvConfig } from "@next/env";

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
    console.log("Checking and adding 'tags' column to todo table...");

    await pool.query(`
      DO $$
      BEGIN
        -- tags 컬럼 추가 (없을 경우)
        IF NOT EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_name = 'todo'
          AND column_name = 'tags'
        ) THEN
          ALTER TABLE todo ADD COLUMN "tags" text[] DEFAULT '{}';
          RAISE NOTICE 'Added tags column to todo table';
        END IF;
      END $$;
    `);

    console.log("Creating index for tags...");
    await pool.query(`
      CREATE INDEX IF NOT EXISTS "idx_todo_tags" ON todo USING GIN ("tags");
    `);

    console.log("Migration completed successfully.");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await pool.end();
  }
}

migrate();
