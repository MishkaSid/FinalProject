// בקובץ זה נמצאים כל הפונקציות לטיפול בקורסים במערכת
// הקובץ מטפל בפעולות CRUD עבור קורסים: יצירה, קריאה, עדכון ומחיקה
// הוא מתחבר למסד הנתונים ומחזיר תגובות JSON ללקוח
//controllers
// coursesDataController.js

const db = require("../dbConnection");

// Fetch all courses (filtered by user role)
exports.getAllCourses = async (req, res) => {
  let connection;
  try {
    connection = await db.getConnection();
    
    // Get user role from the authenticated user (set by auth middleware)
    const userRole = req.user?.Role;
    
    let query = "SELECT * FROM course";
    let params = [];
    
    // If user is an examinee, only show active courses
    if (userRole === 'Examinee') {
      query += " WHERE Status = 'active' OR Status IS NULL";
    }
    // Teachers and Admins can see all courses regardless of status
    
    const [rows] = await connection.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error("Error in getAllCourses:", err);
    res.status(500).json({ error: "Server error" });
  } finally {
    if (connection) connection.release();
  }
};

// Fetch a specific course by ID (filtered by user role)
exports.getCourseById = async (req, res) => {
  const { id } = req.params;
  let connection;
  try {
    connection = await db.getConnection();
    
    // Get user role from the authenticated user (set by auth middleware)
    const userRole = req.user?.Role;
    
    let query = "SELECT * FROM course WHERE CourseID = ?";
    let params = [id];
    
    // If user is an examinee, only allow access to active courses
    if (userRole === 'Examinee') {
      query += " AND (Status = 'active' OR Status IS NULL)";
    }
    // Teachers and Admins can access all courses regardless of status
    
    const [rows] = await connection.query(query, params);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: "Course not found or access denied" });
    }
    
    res.json(rows[0]);
  } catch (err) {
    console.error("Error in getCourseById:", err);
    res.status(500).json({ error: "Server error" });
  } finally {
    if (connection) connection.release();
  }
};

// Create a new course
exports.createCourse = async (req, res) => {
  const { CourseName } = req.body;
  let connection;
  try {
    connection = await db.getConnection();
    const [result] = await connection.query(
      "INSERT INTO course (CourseName) VALUES (?)",
      [CourseName]
    );

    res.json({ CourseID: result.insertId, CourseName });
  } catch (err) {
    console.error("Error in createCourse:", err);
    res.status(500).json({ error: "Server error" });
  } finally {
    if (connection) connection.release();
  }
};

// Update a course
exports.updateCourse = async (req, res) => {
  const { id } = req.params;
  const { CourseName } = req.body;
  let connection;
  try {
    connection = await db.getConnection();
    await connection.query(
      "UPDATE course SET CourseName = ? WHERE CourseID = ?",
      [CourseName, id]
    );
    res.json({ CourseID: id, CourseName });
  } catch (err) {
    console.error("Error in updateCourse:", err);
    res.status(500).json({ error: "Server error" });
  } finally {
    if (connection) connection.release();
  }
};

// Update course status
exports.updateCourseStatus = async (req, res) => {
  const { id } = req.params;
  const { Status } = req.body;
  let connection;
  try {
    connection = await db.getConnection();
    
    // Validate status value
    if (!Status || (Status !== 'active' && Status !== 'inactive')) {
      return res.status(400).json({ 
        error: "Status must be either 'active' or 'inactive'" 
      });
    }
    
    // Check if course exists
    const [existingCourse] = await connection.query(
      "SELECT CourseID FROM course WHERE CourseID = ?",
      [id]
    );
    
    if (existingCourse.length === 0) {
      return res.status(404).json({ 
        error: "Course not found" 
      });
    }
    
    // Update the course status
    await connection.query(
      "UPDATE course SET Status = ? WHERE CourseID = ?",
      [Status, id]
    );
    
    res.json({ 
      CourseID: id, 
      Status,
      message: `Course status updated to ${Status}` 
    });
  } catch (err) {
    console.error("Error in updateCourseStatus:", err);
    res.status(500).json({ 
      error: "Server error",
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  } finally {
    if (connection) connection.release();
  }
};


exports.deleteCourse = async (req, res) => {
  const { id } = req.params;
  let connection;

  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    await connection.query(
      "DELETE FROM course WHERE CourseID = ?",
      [id]
    );

    await connection.commit();
    return res.json({ ok: true, message: `Course ${id} deleted with cascade` });
  } catch (err) {
    if (connection) await connection.rollback();
    console.error("Error in deleteCourse:", err);
    return res.status(500).json({
      error: err.sqlMessage || err.message || "Delete course failed"
    });
  } finally {
    if (connection) connection.release();
  }
};