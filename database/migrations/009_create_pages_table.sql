-- 009_create_pages_table.sql

CREATE TABLE IF NOT EXISTS pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    section_id UUID NOT NULL,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE pages
  ADD CONSTRAINT fk_pages_section FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_pages_section_id ON pages(section_id);
