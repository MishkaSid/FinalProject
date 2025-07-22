const db = require("../dbConnection");

// Fetch all courses
exports.getAllCourses = async (req, res, next) => {
  try {
    const connection = await db.getConnection();
    const [rows] = await connection.query("SELECT * FROM course");
    res.json(rows);
  } catch (err) {
    console.error("Error in getAllCourses:", err);
    next({ error: "Server error" }, 500);
  }
};

// Fetch a specific course by ID
exports.getCourseById = async (req, res, next) => {
  const { id } = req.params;

  try {
    const connection = await db.getConnection();
    const [rows] = await connection.query("SELECT * FROM course WHERE CourseID = ?", [id]);
    res.json(rows[0]);
  } catch (err) {
    console.error("Error in getCourseById:", err);
    next({ error: "Server error" }, 500);
  }
};

// Create a new course
exports.createCourse = async (req, res, next) => {
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
    next({ error: "Server error" }, 500);
  }
};

// Update a course
exports.updateCourse = async (req, res, next) => {
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
    next({ error: "Server error" }, 500);
  }
};

// Delete a course
exports.deleteCourse = async (req, res, next) => {
  const { id } = req.params;

  try {
    const connection = await db.getConnection();
    await connection.query("DELETE FROM course WHERE CourseID = ?", [id]);
    res.json({ message: `Course with CourseID ${id} deleted` });
  } catch (err) {
    console.error("Error in deleteCourse:", err);
    next({ error: "Server error" }, 500);
  }
};

