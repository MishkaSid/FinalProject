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

// Delete a course and all related content (CASCADE DELETE)
exports.deleteCourse = async (req, res) => {
  const { id } = req.params;
  let connection;
  try {
    connection = await db.getConnection();
    
    // Start transaction to ensure all deletions happen together
    await connection.beginTransaction();
    
    // Get all topics for this course
    const [topics] = await connection.query(
      "SELECT TopicID FROM topic WHERE CourseID = ?",
      [id]
    );
    
    if (topics.length > 0) {
      const topicIds = topics.map(t => t.TopicID);
      
      // Create placeholders for IN clause
      const placeholders = topicIds.map(() => '?').join(',');
      
      // Step 1: Get all video IDs for these topics
      const [videos] = await connection.query(
        `SELECT VideoID FROM practice_video WHERE TopicID IN (${placeholders})`,
        topicIds
      );
      
      // Step 2: Delete video watch records for these videos
      if (videos.length > 0) {
        const videoIds = videos.map(v => v.VideoID);
        const videoPlaceholders = videoIds.map(() => '?').join(',');
        await connection.query(
          `DELETE FROM video_watch WHERE VideoID IN (${videoPlaceholders})`,
          videoIds
        );
      }
      
      // Step 3: Delete exam results for questions from these topics
      // (Note: exam_result has CASCADE delete, but we'll be explicit)
      await connection.query(
        `DELETE er FROM exam_result er 
         INNER JOIN exam_question eq ON er.QuestionID = eq.QuestionID 
         WHERE eq.TopicID IN (${placeholders})`,
        topicIds
      );
      
      // Step 4: Delete all practice exercises for these topics
      await connection.query(
        `DELETE FROM practice_exercise WHERE TopicID IN (${placeholders})`,
        topicIds
      );
      
      // Step 5: Delete all practice videos for these topics
      await connection.query(
        `DELETE FROM practice_video WHERE TopicID IN (${placeholders})`,
        topicIds
      );
      
      // Step 6: Delete all exam questions for these topics
      await connection.query(
        `DELETE FROM exam_question WHERE TopicID IN (${placeholders})`,
        topicIds
      );
      
      // Step 7: Finally, delete all topics for this course
      await connection.query(
        "DELETE FROM topic WHERE CourseID = ?",
        [id]
      );
    }
    
    // Check if course has any users assigned to it
    const [users] = await connection.query(
      "SELECT COUNT(*) as count FROM users WHERE CourseID = ?",
      [id]
    );
    
    if (users[0].count > 0) {
      // Rollback transaction
      await connection.rollback();
      return res.status(400).json({ 
        error: "לא ניתן למחוק קורס שיש לו משתמשים משוייכים. אנא הסר תחילה את כל המשתמשים או שייך אותם לקורס אחר." 
      });
    }
    
    // Finally, delete the course itself
    await connection.query("DELETE FROM course WHERE CourseID = ?", [id]);
    
    // Commit the transaction
    await connection.commit();
    
    res.json({ 
      message: `Course with CourseID ${id} and all related content deleted successfully`,
      deletedTopics: topics.length 
    });
  } catch (err) {
    // Rollback transaction on error
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackErr) {
        console.error("Error rolling back transaction:", rollbackErr);
      }
    }
    console.error("Error in deleteCourse:", err);
    console.error("Error details:", {
      message: err.message,
      sqlMessage: err.sqlMessage,
      sql: err.sql,
      code: err.code
    });
    if (!res.headersSent) {
      const errorMsg = err.sqlMessage || err.message || "שגיאה במחיקת הקורס";
      res.status(500).json({ 
        error: "שגיאה במחיקת הקורס",
        details: process.env.NODE_ENV === 'development' ? errorMsg : undefined
      });
    }
  } finally {
    if (connection) connection.release();
  }
};

