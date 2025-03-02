const pool = require('./db');

const createTables = async () => {
  try {
    await pool.query(`
          CREATE TABLE IF NOT EXISTS datasets (
              id SERIAL PRIMARY KEY,
              filename VARCHAR(255) NOT NULL,
              filepath VARCHAR(255) NOT NULL,
              columns JSONB NOT NULL,
              user_data JSONB NOT NULL,
              uploaded_at TIMESTAMP DEFAULT NOW()
          );
    `);
    console.log('Tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
  } finally {
    pool.end();
  }
};

createTables();
