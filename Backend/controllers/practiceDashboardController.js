const db = require("../dbConnection");

/** GET /api/practice-dashboard/topics
 *  מחזיר את כל הנושאים עם שם הקורס
 */
exports.getAllTopics = async (req, res) => {
  let connection;
  try {
    connection = await db.getConnection();

    const [rows] = await connection.query(
      `
      SELECT
        t.TopicID,
        t.TopicName,
        c.CourseName
      FROM topic t
      LEFT JOIN course c ON c.CourseID = t.CourseID
      ORDER BY c.CourseName, t.TopicName
      `
    );

    return res.json(rows); // גם אם ריק – נחזיר []
  } catch (err) {
    console.error("Error in getAllTopics:", err);
    return res.status(500).json({ error: "DB error" });
  } finally {
    if (connection) connection.release();
  }
};

/** GET /api/practice-dashboard/topic/:topicId
 *  מחזיר מידע על נושא יחיד + שם קורס
 */
exports.getTopicInfo = async (req, res) => {
  const { topicId } = req.params;

  if (!/^\d+$/.test(String(topicId))) {
    return res.status(400).json({ error: "invalid topicId" });
  }

  let connection;
  try {
    connection = await db.getConnection();

    const [rows] = await connection.query(
      `
      SELECT 
        t.TopicID,
        t.TopicName,
        COALESCE(t.TopicDescription, '') AS TopicDescription,
        c.CourseID,
        c.CourseName
      FROM topic t
      LEFT JOIN course c ON t.CourseID = c.CourseID
      WHERE t.TopicID = ?
      LIMIT 1
      `,
      [topicId]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: "Topic not found", topicId });
    }

    return res.json(rows[0]);
  } catch (err) {
    console.error("getTopicInfo error:", {
      topicId,
      code: err.code,
      errno: err.errno,
      sqlState: err.sqlState,
      sqlMessage: err.sqlMessage,
    });
    return res.status(500).json({
      error: "DB error",
      code: err.code,
      sqlMessage: err.sqlMessage,
    });
  } finally {
    if (connection) connection.release();
  }
};

/** GET /api/practice-dashboard/videos/:topicId
 *  מחזיר את כל הסרטונים לנושא מסוים, מסודרים: intro -> easy -> medium -> exam
 *  דורש שבטבלת practice_video יהיו העמודות: VideoUrl (VARCHAR) ו- Difficulty (ENUM)
 */
exports.getPracticeVideos = async (req, res) => {
  const { topicId } = req.params;

  if (!/^\d+$/.test(String(topicId))) {
    return res.status(400).json({ error: "invalid topicId" });
  }

  let connection;
  try {
    connection = await db.getConnection();

    const [rows] = await connection.query(
      `
      SELECT 
        pv.VideoID,
        pv.TopicID,
        pv.VideoTopic,
        pv.VideoUrl,
        pv.Difficulty
      FROM practice_video pv
      WHERE pv.TopicID = ?
      ORDER BY FIELD(pv.Difficulty, 'intro','easy','medium','exam'), pv.VideoID
      `,
      [topicId]
    );

    return res.json(rows); // מערך (יכול להיות ריק)
  } catch (err) {
    console.error("Error in getPracticeVideos:", err);
    return res.status(500).json({ error: "DB error" });
  } finally {
    if (connection) connection.release();
  }
};

/** GET /api/practice-dashboard/exercises/:topicId
 *  מחזיר תרגילים לנושא (בסיסי, כמו שהיה אצלך – עם תיקון שם טבלה)
 */
exports.getPracticeExercises = async (req, res) => {
  const { topicId } = req.params;

  if (!/^\d+$/.test(String(topicId))) {
    return res.status(400).json({ error: "invalid topicId" });
  }

  let connection;
  try {
    connection = await db.getConnection();

    const [rows] = await connection.query(
      `
      SELECT 
        pe.ExerciseID,
        pe.TopicID,
        pe.AnswerOptions,
        pe.CorrectAnswer,
        pe.ContentType,
        pe.ContentValue
      FROM practice_exercise pe
      WHERE pe.TopicID = ?
      ORDER BY pe.ExerciseID DESC
      LIMIT 10
      `,
      [topicId]
    );

    return res.json(rows);
  } catch (err) {
    console.error("Error in getPracticeExercises:", err);
    return res.status(500).json({ error: "DB error" });
  } finally {
    if (connection) connection.release();
  }
};
