const db = require("../dbConnection");

/**
 * @function recordVideoWatch
 * @description Records a student's video watch time
 * @param {object} req - Express request object with userId, videoId, seconds in body
 * @param {object} res - Express response object
 */
exports.recordVideoWatch = async (req, res) => {
  const { userId, videoId, seconds } = req.body;
  
  if (!userId || !videoId || seconds === undefined) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  
  if (seconds < 0) {
    return res.status(400).json({ error: "Seconds must be positive" });
  }
  
  let connection;
  try {
    connection = await db.getConnection();
    
    // Verify the video exists
    const [videoRows] = await connection.query(
      "SELECT VideoID FROM practice_video WHERE VideoID = ?",
      [videoId]
    );
    
    if (videoRows.length === 0) {
      return res.status(404).json({ error: "Video not found" });
    }
    
    // Insert the video watch record
    const [result] = await connection.query(
      "INSERT INTO video_watch (UserID, VideoID, Seconds) VALUES (?, ?, ?)",
      [userId, videoId, seconds]
    );
    
    res.status(201).json({
      watchId: result.insertId,
      seconds,
      minutes: parseFloat((seconds / 60).toFixed(2))
    });
  } catch (err) {
    console.error("Error in recordVideoWatch:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Server error" });
    }
  } finally {
    if (connection) {
      connection.release();
    }
  }
};
