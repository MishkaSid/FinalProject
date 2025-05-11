const express = require("express");
const cors = require("cors");
require("dotenv").config();
const db = require("./dbSingleton");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/test", (req, res) => {
  res.json({ message: "Backend is working!" });
});

// Get all users
app.get("/api/users", async (req, res) => {
  try {
    const connection = await db.getConnection();
    const [rows] = await connection.query("SELECT * FROM users");
    res.json(rows);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Server error while fetching users" });
  }
});

// Get all practice questions
app.get('/api/practice-questions', async (req, res) => {
  try {
    const connection = await db.getConnection();
    const sql = `
      SELECT pc.content_id, pc.topic_name, pc.upload_date
      FROM practice_content pc
      JOIN exercise e ON pc.content_id = e.content_id
      WHERE pc.content_type = 'Exercise';
    `;
    const [rows] = await connection.query(sql);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching practice questions:", err);
    res.status(500).json({ error: "Server error fetching practice questions" });
  }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
