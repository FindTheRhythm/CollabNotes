-- run_all_migrations.sql
-- This script runs all migrations in the correct order

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Import migration files
\i migrations/001_create_users_table.sql
\i migrations/002_create_notes_table.sql
\i migrations/003_create_shared_access_table.sql
\i migrations/004_create_comments_table.sql
\i migrations/005_create_refresh_tokens_table.sql

-- Import seed data
\i seeds/seeds_initial_data.sql
