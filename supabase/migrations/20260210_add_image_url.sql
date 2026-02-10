-- by jh 20260210: Todo/SubTodo 이미지 첨부 기능을 위한 컬럼 추가
ALTER TABLE todo ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE sub_todo ADD COLUMN IF NOT EXISTS image_url TEXT;
