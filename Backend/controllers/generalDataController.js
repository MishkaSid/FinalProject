const db = require("../dbConnection");

/**
 * This module provides functions to retrieve general data from the database.
 * It includes methods to fetch data from specific tables, allowing retrieval
 * of all data at once. These functions handle database connections, execute
 * queries, and return the results in JSON format. Error handling is implemented
 * to ensure that any issues during data retrieval are logged and an appropriate
 * server error message is returned.
 */


//fetching all users
exports.getUsers = async (req, res) => {
  try {
    const connection = await db.getConnection();
    const rows = await connection.query("SELECT * FROM users");
    res.json(rows);
  } catch (err) {
    console.error("❌ Error in getUsers:", err);
    res.status(500).json({ error: "Server error" });
  }
};

//fetching all admins
exports.getAdmins = async (req, res) => {
  try {
    const connection = await db.getConnection();
    const [rows] = await connection.query("SELECT * FROM users WHERE role = 'Admin'");
    res.json(rows);
  } catch (err) {
    console.error("❌ Error in getAdmins:", err);
    res.status(500).json({ error: "Server error" });
  }
}

//fetching all teachers
exports.getTeachers = async (req,res ) => {
  try {
    const connection = await db.getConnection();
    const [rows] = await connection.query("SELECT * FROM users WHERE role = 'Teacher'");
    res.json(rows);
  } catch (err) {
    console.error("❌ Error in getTeachers:", err);
    res.status(500).json({ error: "Server error" });
  }
}

//fetching all examinees
exports.getExaminees = async (req, res) => {
  try {
    const connection = await db.getConnection();
    const [rows] = await connection.query("SELECT * FROM users WHERE role = 'Examinee'");
    res.json(rows);
  } catch (err) {
    console.error("❌ Error in getExaminees:", err);
    res.status(500).json({ error: "Server error" });
  }
}

//fetching all practice data
exports.getPracticeData = async (req, res) => {
  try {
    const connection = await db.getConnection();
    const [rows] = await connection.query("SELECT * FROM practice_data");
    res.json(rows);
  } catch (err) {
    console.error("❌ Error in getPracticeData:", err); // Add this line
    res.status(500).json({ error: "Server error" });
  }
};

// fetch all exam data
exports.getExamData = async (req, res) => {
  try {
    const connection = await db.getConnection();
    const [rows] = await connection.query("SELECT * FROM exam_data");
    res.json(rows);
  } catch (err) {
    console.error("❌ Error in getPracticeData:", err); // Add this line
    res.status(500).json({ error: "Server error" });
  }
};

// fetching all videos
exports.getVideos = async (req, res) => {
  try {
    const connection = await db.getConnection();
    const [rows] = await connection.query("SELECT * FROM videos");
    res.json(rows);
  } catch (err) {
    console.error("❌ Error in getVideos:", err); // Add this line
    res.status(500).json({ error: "Server error" });
  }
};