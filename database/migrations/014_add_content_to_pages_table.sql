-- 014_add_content_to_pages_table.sql
ALTER TABLE pages
  ADD COLUMN IF NOT EXISTS content TEXT DEFAULT '';

-- NOTE: existing pages will have empty content by default
