// בקובץ זה נמצאות פונקציות לקבלת נתונים כלליים ממסד הנתונים
// הקובץ מספק גישה לנתונים בסיסיים כמו משתמשים, נושאים, תוכן תרגול ושאלות בחינה
// הוא משמש כנקודת גישה מרכזית לנתונים סטטיים במערכת
//controllers
// generalDataController.js
const db = require("../dbConnection");

/**
 * This module provides functions to retrieve general data from the database.
 * It includes methods to fetch data from specific tables, allowing retrieval
 * of all data at once. These functions handle database connections, execute
 * queries, and return the results in JSON format. Error handling is implemented
 * to ensure that any issues during data retrieval are logged and an appropriate
 * server error message is returned.
 */

/**
 * @function getUsers
 * @description Fetches all users from the database.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @returns {void}
 */
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

/**
 * @function getAdmins
 * @description Fetches all users with the 'Admin' role from the database.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @returns {void}
 */
exports.getAdmins = async (req, res) => {
  try {
    const connection = await db.getConnection();
    const [rows] = await connection.query(
      "SELECT * FROM users WHERE role = 'Admin'"
    );
    res.json(rows);
  } catch (err) {
    console.error("❌ Error in getAdmins:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * @function getTeachers
 * @description Fetches all users with the 'Teacher' role from the database.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @returns {void}
 */
exports.getTeachers = async (req, res) => {
  try {
    const connection = await db.getConnection();
    const [rows] = await connection.query(
      "SELECT * FROM users WHERE role = 'Teacher'"
    );
    res.json(rows);
  } catch (err) {
    console.error("❌ Error in getTeachers:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * @function getExaminees
 * @description Fetches all users with the 'Examinee' role from the database.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @returns {void}
 */
exports.getExaminees = async (req, res) => {
  try {
    const connection = await db.getConnection();
    const [rows] = await connection.query(
      "SELECT * FROM users WHERE role = 'Examinee'"
    );
    res.json(rows);
  } catch (err) {
    console.error("❌ Error in getExaminees:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * @function getPracticeData
 * @description Fetches all practice content from the database.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @returns {void}
 */
exports.getPracticeData = async (req, res) => {
  try {
    const connection = await db.getConnection();
    const [rows] = await connection.query("SELECT * FROM practice_content");
    res.json(rows);
  } catch (err) {
    console.error("❌ Error in getPracticeData:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * @function getExamData
 * @description Fetches all exam questions from the database.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @returns {void}
 */
exports.getExamData = async (req, res) => {
  try {
    const connection = await db.getConnection();
    const [rows] = await connection.query("SELECT * FROM exam_questions");
    res.json(rows);
  } catch (err) {
    console.error("❌ Error in getPracticeData:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * @function getVideos
 * @description Fetches all practice videos from the database.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @returns {void}
 */
exports.getVideos = async (req, res) => {
  try {
    const connection = await db.getConnection();
    const [rows] = await connection.query("SELECT * FROM practice_videos");
    res.json(rows);
  } catch (err) {
    console.error("❌ Error in getVideos:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getTopics = async (req, res) => {
  try {
    const connection = await db.getConnection();
    const [rows] = await connection.query("SELECT * FROM topics");
    res.json(rows);
  } catch (err) {
    console.error("❌ Error in getTopics:", err);
    res.status(500).json({ error: "Server error" });
  }
};
