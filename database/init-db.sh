#!/bin/bash

# init-db.sh - Initialize PostgreSQL database

set -e

POSTGRES_HOST=${DB_HOST:-localhost}
POSTGRES_PORT=${DB_PORT:-5432}
POSTGRES_DB=${DB_NAME:-collabnotes}
POSTGRES_USER=${DB_USER:-postgres}
POSTGRES_PASSWORD=${DB_PASSWORD:-postgres_password}

echo "Waiting for PostgreSQL to be ready..."
until PGPASSWORD=$POSTGRES_PASSWORD psql -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT 1" 2>/dev/null; do
    sleep 1
done

echo "PostgreSQL is ready!"
echo "Running database migrations..."

# Get directory of this script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Run migrations in order
for migration in "$DIR"/migrations/*.sql; do
    if [ -f "$migration" ]; then
        echo "Running migration: $(basename $migration)"
        PGPASSWORD=$POSTGRES_PASSWORD psql -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f "$migration"
    fi
done

echo "Running seeds..."
PGPASSWORD=$POSTGRES_PASSWORD psql -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f "$DIR/seeds/seeds_initial_data.sql"

echo "Database initialization completed!"
