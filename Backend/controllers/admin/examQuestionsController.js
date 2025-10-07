// Backend/controllers/admin/examQuestionsController.js
// ניהול שאלות מבחן: יצירה עם העלאת תמונה, יצירה ללא העלאה, רשימה לפי Topic, עדכון ומחיקה

const { dbRun } = require("../../helpers/dbRun");

// עזר: וולידציה לפורמט אופציות מסוג אובייקט {A,B,C,D} והאם המפתח הנכון קיים
function validateOptionsAndAnswer(options, correctKey) {
  if (!options || typeof options !== "object" || Array.isArray(options)) {
    return "optionsJson חייב להיות אובייקט JSON עם מפתחות כמו A,B,C,D";
  }
  if (!correctKey || typeof correctKey !== "string") {
    return "correctAnswer נדרש";
  }
  if (!(correctKey in options)) {
    return "correctAnswer לא נמצא במפתחות של optionsJson";
  }
  return null;
}

// עזר: נרמול כתובת תמונה לנתיב יחסי תחת /uploads
// מקבל שם קובץ, נתיב יחסי, או URL מלא ומחזיר תמיד נתיב יחסי תקין
function normalizePicUrl(raw) {
  const val = String(raw || "").trim();
  if (!val) return "";
  // אם כבר תחת uploads
  if (val.startsWith("/uploads/")) return val;
  // אם זה URL מלא
  if (/^https?:\/\//i.test(val)) {
    try {
      const u = new URL(val);
      const isLocal =
        u.hostname === "localhost" ||
        u.hostname === "127.0.0.1" ||
        u.hostname === "::1";
      if (isLocal) {
        // אם זה URL מקומי, קח את ה-path
        const p = u.pathname || "";
        if (p.startsWith("/uploads/")) return p;
        const fileOnly = p.split("/").pop() || "";
        return `/uploads/exam-questions/${fileOnly}`;
      } else {
        // דומיין חיצוני: השתמש בשם הקובץ
        const fileOnly = u.pathname.split("/").pop() || "";
        return `/uploads/exam-questions/${fileOnly}`;
      }
    } catch {
      // URL לא תקין: ניפול לשם קובץ
      const fileOnly = val.split("/").pop() || val;
      return `/uploads/exam-questions/${fileOnly}`;
    }
  }
  // שם קובץ בלבד או נתיב יחסי אחר
  const fileOnly = val.split("/").pop() || val;
  return `/uploads/exam-questions/${fileOnly}`;
}

// עזר: המרה בטוחה מאחסון JSON לאופציות כמערך
function normalizeOptionsToArray(rawOptions) {
  let opts = rawOptions;
  if (typeof opts === "string") {
    try {
      const p = JSON.parse(opts);
      if (Array.isArray(p)) return p;
      if (p && typeof p === "object") return Object.values(p);
      return [];
    } catch {
      return [];
    }
  }
  if (opts && typeof opts === "object" && !Array.isArray(opts)) {
    return Object.values(opts);
  }
  if (Array.isArray(opts)) return opts;
  return [];
}

// עזר: המרה למחרוזת JSON מאופציות כמערך
const toJSONAnswerOptions = (arr) => JSON.stringify(arr || []);

// POST /api/exam-questions/upload  - טופס multipart עם תמונה ושדות
// שדות: topicId, correctAnswer, optionsJson (JSON כמחרוזת) או A,B,C,D כבודדים
exports.createWithUpload = async (req, res) => {
  try {
    // תמונה נדרשת
    if (!req.file) {
      return res
        .status(400)
        .json({ error: "יש לצרף קובץ תמונה תחת השדה image" });
    }
    const imageUrl = normalizePicUrl(
      `/uploads/exam-questions/${req.file.filename}`
    );

    // שדות חובה
    const topicId = Number(req.body.topicId);
    if (!topicId || Number.isNaN(topicId)) {
      return res.status(400).json({ error: "topicId נדרש וחייב להיות מספר" });
    }

    // אופציות תשובה
    let optionsObj;
    if (req.body.optionsJson) {
      try {
        optionsObj = JSON.parse(req.body.optionsJson);
      } catch {
        return res
          .status(400)
          .json({ error: "optionsJson חייב להיות JSON תקין" });
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
    return res
      .status(500)
      .json({ error: error.sqlMessage || error.message || "Server error" });
  }
};

// GET /api/topics/:topicId/exam-questions  - רשימת שאלות פעילות לנושא
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

    const result = rows.map((r) => ({
      questionId: r.QuestionID,
      topicId: r.TopicID,
      imageUrl: normalizePicUrl(r.QuestionPicURL), // נרמול נתיב תמונה
      answerOptions: normalizeOptionsToArray(r.AnswerOptions),
      correctAnswer: r.CorrectAnswer,
      isActive: !!r.IsActive,
    }));

    return res.json(result);
  } catch (e) {
    console.error("listByTopic error:", e);
    return res.status(500).json({ error: "Server error" });
  }
};

