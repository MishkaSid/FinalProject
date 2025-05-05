const express = require("express");
require("dotenv").config();
const app = express();
const cors = require("cors");
app.use(cors());
app.use(express.json());

const db = require("./dbSingleton");

// Create a connection to the database
const connection = db.getConnection();

// Establish database connection
connection.connect((err) => {
  if (err) {
    console.error("Error connecting to database:", err);
    return;
  }
  console.log("Connected to database");

  // Example API route
  app.get("/api/test", (req, res) => {
    res.json({ message: "Backend is working!" });
  });

  // get all users
  app.get("/api/users", async (req, res) => {
    try {
      const [rows] = await connection.promise().query("SELECT * FROM users");
      res.json(rows);
    } catch (err) {
      console.error("Error fetching users:", err);
      res.status(500).json({ error: "Server error while fetching users" });
    }
  });

  // Start the server
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});