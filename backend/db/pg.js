const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();


const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: 
    process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => {
  console.error('Unexpected error on PostgreSQL pool', err);
  process.exit(-1);
});

const query = async (text, params = []) => {
  const result = await pool.query(text, params);
  return result;
};

module.exports = {
  pool,
  query,
};
