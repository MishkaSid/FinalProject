const express = require('express');
const app = express();
const cors = require('cors');
const mysql = require('mysql');
const port = 3000 || process.env.PORT;

// Middleware to parse JSON requests
app.use(express.json());

// Basic route for testing
app.get('/', (req, res) => {
  res.send('Welcome to the Backend!');
});

// Example route for user login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  // Add authentication logic here
  res.json({ message: `Logged in as ${username}` });
});

// Example route for fetching user data
app.get('/user/:id', (req, res) => {
  const userId = req.params.id;
  // Fetch user data logic here
  res.json({ userId, name: 'John Doe', role: 'Student' });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
