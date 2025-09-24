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

// List practice exercises by topic with optional difficulty filter
exports.listByTopic = async (req, res) => {
  const { topicId } = req.params;
  const { difficulty } = req.query;
  let connection;

  try {
    connection = await db.getConnection();
    
    let query = "SELECT * FROM practice_exercise WHERE TopicID = ?";
    let params = [topicId];
    
    if (difficulty && ['easy', 'medium', 'exam'].includes(difficulty)) {
      query += " AND Difficulty = ?";
      params.push(difficulty);
    }
    
    query += " ORDER BY Difficulty, ExerciseID";
    
    const [rows] = await connection.query(query, params);
    
    // Transform to camelCase for frontend
    const exercises = rows.map(row => ({
      exerciseId: row.ExerciseID,
      topicId: row.TopicID,
      answerOptions: parseAnswerOptions(row.AnswerOptions),
      correctAnswer: row.CorrectAnswer,
      contentType: row.ContentType,
      contentValue: row.ContentValue,
      difficulty: row.Difficulty
    }));
    
    res.json(exercises);
  } catch (error) {
    console.error("Error in listByTopic (practice exercises):", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Server error" });
    }
  } finally {
    if (connection && typeof connection.release === 'function') {
      connection.release();
    }
  }
};

// Create a new practice exercise
exports.create = async (req, res) => {
  const { topicId, answerOptions, correctAnswer, contentType, contentValue, difficulty } = req.body;
  let connection;

  try {
    // Validation
    if (!topicId || !answerOptions || !correctAnswer || !contentType || !contentValue) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    if (!Array.isArray(answerOptions) || answerOptions.length === 0) {
      return res.status(400).json({ error: "AnswerOptions must be a non-empty array" });
    }
    
    if (answerOptions.length > 50) {
      return res.status(400).json({ error: "Too many answer options (max 50)" });
    }
    
    if (difficulty && !['easy', 'medium', 'exam'].includes(difficulty)) {
      return res.status(400).json({ error: "Invalid difficulty level" });
    }

    connection = await db.getConnection();
    
    const [result] = await connection.query(
      "INSERT INTO practice_exercise (TopicID, AnswerOptions, CorrectAnswer, ContentType, ContentValue, Difficulty) VALUES (?, ?, ?, ?, ?, ?)",
      [topicId, toJSONAnswerOptions(answerOptions), correctAnswer, contentType, contentValue, difficulty]
    );
    
    res.status(201).json({
      exerciseId: result.insertId,
      topicId,
      answerOptions,
      correctAnswer,
      contentType,
      contentValue,
      difficulty
    });
  } catch (error) {
    console.error("Error in create (practice exercises):", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Server error" });
    }
  } finally {
    if (connection && typeof connection.release === 'function') {
      connection.release();
    }
  }
};

// Update a practice exercise
exports.update = async (req, res) => {
  const { exerciseId } = req.params;
  const { answerOptions, correctAnswer, contentType, contentValue, difficulty } = req.body;
  let connection;

  try {
    connection = await db.getConnection();
    
    const updateFields = [];
    const updateValues = [];
    
    if (answerOptions !== undefined) {
      if (!Array.isArray(answerOptions) || answerOptions.length === 0) {
        return res.status(400).json({ error: "AnswerOptions must be a non-empty array" });
      }
      if (answerOptions.length > 50) {
        return res.status(400).json({ error: "Too many answer options (max 50)" });
      }
      updateFields.push("AnswerOptions = ?");
      updateValues.push(toJSONAnswerOptions(answerOptions));
    }
    if (correctAnswer !== undefined) {
      updateFields.push("CorrectAnswer = ?");
      updateValues.push(correctAnswer);
    }
    if (contentType !== undefined) {
      updateFields.push("ContentType = ?");
      updateValues.push(contentType);
    }
    if (contentValue !== undefined) {
      updateFields.push("ContentValue = ?");
      updateValues.push(contentValue);
    }
    if (difficulty !== undefined) {
      if (!['easy', 'medium', 'exam'].includes(difficulty)) {
        return res.status(400).json({ error: "Invalid difficulty level" });
      }
      updateFields.push("Difficulty = ?");
      updateValues.push(difficulty);
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }
    
    updateValues.push(exerciseId);
    
    const [result] = await connection.query(
      `UPDATE practice_exercise SET ${updateFields.join(', ')} WHERE ExerciseID = ?`,
      updateValues
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Exercise not found" });
    }
    
    res.json({ message: "Exercise updated successfully" });
  } catch (error) {
    console.error("Error in update (practice exercises):", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Server error" });
    }
  } finally {
    if (connection && typeof connection.release === 'function') {
      connection.release();
    }
  }
};

// Delete a practice exercise
exports.remove = async (req, res) => {
  const { exerciseId } = req.params;
  let connection;

  try {
    connection = await db.getConnection();
    
    const [result] = await connection.query(
      "DELETE FROM practice_exercise WHERE ExerciseID = ?",
      [exerciseId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Exercise not found" });
    }
    
    res.json({ message: "Exercise deleted successfully" });
  } catch (error) {
    console.error("Error in remove (practice exercises):", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Server error" });
    }
  } finally {
    if (connection && typeof connection.release === 'function') {
      connection.release();
    }
  }
};
