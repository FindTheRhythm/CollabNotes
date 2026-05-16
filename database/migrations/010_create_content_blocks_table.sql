-- 010_create_content_blocks_table.sql

CREATE TABLE IF NOT EXISTS content_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id UUID NOT NULL,
    type VARCHAR(50) NOT NULL,
    content JSONB,
    position INTEGER NOT NULL DEFAULT 0,
    style JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE content_blocks
  ADD CONSTRAINT fk_content_blocks_page FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_content_blocks_page_id ON content_blocks(page_id);
CREATE INDEX IF NOT EXISTS idx_content_blocks_page_position ON content_blocks(page_id, position);
