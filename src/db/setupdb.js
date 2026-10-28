import 'dotenv/config';
import pool from './pool.js'; // Adjust path if your pool.js is located elsewhere

const setupTableSQL = `
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    membership_status VARCHAR(50) DEFAULT 'standard'
  );

  CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    text TEXT NOT NULL,
    added TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER REFERENCES users(id)
  );
`;

async function runSetup() {
  try {
    console.log('Connecting to database and setting up tables...');
    await pool.query(setupTableSQL);
    console.log('Tables created successfully! 🚀');
    process.exit(0);
  } catch (err) {
    console.error('Error creating tables:', err);
    process.exit(1);
  }
}

runSetup();