// POST /api/exam-questions  - יצירה ללא העלאת תמונה (JSON בלבד)
// גוף לדוגמה: { topicId, questionPicURL, answerOptions: ["...","...","...","..."], correctAnswer: "A" או טקסט }
exports.create = async (req, res) => {
  try {
    const { topicId, questionPicURL, answerOptions, correctAnswer } = req.body;

    if (!topicId || !questionPicURL || !answerOptions || !correctAnswer) {
      return res.status(400).json({ error: "שדות חובה חסרים" });
    }

    // נרמול כתובת התמונה
    const picUrl = normalizePicUrl(questionPicURL);

    // אופציות יכולות להגיע כמערך או כאובייקט
    let optionsArray = [];
    if (Array.isArray(answerOptions)) {
      optionsArray = answerOptions;
      if (optionsArray.length === 0) {
        return res
          .status(400)
          .json({ error: "AnswerOptions חייב להיות מערך לא ריק" });
      }
      if (optionsArray.length > 50) {
        return res
          .status(400)
          .json({ error: "יותר מידי אופציות תשובה (מקסימום 50)" });
      }
    } else if (answerOptions && typeof answerOptions === "object") {
      optionsArray = Object.values(answerOptions);
      if (optionsArray.length === 0) {
        return res.status(400).json({ error: "אין אופציות תשובה" });
      }
    } else {
      return res
        .status(400)
        .json({ error: "AnswerOptions חייב להיות מערך או אובייקט" });
    }

    const [result] = await dbRun(
      "INSERT INTO exam_question (TopicID, QuestionPicURL, AnswerOptions, CorrectAnswer, IsActive) VALUES (?, ?, ?, ?, 1)",
      [
        Number(topicId),
        picUrl,
        toJSONAnswerOptions(optionsArray),
        String(correctAnswer),
      ]
    );

    return res.status(201).json({
      questionId: result.insertId,
      topicId,
      questionPicURL: picUrl,
      answerOptions: optionsArray,
      correctAnswer,
    });
  } catch (error) {
    console.error("Error in create (exam questions):", error);
    return res
      .status(500)
      .json({ error: error.sqlMessage || error.message || "Server error" });
  }
};

// PUT /api/exam-questions/:questionId  - עדכון שדות
exports.update = async (req, res) => {
  try {
    const { questionId } = req.params;
    const { questionPicURL, answerOptions, correctAnswer, isActive } = req.body;

    const updateFields = [];
    const updateValues = [];

    if (questionPicURL !== undefined) {
      updateFields.push("QuestionPicURL = ?");
      updateValues.push(normalizePicUrl(questionPicURL));
    }
    if (answerOptions !== undefined) {
      let optionsArray = [];
      if (Array.isArray(answerOptions)) {
        optionsArray = answerOptions;
        if (optionsArray.length === 0) {
          return res
            .status(400)
            .json({ error: "AnswerOptions חייב להיות מערך לא ריק" });
        }
        if (optionsArray.length > 50) {
          return res
            .status(400)
            .json({ error: "יותר מידי אופציות תשובה (מקסימום 50)" });
        }
      } else if (answerOptions && typeof answerOptions === "object") {
        optionsArray = Object.values(answerOptions);
        if (optionsArray.length === 0) {
          return res.status(400).json({ error: "אין אופציות תשובה" });
        }
      } else {
        return res
          .status(400)
          .json({ error: "AnswerOptions חייב להיות מערך או אובייקט" });
      }
      updateFields.push("AnswerOptions = ?");
      updateValues.push(toJSONAnswerOptions(optionsArray));
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
      return res.status(400).json({ error: "אין שדות לעדכן" });
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
    return res
      .status(500)
      .json({ error: error.sqlMessage || error.message || "Server error" });
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
    return res
      .status(500)
      .json({ error: error.sqlMessage || error.message || "Server error" });
  }
};
