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

// List exam questions by topic
exports.listByTopic = async (req, res) => {
  const { topicId } = req.params;
  let connection;

  try {
    connection = await db.getConnection();
    
    const [rows] = await connection.query(
      "SELECT * FROM exam_question WHERE TopicID = ? ORDER BY QuestionID",
      [topicId]
    );
    
    // Transform to camelCase for frontend
    const questions = rows.map(row => ({
      questionId: row.QuestionID,
      topicId: row.TopicID,
      questionPicURL: row.QuestionPicURL,
      answerOptions: parseAnswerOptions(row.AnswerOptions),
      correctAnswer: row.CorrectAnswer
    }));
    
    res.json(questions);
  } catch (error) {
    console.error("Error in listByTopic (exam questions):", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Server error" });
    }
  } finally {
    if (connection && typeof connection.release === 'function') {
      connection.release();
    }
  }
};

// Create a new exam question
exports.create = async (req, res) => {
  const { topicId, questionPicURL, answerOptions, correctAnswer } = req.body;
  let connection;

  try {
    // Validation
    if (!topicId || !questionPicURL || !answerOptions || !correctAnswer) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    if (!Array.isArray(answerOptions) || answerOptions.length === 0) {
      return res.status(400).json({ error: "AnswerOptions must be a non-empty array" });
    }
    
    if (answerOptions.length > 50) {
      return res.status(400).json({ error: "Too many answer options (max 50)" });
    }

    connection = await db.getConnection();
    
    const [result] = await connection.query(
      "INSERT INTO exam_question (TopicID, QuestionPicURL, AnswerOptions, CorrectAnswer) VALUES (?, ?, ?, ?)",
      [topicId, questionPicURL, toJSONAnswerOptions(answerOptions), correctAnswer]
    );
    
    res.status(201).json({
      questionId: result.insertId,
      topicId,
      questionPicURL,
      answerOptions,
      correctAnswer
    });
  } catch (error) {
    console.error("Error in create (exam questions):", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Server error" });
    }
  } finally {
    if (connection && typeof connection.release === 'function') {
      connection.release();
    }
  }
};

// Update an exam question
exports.update = async (req, res) => {
  const { questionId } = req.params;
  const { questionPicURL, answerOptions, correctAnswer } = req.body;
  let connection;

  try {
    connection = await db.getConnection();
    
    const updateFields = [];
    const updateValues = [];
    
    if (questionPicURL !== undefined) {
      updateFields.push("QuestionPicURL = ?");
      updateValues.push(questionPicURL);
    }
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
    
    if (updateFields.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }
    
    updateValues.push(questionId);
    
    const [result] = await connection.query(
      `UPDATE exam_question SET ${updateFields.join(', ')} WHERE QuestionID = ?`,
      updateValues
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Question not found" });
    }
    
    res.json({ message: "Question updated successfully" });
  } catch (error) {
    console.error("Error in update (exam questions):", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Server error" });
    }
  } finally {
    if (connection && typeof connection.release === 'function') {
      connection.release();
    }
  }
};

// Delete an exam question
exports.remove = async (req, res) => {
  const { questionId } = req.params;
  let connection;

  try {
    connection = await db.getConnection();
    
    const [result] = await connection.query(
      "DELETE FROM exam_question WHERE QuestionID = ?",
      [questionId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Question not found" });
    }
    
    res.json({ message: "Question deleted successfully" });
  } catch (error) {
    console.error("Error in remove (exam questions):", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Server error" });
    }
  } finally {
    if (connection && typeof connection.release === 'function') {
      connection.release();
    }
  }
};
