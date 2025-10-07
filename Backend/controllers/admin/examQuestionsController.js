const { dbRun } = require("../../helpers/dbRun");

// helper: basic JSON validation for options map like {"A":"..","B":".."}
function validateOptionsAndAnswer(options, correctKey) {
  if (!options || typeof options !== "object" || Array.isArray(options)) {
    return "optionsJson must be a JSON object of keys like A,B,C,D";
  }
  if (!correctKey || typeof correctKey !== "string") {
    return "correctAnswer is required";
  }
  if (!(correctKey in options)) {
    return "correctAnswer key not found in optionsJson";
  }
  return null;
}

// utils for JSON array <-> string
const parseAnswerOptions = (str) => {
  try {
    return JSON.parse(str || "[]");
  } catch {
    return [];
  }
};
const toJSONAnswerOptions = (arr) => JSON.stringify(arr || []);

// POST /api/exam-questions/upload  - multipart form with image + fields
// fields: topicId, correctAnswer, optionsJson (stringified JSON or individual A,B,C,D)
exports.createWithUpload = async (req, res) => {
  try {
    // image
    if (!req.file) {
      return res
        .status(400)
        .json({ error: "Image file is required under field name 'image'" });
    }
    const imageUrl = `/uploads/exam-questions/${req.file.filename}`;

    // fields
    const topicId = Number(req.body.topicId);
    if (!topicId || Number.isNaN(topicId)) {
      return res
        .status(400)
        .json({ error: "topicId is required and must be a number" });
    }

    // options
    let optionsObj;
    if (req.body.optionsJson) {
      try {
        optionsObj = JSON.parse(req.body.optionsJson);
      } catch {
        return res
          .status(400)
          .json({ error: "optionsJson must be valid JSON" });
      }
    } else {
      const { A, B, C, D } = req.body;
      optionsObj = {
        ...(A && { A }),
        ...(B && { B }),
        ...(C && { C }),
        ...(D && { D }),
      };
    }

    const correctAnswer = String(req.body.correctAnswer || "").trim();
    const err = validateOptionsAndAnswer(optionsObj, correctAnswer);
    if (err) return res.status(400).json({ error: err });

    const insertSql = `
      INSERT INTO exam_question (TopicID, QuestionPicURL, AnswerOptions, CorrectAnswer, IsActive)
      VALUES (?, ?, ?, ?, 1)
    `;
    const params = [
      topicId,
      imageUrl,
      JSON.stringify(optionsObj),
      correctAnswer,
    ];

    const [result] = await dbRun(insertSql, params);
    return res.json({ ok: true, imageUrl, questionId: result.insertId });
  } catch (error) {
    console.error("Error in createWithUpload:", error);
    return res.status(500).json({ error: error.sqlMessage || "Server error" });
  }
};

// GET /api/topics/:topicId/exam-questions
exports.listByTopic = async (req, res) => {
  try {
    const { topicId } = req.params;
    const [rows] = await dbRun(
      `SELECT QuestionID, TopicID, QuestionPicURL, AnswerOptions, CorrectAnswer, IsActive
       FROM exam_question
       WHERE TopicID = ? AND IsActive = 1
       ORDER BY QuestionID DESC`,
      [Number(topicId)]
    );

    const result = rows.map((r) => {
      // normalize options to array
      let opts = r.AnswerOptions;
      if (typeof opts === "string") {
        try {
          const p = JSON.parse(opts);
          if (Array.isArray(p)) opts = p;
          else if (p && typeof p === "object") opts = Object.values(p);
          else opts = [];
        } catch {
          opts = [];
        }
      } else if (opts && typeof opts === "object" && !Array.isArray(opts)) {
        opts = Object.values(opts);
      } else if (!Array.isArray(opts)) {
        opts = [];
      }

      return {
        questionId: r.QuestionID,
        topicId: r.TopicID,
        imageUrl: r.QuestionPicURL,
        answerOptions: opts,
        correctAnswer: r.CorrectAnswer,
        isActive: !!r.IsActive,
      };
    });

    return res.json(result);
  } catch (e) {
    console.error("listByTopic error:", e);
    return res.status(500).json({ error: "Server error" });
  }
};

// POST /api/exam-questions  - create without image upload (JSON body)
exports.create = async (req, res) => {
  try {
    const { topicId, questionPicURL, answerOptions, correctAnswer } = req.body;

    if (!topicId || !questionPicURL || !answerOptions || !correctAnswer) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    if (!Array.isArray(answerOptions) || answerOptions.length === 0) {
      return res
        .status(400)
        .json({ error: "AnswerOptions must be a non-empty array" });
    }
    if (answerOptions.length > 50) {
      return res
        .status(400)
        .json({ error: "Too many answer options (max 50)" });
    }

    const [result] = await dbRun(
      "INSERT INTO exam_question (TopicID, QuestionPicURL, AnswerOptions, CorrectAnswer, IsActive) VALUES (?, ?, ?, ?, 1)",
      [
        Number(topicId),
        String(questionPicURL),
        toJSONAnswerOptions(answerOptions),
        String(correctAnswer),
      ]
    );

    return res.status(201).json({
      questionId: result.insertId,
      topicId,
      questionPicURL,
      answerOptions,
      correctAnswer,
    });
  } catch (error) {
    console.error("Error in create (exam questions):", error);
    return res.status(500).json({ error: error.sqlMessage || "Server error" });
  }
};

// PUT /api/exam-questions/:questionId
exports.update = async (req, res) => {
  try {
    const { questionId } = req.params;
    const { questionPicURL, answerOptions, correctAnswer, isActive } = req.body;

    const updateFields = [];
    const updateValues = [];

    if (questionPicURL !== undefined) {
      updateFields.push("QuestionPicURL = ?");
      updateValues.push(String(questionPicURL));
    }
    if (answerOptions !== undefined) {
      if (!Array.isArray(answerOptions) || answerOptions.length === 0) {
        return res
          .status(400)
          .json({ error: "AnswerOptions must be a non-empty array" });
      }
      if (answerOptions.length > 50) {
        return res
          .status(400)
          .json({ error: "Too many answer options (max 50)" });
      }
      updateFields.push("AnswerOptions = ?");
      updateValues.push(toJSONAnswerOptions(answerOptions));
    }
    if (correctAnswer !== undefined) {
      updateFields.push("CorrectAnswer = ?");
      updateValues.push(String(correctAnswer));
    }
    if (isActive !== undefined) {
      updateFields.push("IsActive = ?");
      updateValues.push(Number(!!isActive));
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    updateValues.push(Number(questionId));

    const [result] = await dbRun(
      `UPDATE exam_question SET ${updateFields.join(
        ", "
      )} WHERE QuestionID = ?`,
      updateValues
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Question not found" });
    }

    return res.json({ message: "Question updated successfully" });
  } catch (error) {
    console.error("Error in update (exam questions):", error);
    return res.status(500).json({ error: error.sqlMessage || "Server error" });
  }
};

// DELETE /api/exam-questions/:questionId
exports.remove = async (req, res) => {
  try {
    const { questionId } = req.params;

    const [result] = await dbRun(
      "DELETE FROM exam_question WHERE QuestionID = ?",
      [Number(questionId)]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Question not found" });
    }

    return res.json({ message: "Question deleted successfully" });
  } catch (error) {
    console.error("Error in remove (exam questions):", error);
    return res.status(500).json({ error: error.sqlMessage || "Server error" });
  }
};
