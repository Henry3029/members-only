import express from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import pool from './db/pool.js';

const app = express();

app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// GET route to show the form
app.get('/sign-up', (req, res) => {
  res.render('signup');
});

// POST route with validation, sanitization, and custom password matching
app.post(
  '/sign-up',
  [
    // 1. Sanitize and validate fields
    body('first_name').trim().notEmpty().withMessage('First name is required').escape(),
    body('last_name').trim().notEmpty().withMessage('Last name is required').escape(),
    body('email').isEmail().withMessage('Must be a valid email address').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    
    // 2. Custom validator to check if confirm_password matches password
    body('confirm_password').custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    
    // If validation fails, re-render the form with error messages
    if (!errors.isEmpty()) {
      return res.status(400).render('signup', { errors: errors.array() });
    }

    try {
      const { first_name, last_name, email, password } = req.body;

      // 3. Hash the password using bcrypt
      const hashedPassword = await bcrypt.hash(password, 10);

      // 4. Save user to PostgreSQL database
      const query = `
        INSERT INTO users (first_name, last_name, email, password)
        VALUES ($1, $2, $3, $4)
        RETURNING id;
      `;
      await pool.query(query, [first_name, last_name, email, hashedPassword]);

      // Redirect to login or home page upon success
      res.redirect('/');
    } catch (err) {
      console.error(err);
      res.status(500).send('Error registering user');
    }
  }
);

// Choose a port (Render will automatically supply its own port via process.env.PORT)
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is up and running on port ${PORT}! 🚀`);
});

