// בקובץ זה נמצאים כל הפונקציות לטיפול בקורסים במערכת
// הקובץ מטפל בפעולות CRUD עבור קורסים: יצירה, קריאה, עדכון ומחיקה
// הוא מתחבר למסד הנתונים ומחזיר תגובות JSON ללקוח
//controllers
// coursesDataController.js

const db = require("../dbConnection");

// Fetch all courses
exports.getAllCourses = async (req, res) => {
  try {
    const connection = await db.getConnection();
    const [rows] = await connection.query("SELECT * FROM course");
    res.json(rows);
  } catch (err) {
    console.error("Error in getAllCourses:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Fetch a specific course by ID
exports.getCourseById = async (req, res) => {
  const { id } = req.params;

  try {
    const connection = await db.getConnection();
    const [rows] = await connection.query("SELECT * FROM course WHERE CourseID = ?", [id]);
    res.json(rows[0]);
  } catch (err) {
    console.error("Error in getCourseById:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Create a new course
exports.createCourse = async (req, res) => {
  const { CourseName } = req.body;

  try {
    const connection = await db.getConnection();
    const [result] = await connection.query(
      "INSERT INTO course (CourseName) VALUES (?)",
      [CourseName]
    );

    res.json({ CourseID: result.insertId, CourseName });
  } catch (err) {
    console.error("Error in createCourse:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Update a course
exports.updateCourse = async (req, res) => {
  const { id } = req.params;
  const { CourseName } = req.body;

  try {
    const connection = await db.getConnection();
    await connection.query(
      "UPDATE course SET CourseName = ? WHERE CourseID = ?",
      [CourseName, id]
    );
    res.json({ CourseID: id, CourseName });
  } catch (err) {
    console.error("Error in updateCourse:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Delete a course
exports.deleteCourse = async (req, res) => {
  const { id } = req.params;

  try {
    const connection = await db.getConnection();
    await connection.query("DELETE FROM course WHERE CourseID = ?", [id]);
    res.json({ message: `Course with CourseID ${id} deleted` });
  } catch (err) {
    console.error("Error in deleteCourse:", err);
    res.status(500).json({ error: "Server error" });
  }
};

