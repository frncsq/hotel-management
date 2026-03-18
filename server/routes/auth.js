const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');

const router = express.Router();

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, username: user.email, role: user.role }, // Note: we store username in 'email' column
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '24h' }
  );
};

// Signup -> /register
router.post('/register', async (req, res) => {
  const { name, identity, username, password, confirm } = req.body;
  
  if (!name || !username || !password) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  if (password !== confirm) {
    return res.status(401).json({ success: false, message: 'Passwords do not match' });
  }

  try {
    // We map 'username' to 'email' in the DB
    const userExists = await db.query('SELECT * FROM users WHERE email = $1', [username]);
    if (userExists.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'User already exists' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const userRole = identity || 'guest';
    
    const newUser = await db.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email as username, role',
      [name, username, hashed, userRole]
    );

    const user = newUser.rows[0];
    const token = generateToken(user);

    res.status(201).json({ success: true, token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Signin -> /login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password are required' });
  }

  try {
    const userResult = await db.query('SELECT * FROM users WHERE email = $1', [username]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const user = userResult.rows[0];
    const match = await bcrypt.compare(password, user.password);
    
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user);
    res.json({ success: true, token, user: { id: user.id, name: user.name, username: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get current user profile
router.get('/me', require('../middleware/auth').verifyToken, async (req, res) => {
  try {
    const userResult = await db.query('SELECT id, name, email as username, role FROM users WHERE id = $1', [req.user.id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user: userResult.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;
