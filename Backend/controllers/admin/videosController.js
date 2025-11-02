const db = require("../../dbConnection");

// Helper functions for JSON handling
const parseAnswerOptions = (str) => {
  try {
    return JSON.parse(str || '[]');
  } catch (error) {
    console.error('Error parsing answer options:', error);
    return [];
  }
};

const toJSONAnswerOptions = (arr) => {
  return JSON.stringify(arr || []);
};

// List videos by topic with optional difficulty filter
exports.listByTopic = async (req, res) => {
  const { topicId } = req.params;
  const { difficulty } = req.query;
  let connection;

  try {
    connection = await db.getConnection();
    
    let query = "SELECT * FROM practice_video WHERE TopicID = ?";
    let params = [topicId];
    
    if (difficulty && ['intro', 'easy', 'medium', 'exam'].includes(difficulty)) {
      query += " AND Difficulty = ?";
      params.push(difficulty);
    }
    
    query += " ORDER BY Difficulty, VideoID";
    
    const [rows] = await connection.query(query, params);
    
    // Transform to camelCase for frontend
    const videos = rows.map(row => ({
      videoId: row.VideoID,
      topicId: row.TopicID,
      videoUrl: row.VideoUrl,
      difficulty: row.Difficulty
    }));
    
    res.json(videos);
  } catch (error) {
    console.error("Error in listByTopic (videos):", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Server error" });
    }
  } finally {
    if (connection && typeof connection.release === 'function') {
      connection.release();
    }
  }
};

// Create a new video
exports.create = async (req, res) => {
  const { topicId, videoUrl, difficulty } = req.body;
  let connection;

  try {
    // Validation
    if (!topicId || !videoUrl || !difficulty) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    if (!['intro', 'easy', 'medium', 'exam'].includes(difficulty)) {
      return res.status(400).json({ error: "Invalid difficulty level" });
    }

    connection = await db.getConnection();
    
    const [result] = await connection.query(
      "INSERT INTO practice_video (TopicID, VideoUrl, Difficulty) VALUES (?, ?, ?)",
      [topicId, videoUrl, difficulty]
    );
    
    res.status(201).json({
      videoId: result.insertId,
      topicId,
      videoUrl,
      difficulty
    });
  } catch (error) {
    console.error("Error in create (videos):", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Server error" });
    }
  } finally {
    if (connection && typeof connection.release === 'function') {
      connection.release();
    }
  }
};

// Update a video
exports.update = async (req, res) => {
  const { videoId } = req.params;
  const { videoUrl, difficulty } = req.body;
  let connection;

  try {
    // Validation
    if (difficulty && !['intro', 'easy', 'medium', 'exam'].includes(difficulty)) {
      return res.status(400).json({ error: "Invalid difficulty level" });
    }

    connection = await db.getConnection();
    
    const updateFields = [];
    const updateValues = [];
    
    if (videoUrl !== undefined) {
      updateFields.push("VideoUrl = ?");
      updateValues.push(videoUrl);
    }
    if (difficulty !== undefined) {
      updateFields.push("Difficulty = ?");
      updateValues.push(difficulty);
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }
    
    updateValues.push(videoId);
    
    const [result] = await connection.query(
      `UPDATE practice_video SET ${updateFields.join(', ')} WHERE VideoID = ?`,
      updateValues
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Video not found" });
    }
    
    res.json({ message: "Video updated successfully" });
  } catch (error) {
    console.error("Error in update (videos):", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Server error" });
    }
  } finally {
    if (connection && typeof connection.release === 'function') {
      connection.release();
    }
  }
};

// Delete a video
exports.remove = async (req, res) => {
  const { videoId } = req.params;
  let connection;

  try {
    connection = await db.getConnection();
    
    const [result] = await connection.query(
      "DELETE FROM practice_video WHERE VideoID = ?",
      [videoId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Video not found" });
    }
    
    res.json({ message: "Video deleted successfully" });
  } catch (error) {
    console.error("Error in remove (videos):", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Server error" });
    }
  } finally {
    if (connection && typeof connection.release === 'function') {
      connection.release();
    }
  }
};
