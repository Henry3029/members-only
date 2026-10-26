import express from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import pool from './db/pool.js';
import session from 'express-session';
import passport from './config/passport.js';

const app = express();

app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// Session and Passport middleware
app.use(
  session({ 
    secret: process.env.SESSION_SECRET || 'cats', 
    resave: false, 
    saveUninitialized: false 
  })
);
app.use(passport.initialize());
app.use(passport.session());

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

// GET route to display the login form
app.get('/log-in', (req, res) => {
  res.render('login');
});

// POST route to handle authentication via Passport
app.post(
  '/log-in',
  passport.authenticate('local', {
    successRedirect: '/',       // Where to go if login succeeds
    failureRedirect: '/log-in', // Where to go if login fails
  })
);

// GET route to log the user out
app.get('/log-out', (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
});



// 1. GET route to show the "Join Club" form view
app.get('/join-club', (req, res) => {
  res.render('join-club');
});

// 2. POST route to handle the passcode submission and update the database
app.post('/join-club', async (req, res) => {
  const { passcode } = req.body;

  // Check if the entered passcode matches your .env secret
  if (passcode !== process.env.CLUB_PASSCODE) {
    // If wrong, re-render the form with an error message
    return res.status(400).render('join-club', { error: 'Incorrect passcode! Try again.' });
  }

  try {
    // NOTE: In the next step (Passport.js), req.user will hold the logged-in user's info.
    // For now, assuming you have req.user available:
    const userId = req.user.id; 

    // Run the SQL query directly here using pool.query
    const query = `
      UPDATE users 
      SET membership_status = 'member' 
      WHERE id = $1;
    `;
    await pool.query(query, [userId]);

    // Send them back to the home page after successfully joining
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error upgrading membership status');
  }
});


// Choose a port (Render will automatically supply its own port via process.env.PORT)
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is up and running on port ${PORT}! 🚀`);
});

