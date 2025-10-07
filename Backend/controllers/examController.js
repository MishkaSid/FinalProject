// Backend/controllers/examController.js
const { dbRun } = require("../helpers/dbRun");

exports.startExam = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.UserID;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    // שליפת קורס של המשתמש
    const [userRows] = await dbRun(
      "SELECT CourseID FROM users WHERE UserID = ? LIMIT 1",
      [Number(userId)]
    );
    const courseId = userRows[0]?.CourseID;
    if (!courseId) {
      return res.status(400).json({ error: "No course assigned to user" });
    }

    // רשימת נושאים לפי course_topic_order אם קיימת, אחרת לפי TopicID
    let topicIds = [];
    try {
      const [orderRows] = await dbRun(
        `SELECT TopicID
         FROM course_topic_order
         WHERE CourseID = ?
         ORDER BY Position ASC`,
        [Number(courseId)]
      );
      topicIds = orderRows.map((r) => r.TopicID);
    } catch {
      topicIds = [];
    }

    if (!topicIds.length) {
      const [fallbackRows] = await dbRun(
        `SELECT TopicID
         FROM topic
         WHERE CourseID = ?
         ORDER BY TopicID ASC`,
        [Number(courseId)]
      );
      topicIds = fallbackRows.map((r) => r.TopicID);
    }

    if (!topicIds.length) {
      return res.status(400).json({ error: "No topics configured for course" });
    }

    // שליפה רנדומלית של שאלה אחת לכל TopicID
    const questions = [];
    for (const tid of topicIds) {
      const [qRows] = await dbRun(
        `SELECT QuestionID, QuestionPicURL, AnswerOptions, CorrectAnswer
         FROM exam_question
         WHERE TopicID = ? AND IsActive = 1
         ORDER BY RAND()
         LIMIT 1`,
        [Number(tid)]
      );
      if (!qRows.length) continue;

      const r = qRows[0];

      // נרמול אופציות למערך
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
// נרמול כתובת התמונה כך שתמיד תהיה תקינה
// לפני push של השאלה למערך
const rawPic = (r.QuestionPicURL || "").trim();
let contentValue = rawPic;

if (!rawPic) {
  contentValue = "";
} else if (/^https?:\/\//i.test(rawPic)) {
  try {
    const u = new URL(rawPic);
    const isLocalHost = u.hostname === "localhost" || u.hostname === "127.0.0.1";
    const isOurPort = !u.port || u.port === "5000";
    if (isLocalHost && isOurPort) {
      // URL מלא לשרת המקומי
      contentValue = u.pathname.startsWith("/uploads/")
        ? u.pathname
        : `/uploads/exam-questions/${u.pathname.split("/").pop() || ""}`;
    } else {
      // דומיין חיצוני: נמיר לקובץ מקומי לפי שם הקובץ
      const fileOnly = u.pathname.split("/").pop() || "";
      contentValue = `/uploads/exam-questions/${fileOnly}`;
    }
  } catch {
    // URL לא תקין: ממיר לשם קובץ מקומי
    const fileOnly = rawPic.split("/").pop() || "";
    contentValue = `/uploads/exam-questions/${fileOnly}`;
  }
} else if (rawPic.startsWith("/uploads/")) {
  // כבר יחסי ותקין
  contentValue = rawPic;
} else {
  // שם קובץ בלבד או נתיב יחסי אחר
  const fileOnly = rawPic.split("/").pop() || "";
  contentValue = `/uploads/exam-questions/${fileOnly}`;
}



      questions.push({
        ExerciseID: r.QuestionID,
        ContentType: "image",
        ContentValue: contentValue,
        AnswerOptions: opts,
        CorrectAnswer: r.CorrectAnswer,
      });
    }

    const finalQuestions = questions.filter(Boolean);
    if (!finalQuestions.length) {
      return res
        .status(400)
        .json({
          error: "No active exam questions found for the course topics",
        });
    }

    return res.json({
      exam: {
        courseId,
        total: finalQuestions.length,
        questions: finalQuestions,
      },
    });
  } catch (e) {
    console.error("startExam error:", e);
    return res.status(500).json({ error: "Server error" });
  }
};
