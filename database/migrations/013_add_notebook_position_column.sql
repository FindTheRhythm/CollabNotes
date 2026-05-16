-- 013_add_notebook_position_column.sql

ALTER TABLE notebooks
  ADD COLUMN IF NOT EXISTS position INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_notebooks_workspace_id_position ON notebooks(workspace_id, position);
