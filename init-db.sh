#!/bin/bash
set -e

NEW_DB="llm_eval_db"

# Wait until PostgreSQL is ready
until psql -U "$POSTGRES_USER" -c '\q'; do
  echo "Waiting for PostgreSQL to start..."
  sleep 2
done

# Check if the database exists before creating it
DB_EXISTS=$(psql -U "$POSTGRES_USER" -tc "SELECT 1 FROM pg_database WHERE datname = '$NEW_DB'" | tr -d '[:space:]')

if [ "$DB_EXISTS" != "1" ]; then
  echo "Creating database: $NEW_DB"
  psql -U "$POSTGRES_USER" -c "CREATE DATABASE $NEW_DB;"
else
  echo "Database $NEW_DB already exists"
fi
