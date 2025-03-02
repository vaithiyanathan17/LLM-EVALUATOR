const { Pool } = require('pg');
require('dotenv').config();

console.log("Connecting to:", process.env.DATABASE_URL);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

pool.connect()
  .then(() => console.log(`Connected to PostgreSQL: ${process.env.DATABASE_URL}`))
  .catch(err => console.error('Database connection error:', err));

module.exports = pool;
