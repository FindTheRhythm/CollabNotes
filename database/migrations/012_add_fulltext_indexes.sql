-- 012_add_fulltext_indexes.sql

-- Full-text index for notes (title + content)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'notes_fulltext_idx') THEN
    CREATE INDEX notes_fulltext_idx ON notes USING GIN (to_tsvector('russian', coalesce(title,'') || ' ' || coalesce(content,'')));
  END IF;
END $$;

-- Full-text index for page_versions (content)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'page_versions_fulltext_idx') THEN
    CREATE INDEX page_versions_fulltext_idx ON page_versions USING GIN (to_tsvector('russian', coalesce(content,'')));
  END IF;
END $$;
