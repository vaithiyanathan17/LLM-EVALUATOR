#!/bin/bash
set -e  # Exit immediately if any command fails

NEW_DB="llm_eval_db"

# Wait until PostgreSQL is ready
echo "Waiting for PostgreSQL to be ready..."
until PGPASSWORD="$POSTGRES_PASSWORD" psql -h postgres_db -U "$POSTGRES_USER" -d postgres -c '\q' 2>/dev/null; do
  echo "PostgreSQL is not ready yet. Retrying in 2 seconds..."
  sleep 2
done

echo "PostgreSQL is ready!"

# Check if the database exists before creating it
DB_EXISTS=$(PGPASSWORD="$POSTGRES_PASSWORD" psql -h postgres_db -U "$POSTGRES_USER" -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname = '$NEW_DB'")

if [[ "$DB_EXISTS" != "1" ]]; then
  echo "Creating database: $NEW_DB"
  PGPASSWORD="$POSTGRES_PASSWORD" psql -h postgres_db -U "$POSTGRES_USER" -d postgres -c "CREATE DATABASE $NEW_DB;"
else
  echo "Database $NEW_DB already exists"
fi

echo "Using database: $NEW_DB"

# Run table creation queries inside llm_eval_db
PGPASSWORD="$POSTGRES_PASSWORD" psql -h postgres_db -U "$POSTGRES_USER" -d "$NEW_DB" <<EOSQL
  CREATE TABLE IF NOT EXISTS datasets (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    filepath VARCHAR(255) NOT NULL,
    columns JSONB NOT NULL,
    uploaded_at TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS dataset_rows (
    id SERIAL PRIMARY KEY,
    dataset_id INT REFERENCES datasets(id) ON DELETE CASCADE,
    row_data JSONB NOT NULL
  );

  CREATE TABLE IF NOT EXISTS prompts (
    id SERIAL PRIMARY KEY,
    dataset_id INT REFERENCES datasets(id) ON DELETE CASCADE,
    template TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS generated_prompts (
    id SERIAL PRIMARY KEY,
    template_id INT REFERENCES prompts(id) ON DELETE CASCADE,
    dataset_id INT REFERENCES datasets(id) ON DELETE CASCADE,
    filled_prompt TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS llm_responses (
    id SERIAL PRIMARY KEY,
    generated_prompt_id INT REFERENCES generated_prompts(id) ON DELETE CASCADE,
    llm_provider VARCHAR(50) NOT NULL,
    response TEXT NOT NULL,
    evaluation_status TEXT DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS evaluations (
    id SERIAL PRIMARY KEY,
    llm_response_id INT REFERENCES llm_responses(id) ON DELETE CASCADE,
    correctness INT CHECK (correctness BETWEEN 1 AND 10),
    faithfulness INT CHECK (faithfulness BETWEEN 1 AND 10),
    created_at TIMESTAMP DEFAULT NOW()
  );
EOSQL

echo "Database schema created successfully!"