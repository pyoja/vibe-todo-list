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
    console.log("Starting migration for Recurring Todos and Sub-tasks...");

    // 1. Add recurrence columns to 'todo' table
    // Note: Table name is 'todo' based on previous files, not 'todos' as I assumed in SQL artifact.
    // Let's verify table name in 'app/actions/todo.ts': "FROM todo t". Yes, it is 'todo'.
    console.log("Adding recurrence columns to 'todo' table...");
    await pool.query(`
      ALTER TABLE todo 
      ADD COLUMN IF NOT EXISTS "isRecurring" BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS "recurrencePattern" TEXT, -- 'daily', 'weekly', 'monthly'
      ADD COLUMN IF NOT EXISTS "recurrenceInterval" INTEGER DEFAULT 1;
    `);
    // Note: Using camelCase for column names to match existing schema style if possible?
    // Checking todo.ts: "userId", "folderId". It uses quotes for camelCase.
    // "content", "isCompleted" (quoted?), "createdAt" (quoted?).
    // Let's look at `todo.ts` again.
    // SELECT t.* ... FROM todo t
    // createTodo: INSERT INTO todo (content, "userId", "folderId", priority, "dueDate")
    // It seems camelCase is used with quotes for columns like "userId", "dueDate".
    // "priority" is lowercase.
    // Let's stick to camelCase with quotes for new columns to be consistent with "isCompleted", "createdAt".

    // 2. Create 'sub_todo' table (singular to match 'todo'?) or 'sub_todos'?
    // Let's match the pattern. 'todo' is singular. So 'sub_todo'?
    // Or maybe just 'subtodo'. Let's go with 'sub_todo'.
    console.log("Creating 'sub_todo' table...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sub_todo (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        "todoId" UUID REFERENCES todo(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        "isCompleted" BOOLEAN DEFAULT FALSE,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "order" INTEGER DEFAULT 0
      );
    `);

    // 3. Add index
    console.log("Adding index...");
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_sub_todo_todo_id ON sub_todo("todoId");
    `);

    console.log("Migration completed successfully.");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await pool.end();
  }
}

migrate();
