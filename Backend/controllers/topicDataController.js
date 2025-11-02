// בקובץ זה נמצאות פונקציות לניהול נושאי הלימוד במערכת
// הקובץ מטפל בפעולות CRUD עבור נושאים: יצירה, קריאה, עדכון ומחיקה
// הוא כולל טיפול בשגיאות ובדיקות תקינות עבור נושאים וקורסים קשורים
//controllers
// topicDataController.js
const db = require("../dbConnection");

// Fetch all topics
exports.getAllTopics = async (req, res) => {
  let connection;
  try {
    connection = await db.getConnection();
    
    // Get user role - Admins see all topics, others only see active topics
    const userRole = req.user?.role || req.user?.Role;
    
    let query = "SELECT * FROM topic";
    
    // If user is not Admin, only show active topics
    if (userRole !== 'Admin') {
      query += " WHERE status = 'active' OR status IS NULL";
    }
    
    const [rows] = await connection.query(query);
    res.json(rows);
  } catch (err) {
    console.error("Error in getAllTopics:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Server error" });
    }
  } finally {
    if (connection && typeof connection.release === 'function') {
      connection.release();
    }
  }
};

// Fetch a specific topic by ID
exports.getTopicById = async (req, res) => {
  const { id } = req.params;
  let connection;

  try {
    connection = await db.getConnection();
    const [rows] = await connection.query(
      "SELECT * FROM topic WHERE TopicID = ?",
      [id]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error("Error in getTopicById:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Server error" });
    }
  } finally {
    if (connection && typeof connection.release === 'function') {
      connection.release();
    }
  }
};

// Create a new topic
exports.createTopic = async (req, res) => {
  const { TopicName, CourseID, status } = req.body;
  let connection;

  try {
    // Determine which CourseID to use
    const userRole = req.user?.role || req.user?.Role;
    const userCourseId = req.user?.courseId;
    
    let targetCourseId;
    
    // Admin users can specify CourseID, others use their assigned course
    if (userRole === 'Admin' && CourseID) {
      targetCourseId = CourseID;
    } else if (userCourseId) {
      targetCourseId = userCourseId;
    } else {
      return res.status(400).json({ error: "User has no assigned course and no CourseID provided" });
    }

    connection = await db.getConnection();
    
    // Verify course exists
    const [courseRows] = await connection.query(
      "SELECT * FROM course WHERE CourseID = ?",
      [targetCourseId]
    );
    if (courseRows.length === 0) {
      if (!res.headersSent) {
        return res.status(400).json({ error: "Course doesn't exist" });
      }
      return;
    }
    
    // Check if topic name already exists in this course
    const [existingTopics] = await connection.query(
      "SELECT * FROM topic WHERE TopicName = ? AND CourseID = ?",
      [TopicName, targetCourseId]
    );
    if (existingTopics.length > 0) {
      if (!res.headersSent) {
        return res.status(400).json({ error: "כבר קיים נושא בשם זה" });
      }
      return;
    }
    
    // Insert topic with auto-generated TopicID and status
    const topicStatus = status || 'active';
    const [result] = await connection.query(
      "INSERT INTO topic (TopicName, CourseID, status) VALUES (?, ?, ?)",
      [TopicName, targetCourseId, topicStatus]
    );
    res.json({ TopicID: result.insertId, TopicName, CourseID: targetCourseId, status: topicStatus });
  } catch (err) {
    console.error("Error in createTopic:", err);
    if (!res.headersSent) {
      // Check for duplicate key error
      if (err.code === 'ER_DUP_ENTRY') {
        res.status(400).json({ error: "כבר קיים נושא בשם זה" });
      } else {
        res.status(500).json({ error: "Server error" });
      }
    }
  } finally {
    if (connection && typeof connection.release === 'function') {
      connection.release();
    }
  }
};

// Update a topic
exports.updateTopic = async (req, res) => {
  const { id } = req.params;
  const { TopicName, status } = req.body;
  let connection;

  try {
    // Get CourseID from JWT token for validation
    const userCourseId = req.user?.courseId;
    const userRole = req.user?.role;
    
    connection = await db.getConnection();
    
    // If not admin, verify the topic belongs to the user's course
    if (userRole !== 'Admin' && userCourseId) {
      const [topicRows] = await connection.query(
        "SELECT CourseID FROM topic WHERE TopicID = ?",
        [id]
      );
      
      if (topicRows.length === 0) {
        if (!res.headersSent) {
          return res.status(404).json({ error: "Topic not found" });
        }
        return;
      }
      
      if (topicRows[0].CourseID !== userCourseId) {
        if (!res.headersSent) {
          return res.status(403).json({ error: "Not authorized to update this topic" });
        }
        return;
      }
    }
    
    // Build update query based on what's provided
    let updateFields = [];
    let values = [];
    
    if (TopicName) {
      updateFields.push('TopicName = ?');
      values.push(TopicName);
    }
    
    if (status) {
      updateFields.push('status = ?');
      values.push(status);
    }
    
    if (updateFields.length === 0) {
      if (!res.headersSent) {
        return res.status(400).json({ error: "No fields to update" });
      }
      return;
    }
    
    values.push(id);
    
    // Update topic fields
    await connection.query(
      `UPDATE topic SET ${updateFields.join(', ')} WHERE TopicID = ?`,
      values
    );
    
    // Get the updated topic to return full data
    const [updatedRows] = await connection.query(
      "SELECT * FROM topic WHERE TopicID = ?",
      [id]
    );
    
    res.json(updatedRows[0]);
  } catch (err) {
    console.error("Error in updateTopic:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Server error" });
    }
  } finally {
    if (connection && typeof connection.release === 'function') {
      connection.release();
    }
  }
};

// Delete a topic
exports.deleteTopic = async (req, res) => {
  const { id } = req.params;
  let connection;

  try {
    connection = await db.getConnection();

    try {
      // First, delete all related practice exercises
      await connection.query(
        "DELETE FROM practice_exercise WHERE TopicID = ?",
        [id]
      );

      // Then, delete all related practice videos
      await connection.query("DELETE FROM practice_video WHERE TopicID = ?", [
        id,
      ]);

      // Finally, delete the topic
      await connection.query("DELETE FROM topic WHERE TopicID = ?", [id]);

      res.json({ message: `Topic with TopicID ${id} deleted successfully` });
    } catch (queryErr) {
      console.error("Error in deleteTopic queries:", queryErr);
      throw queryErr;
    }
  } catch (err) {
    console.error("Error in deleteTopic:", err);
    console.error("Error code:", err.code);
    console.error("Error message:", err.message);
    console.error("Error sqlMessage:", err.sqlMessage);

    // Check if it's a foreign key constraint error
    if (err.code === "ER_ROW_IS_REFERENCED_2") {
      if (!res.headersSent) {
        res.status(400).json({
          error:
            "Cannot delete topic. It has related practice content that needs to be removed first.",
        });
      }
    } else if (err.code === "ER_NO_SUCH_TABLE") {
      if (!res.headersSent) {
        res.status(500).json({
          error: "Database table not found. Please check your database setup.",
        });
      }
    } else {
      if (!res.headersSent) {
        res.status(500).json({
          error: "Server error",
          details: err.message,
          code: err.code,
        });
      }
    }
  } finally {
    if (connection && typeof connection.release === 'function') {
      connection.release();
    }
  }
};
