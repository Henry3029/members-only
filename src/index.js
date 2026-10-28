import 'dotenv/config'; // 1. Load environment variables first!
import express from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import pool from './db/pool.js';
import session from 'express-session';
import passport from './config/passport.js';

const app = express();

app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', './views');

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

// 1. Home Route: Fetch messages and pass user + messages to index.ejs
app.get('/', async (req, res) => {
  try {
    const query = `
      SELECT messages.*, users.first_name, users.last_name 
      FROM messages 
      JOIN users ON messages.user_id = users.id 
      ORDER BY added DESC;
    `;
    const { rows } = await pool.query(query);
    
    res.render('index', { user: req.user, messages: rows });
  } catch (err) {
    console.error('Home route database error:', err);
    res.status(500).send('Error loading home page');
  }
});

// 2. Sign Up Routes
app.get('/sign-up', (req, res) => {
  res.render('signup');
});

app.post(
  '/sign-up',
  [
    body('first_name').trim().notEmpty().withMessage('First name is required').escape(),
    body('last_name').trim().notEmpty().withMessage('Last name is required').escape(),
    body('email').isEmail().withMessage('Must be a valid email address').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('confirm_password').custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      return res.status(400).render('signup', { errors: errors.array() });
    }

    try {
      const { first_name, last_name, email, password } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);

      const query = `
        INSERT INTO users (first_name, last_name, email, password)
        VALUES ($1, $2, $3, $4)
        RETURNING id;
      `;
      await pool.query(query, [first_name, last_name, email, hashedPassword]);

      res.redirect('/log-in');
    } catch (err) {
      console.error(err);
      res.status(500).send('Error registering user');
    }
  }
);

// 3. Authentication Routes
app.get('/log-in', (req, res) => {
  res.render('login');
});

app.post(
  '/log-in',
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/log-in',
  })
);

app.get('/log-out', (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
});

// 4. Join Club Routes
app.get('/join-club', (req, res) => {
  if (!req.user) {
    return res.redirect('/log-in');
  }
  res.render('join-club');
});

app.post('/join-club', async (req, res) => {
  if (!req.user) {
    return res.redirect('/log-in');
  }

  const { passcode } = req.body;

  if (passcode !== process.env.CLUB_PASSCODE) {
    return res.status(400).render('join-club', { error: 'Incorrect passcode! Try again.' });
  }

  try {
    const userId = req.user.id; 
    const query = `
      UPDATE users 
      SET membership_status = 'member' 
      WHERE id = $1;
    `;
    await pool.query(query, [userId]);

    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error upgrading membership status');
  }
});

// 5. Message Creation Routes
app.get('/new-message', (req, res) => {
  if (!req.user) {
    return res.redirect('/log-in');
  }
  res.render('new-message');
});

app.post('/new-message', async (req, res) => {
  if (!req.user) {
    return res.redirect('/log-in');
  }

  try {
    const { title, text } = req.body;
    const query = `
      INSERT INTO messages (title, text, user_id) 
      VALUES ($1, $2, $3);
    `;
    await pool.query(query, [title, text, req.user.id]);
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error saving message');
  }
});

// Port configuration
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is up and running on port ${PORT}! `);
});
