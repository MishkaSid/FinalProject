const express = require('express');
const router = express.Router();
const db = require('../dbConnection');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Secret for signing JWTs
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// Login route: handles user authentication
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('Login request received', email, password);

  try {
    // Connect to the database
    const connection = await db.getConnection();
    console.log('Connected to database');

    // Check if user exists in the database
    const [rows] = await connection.query('SELECT * FROM users WHERE Email = ?', [email]);
    const user = rows[0];

    // If user doesn't exist, return error
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Compare provided password with stored hashed password
    const isMatch = await bcrypt.compare(password, user.Password);
    console.log('Password match:', isMatch);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // Generate a JWT for the authenticated user
    const token = jwt.sign(
      { id: user.UserId, role: user.Role, name: user.Name },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    // Send token and user info to the client
    const userInfo = { id: user.UserId, email: user.Email, name: user.Name, role: user.Role };
    return res.json({ token, user: userInfo });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

