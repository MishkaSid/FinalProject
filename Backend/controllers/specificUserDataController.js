const db = require("../dbConnection");

/**
 * This module provides functions to retrieve specific user data from the database.
 * It includes methods to fetch data for specific users, teachers, and admins.
 * These functions handle database connections, execute queries, and return the results in JSON format.
 * Error handling is implemented to ensure that any issues during data retrieval are logged and an appropriate
 * server error message is returned.
 */


// Fetch specific user by ID
exports.getSpecificUser = async (req, res) => {
  const { id } = req.params;

  try {
    const connection = await db.getConnection();
    const [rows] = await connection.query(
      "SELECT * FROM users WHERE id_number = ?",
      [id]
    );
    res.json(rows[0]); // Return the user data
  } catch (err) {
    console.error("Error in getSpecificUser:", err); // Log error
    res.status(500).json({ error: "Server error" }); // Send error response
  }
};

// Fetch specific examinee by ID
exports.getSpecificExaminee = async (req, res) => {
  const { id } = req.params;

  try {
    const connection = await db.getConnection();
    const [rows] = await connection.query(
      "SELECT * FROM users WHERE id_number = ? AND role = 'Examinee'",
      [id]
    );
    res.json(rows[0]); // Return the examinee data
  } catch (err) {
    console.error("Error in getSpecificExaminee:", err); // Log error
    res.status(500).json({ error: "Server error" }); // Send error response
  }
};

// Fetch specific teacher by ID
exports.getSpecificTeacher = async (req, res) => {
  const { id } = req.params;

  try {
    const connection = await db.getConnection();
    const [rows] = await connection.query(
      "SELECT * FROM users WHERE id_number = ? AND role = 'Teacher'",
      [id]
    );
    res.json(rows[0]); // Return the teacher data
  } catch (err) {
    console.error("Error in getSpecificTeacher:", err); // Log error
    res.status(500).json({ error: "Server error" }); // Send error response
  }
};

// Fetch specific admin by ID
exports.getSpecificAdmin = async (req, res) => {
  const { id } = req.params;

  try {
    const connection = await db.getConnection();
    const [rows] = await connection.query(
      "SELECT * FROM users WHERE id_number = ? AND role = 'Admin'",
      [id]
    );
    res.json(rows[0]); // Return the admin data
  } catch (err) {
    console.error("Error in getSpecificAdmin:", err); // Log error
    res.status(500).json({ error: "Server error" }); // Send error response
  }
};

