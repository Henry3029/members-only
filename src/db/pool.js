import dotenv from 'dotenv';
import pkg from 'pg';

dotenv.config();

const { Pool } = pkg;

// The Pool uses your DATABASE_URL from the .env file automatically
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  });

  export default pool;
  