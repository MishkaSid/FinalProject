/**
 * 
 * *************   IN PROGRESS **************
 * 
 */
const express = require('express');
const router = express.Router();
const db = require('../dbConnection');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Secret for signing JWTs
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Check if user exists
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = rows[0];

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // 2. Compare password using bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // 3. Generate JWT
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        name: user.name,
      },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    // 4. Return user data (omit password)
    const userInfo = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    return res.json({ token, user: userInfo });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

