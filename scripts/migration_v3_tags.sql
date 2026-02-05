
-- Add tags column to todo table
ALTER TABLE todo ADD COLUMN IF NOT EXISTS "tags" text[] DEFAULT '{}';

-- Create index for faster tag searching
CREATE INDEX IF NOT EXISTS "idx_todo_tags" ON todo USING GIN ("tags");
