const express = require("express");
const app = express();
const cors = require("cors");
app.use(express.json());

const db = require("./dbSingleton");

// Establish database connection
db.getConnection().then((connection) => {
    console.log("Connected to database");

    // Example API route
    app.get("/api/test", (req, res) => {
      res.json({ message: "Backend is working!" });
    });
    // get all users
    app.get("/api/users", async (req, res) => {
      try {
        const connection = await db.getConnection();
        const [rows] = await connection.promise().query("SELECT * FROM users");
        res.json(rows);
      } catch (err) {
        console.error("Error fetching users:", err);
        res.status(500).json({ error: "Server error while fetching users" });
      }
    });
    

  })
  .catch((err) => {
    console.error("Error connecting to database:", err);
  });

  // Start the server
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });