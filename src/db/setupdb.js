-- 1. Users Table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  membership_status VARCHAR(50) DEFAULT 'standard'
);

-- 2. Messages Table (with a Foreign Key linking to users)
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  text TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  user_id INT REFERENCES users(id) ON DELETE CASCADE
);
