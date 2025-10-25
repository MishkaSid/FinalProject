// בקובץ זה נמצאים כל הפונקציות לטיפול בקורסים במערכת
// הקובץ מטפל בפעולות CRUD עבור קורסים: יצירה, קריאה, עדכון ומחיקה
// הוא מתחבר למסד הנתונים ומחזיר תגובות JSON ללקוח
//controllers
// coursesDataController.js

const db = require("../dbConnection");

// Fetch all courses
exports.getAllCourses = async (req, res) => {
  let connection;
  try {
    connection = await db.getConnection();
    const [rows] = await connection.query("SELECT * FROM course");
    res.json(rows);
  } catch (err) {
    console.error("Error in getAllCourses:", err);
    res.status(500).json({ error: "Server error" });
  } finally {
    if (connection) connection.release();
  }
};

// Fetch a specific course by ID
exports.getCourseById = async (req, res) => {
  const { id } = req.params;
  let connection;
  try {
    connection = await db.getConnection();
    const [rows] = await connection.query("SELECT * FROM course WHERE CourseID = ?", [id]);
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
      
      // Step 1: Get all exercise IDs for these topics
      const [exercises] = await connection.query(
        `SELECT ExerciseID FROM practice_exercise WHERE TopicID IN (${placeholders})`,
        topicIds
      );
      
      // Step 2: Get all video IDs for these topics
      const [videos] = await connection.query(
        `SELECT VideoID FROM practice_video WHERE TopicID IN (${placeholders})`,
        topicIds
      );
      
      // Step 3: Delete practice attempts for these exercises
      if (exercises.length > 0) {
        const exerciseIds = exercises.map(e => e.ExerciseID);
        const exercisePlaceholders = exerciseIds.map(() => '?').join(',');
        await connection.query(
          `DELETE FROM practice_attempt WHERE ExerciseID IN (${exercisePlaceholders})`,
          exerciseIds
        );
      }
      
      // Step 4: Delete video watch records for these videos
      if (videos.length > 0) {
        const videoIds = videos.map(v => v.VideoID);
        const videoPlaceholders = videoIds.map(() => '?').join(',');
        await connection.query(
          `DELETE FROM video_watch WHERE VideoID IN (${videoPlaceholders})`,
          videoIds
        );
      }
      
      // Step 5: Delete exam results for questions from these topics
      // (Note: exam_result has CASCADE delete, but we'll be explicit)
      await connection.query(
        `DELETE er FROM exam_result er 
         INNER JOIN exam_question eq ON er.QuestionID = eq.QuestionID 
         WHERE eq.TopicID IN (${placeholders})`,
        topicIds
      );
      
      // Step 6: Delete all practice exercises for these topics
      await connection.query(
        `DELETE FROM practice_exercise WHERE TopicID IN (${placeholders})`,
        topicIds
      );
      
      // Step 7: Delete all practice videos for these topics
      await connection.query(
        `DELETE FROM practice_video WHERE TopicID IN (${placeholders})`,
        topicIds
      );
      
      // Step 8: Delete all exam questions for these topics
      await connection.query(
        `DELETE FROM exam_question WHERE TopicID IN (${placeholders})`,
        topicIds
      );
      
      // Step 9: Finally, delete all topics for this course
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

