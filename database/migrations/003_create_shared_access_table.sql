-- 003_create_shared_access_table.sql

CREATE TABLE IF NOT EXISTS shared_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    permission VARCHAR(50) NOT NULL DEFAULT 'READ' CHECK (permission IN ('READ', 'EDIT')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(note_id, user_id)
);

CREATE INDEX idx_shared_access_note_id ON shared_access(note_id);
CREATE INDEX idx_shared_access_user_id ON shared_access(user_id);
CREATE INDEX idx_shared_access_permission ON shared_access(permission);
