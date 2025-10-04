const db = require("../dbConnection");

/**
 * @function getStudentGrades
 * @description Gets student grades over time for line chart visualization
 * @param {object} req - Express request object with userId param and from/to query params
 * @param {object} res - Express response object
 */
exports.getStudentGrades = async (req, res) => {
  const { userId } = req.params;
  const { from, to } = req.query;

  let connection;
  try {
    connection = await db.getConnection();

    // Default to last 30 days if no date range provided
    const defaultFrom = new Date();
    defaultFrom.setDate(defaultFrom.getDate() - 30);

    const fromDate = from || defaultFrom.toISOString().split("T")[0];
    const toDate = to || new Date().toISOString().split("T")[0];

    const [rows] = await connection.query(
      `
      SELECT DATE(e.ExamDate) AS date, AVG(e.Grade) AS avgGrade
      FROM exam e
      WHERE e.UserID = ? AND e.ExamDate BETWEEN ? AND ?
      GROUP BY DATE(e.ExamDate)
      ORDER BY DATE(e.ExamDate)
    `,
      [userId, fromDate, toDate]
    );

    const series = rows.map((row) => ({
      date: row.date.toISOString().split("T")[0],
      avg: parseFloat(row.avgGrade.toFixed(1)),
    }));

    res.json({ series });
  } catch (err) {
    console.error("Error in getStudentGrades:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Server error" });
    }
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

/**
 * @function getStudentTopicAccuracy
 * @description Gets student accuracy by topic for bar/pie chart visualization
 * @param {object} req - Express request object with userId param
 * @param {object} res - Express response object
 */
exports.getStudentTopicAccuracy = async (req, res) => {
  const { userId } = req.params;

  let connection;
  try {
    connection = await db.getConnection();

    const [rows] = await connection.query(
      `
      SELECT t.TopicID, t.TopicName,
             AVG(CASE WHEN er.SelectedAnswer = eq.CorrectAnswer THEN 1 ELSE 0 END) * 100 AS accuracy
      FROM exam_result er
      JOIN exam e ON e.ExamID = er.ExamID
      JOIN exam_question eq ON eq.QuestionID = er.QuestionID
      JOIN topic t ON t.TopicID = eq.TopicID
      WHERE e.UserID = ?
      GROUP BY t.TopicID, t.TopicName
      ORDER BY t.TopicName
    `,
      [userId]
    );

    const items = rows.map((row) => ({
      topicId: row.TopicID,
      topic: row.TopicName,
      accuracy: parseFloat(row.accuracy.toFixed(1)),
    }));

    res.json({ items });
  } catch (err) {
    console.error("Error in getStudentTopicAccuracy:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Server error" });
    }
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

/**
 * @function getExamCounters
 * @description Gets exam summary counters for KPI tiles
 * @param {object} req - Express request object with userId param and days query param
 * @param {object} res - Express response object
 */
exports.getExamCounters = async (req, res) => {
  const { userId } = req.params;
  const { days = 30 } = req.query;

  let connection;
  try {
    connection = await db.getConnection();

    const [rows] = await connection.query(
      `
      SELECT COUNT(*) AS totalExams,
             AVG(Grade) AS avgGrade,
             MAX(Grade) AS bestGrade,
             MAX(ExamDate) AS latestExamDate
      FROM exam
      WHERE UserID = ? AND ExamDate >= (CURRENT_DATE - INTERVAL ? DAY)
    `,
      [userId, parseInt(days)]
    );

    const row = rows[0];
    res.json({
      totalExams: row.totalExams,
      avgGrade: row.avgGrade ? parseFloat(row.avgGrade.toFixed(1)) : 0,
      bestGrade: row.bestGrade || 0,
      latestExamDate: row.latestExamDate
        ? row.latestExamDate.toISOString().split("T")[0]
        : null,
    });
  } catch (err) {
    console.error("Error in getExamCounters:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Server error" });
    }
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

/**
 * @function getCourseTopicDistribution
 * @description Gets topic distribution for course/manager view charts
 * @param {object} req - Express request object with courseId param
 * @param {object} res - Express response object
 */
exports.getCourseTopicDistribution = async (req, res) => {
  const { courseId } = req.params;

  let connection;
  try {
    connection = await db.getConnection();

    const [rows] = await connection.query(
      `
      SELECT t.TopicID, t.TopicName,
             COUNT(DISTINCT eq.QuestionID) AS examQuestions,
             COUNT(DISTINCT pe.ExerciseID) AS practiceExercises
      FROM topic t
      LEFT JOIN exam_question eq ON eq.TopicID = t.TopicID
      LEFT JOIN practice_exercise pe ON pe.TopicID = t.TopicID
      WHERE t.CourseID = ?
      GROUP BY t.TopicID, t.TopicName
      ORDER BY t.TopicName
    `,
      [courseId]
    );

    const items = rows.map((row) => ({
      topicId: row.TopicID,
      topicName: row.TopicName,
      examQuestions: row.examQuestions,
      practiceExercises: row.practiceExercises,
    }));

    res.json({ items });
  } catch (err) {
    console.error("Error in getCourseTopicDistribution:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Server error" });
    }
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

/**
 * @function getCourseGradesOverTime
 * @description Gets average grades per day for all users in a course, within [from, to]
 */
exports.getCourseGradesOverTime = async (req, res) => {
  const { courseId } = req.params;
  const { from, to } = req.query;

  let connection;
  try {
    connection = await db.getConnection();

    // defaults - last 30 days
    const todayStr = new Date().toISOString().slice(0, 10);
    const defaultFrom = new Date();
    defaultFrom.setDate(defaultFrom.getDate() - 30);
    const defaultFromStr = defaultFrom.toISOString().slice(0, 10);

    const fromDate = (from && String(from)) || defaultFromStr;
    const toDate = (to && String(to)) || todayStr;

    // normalize reversed ranges without failing
    const rangeOK = new Date(fromDate) <= new Date(toDate);
    const fromFinal = rangeOK ? fromDate : toDate;
    const toFinal = rangeOK ? toDate : fromDate;

    // compute per-exam score from exam_result.Grade, then daily average for the course
    const [rows] = await connection.query(
      `
      SELECT
        DATE_FORMAT(DATE(e.ExamDate), '%Y-%m-%d') AS date_str,
        AVG(per_exam.exam_score) AS avg_grade
      FROM users u
      JOIN exam e ON e.UserID = u.UserID
      JOIN (
        SELECT er.ExamID, AVG(er.Grade) AS exam_score
        FROM exam_result er
        GROUP BY er.ExamID
      ) AS per_exam ON per_exam.ExamID = e.ExamID
      WHERE u.CourseID = ?
        AND DATE(e.ExamDate) BETWEEN ? AND ?
      GROUP BY DATE(e.ExamDate)
      ORDER BY DATE(e.ExamDate)
      `,
      [courseId, fromFinal, toFinal]
    );

    const series = (rows || []).map((r) => ({
      date: r.date_str,
      avg: r.avg_grade != null ? Number(Number(r.avg_grade).toFixed(1)) : 0,
    }));

    res.json({ series });
  } catch (err) {
    console.error("Error in getCourseGradesOverTime:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Server error" });
    }
  } finally {
    if (connection) connection.release();
  }
};

/**
 * @function getPracticePerDay
 * @description Gets practice attempts per day for student analytics
 * @param {object} req - Express request object with userId param and days query param
 * @param {object} res - Express response object
 */
exports.getPracticePerDay = async (req, res) => {
  const { userId } = req.params;
  const { days = 14 } = req.query;

  let connection;
  try {
    connection = await db.getConnection();

    const [rows] = await connection.query(
      `
      SELECT DATE(AttemptedAt) AS date, COUNT(*) AS attempts,
             AVG(IsCorrect) * 100 AS accuracy
      FROM practice_attempt
      WHERE UserID = ? AND AttemptedAt >= (CURRENT_DATE - INTERVAL ? DAY)
      GROUP BY DATE(AttemptedAt)
      ORDER BY DATE(AttemptedAt)
    `,
      [userId, parseInt(days)]
    );

    const series = rows.map((row) => ({
      date: row.date.toISOString().split("T")[0],
      attempts: row.attempts,
      accuracy: parseFloat(row.accuracy.toFixed(1)),
    }));

    res.json({ series });
  } catch (err) {
    console.error("Error in getPracticePerDay:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Server error" });
    }
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

/**
 * @function getVideoMinutes
 * @description Gets video watch minutes per day for student analytics
 * @param {object} req - Express request object with userId param and days query param
 * @param {object} res - Express response object
 */
exports.getVideoMinutes = async (req, res) => {
  const { userId } = req.params;
  const { days = 14 } = req.query;

  let connection;
  try {
    connection = await db.getConnection();

    const [rows] = await connection.query(
      `
      SELECT DATE(WatchedAt) AS date, SUM(Seconds) / 60 AS minutes
      FROM video_watch
      WHERE UserID = ? AND WatchedAt >= (CURRENT_DATE - INTERVAL ? DAY)
      GROUP BY DATE(WatchedAt)
      ORDER BY DATE(WatchedAt)
    `,
      [userId, parseInt(days)]
    );

    const series = rows.map((row) => ({
      date: row.date.toISOString().split("T")[0],
      minutes: parseFloat(row.minutes.toFixed(1)),
    }));

    res.json({ series });
  } catch (err) {
    console.error("Error in getVideoMinutes:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Server error" });
    }
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

/**
 * @function getSiteVisitsCount
 * @description Gets site visit count for admin dashboard
 * @param {object} req - Express request object with from/to query params
 * @param {object} res - Express response object
 * @returns {Promise<Object>} Response with series data
 */
exports.getSiteVisitsCount = async (req, res) => {
  const { from, to } = req.query;

  // ברירות מחדל - 30 ימים אחרונים
  const today = new Date().toISOString().slice(0, 10);
  const d30 = new Date();
  d30.setDate(d30.getDate() - 30);
  const fromDate = (from && String(from)) || d30.toISOString().slice(0, 10);
  const toDate = (to && String(to)) || today;

  let connection;
  try {
    connection = await db.getConnection();
    const [rows] = await connection.query(
      `
      SELECT DATE_FORMAT(DATE(VisitedAt), '%Y-%m-%d') AS date_str,
             COUNT(*) AS visits
      FROM site_visit
      WHERE DATE(VisitedAt) BETWEEN ? AND ?
      GROUP BY DATE(VisitedAt)
      ORDER BY DATE(VisitedAt)
      `,
      [fromDate, toDate]
    );
    const series = rows.map((r) => ({
      date: r.date_str,
      count: Number(r.visits),
    }));
    res.json({ series });
  } catch (err) {
    console.error("Error getSiteVisitsCount:", err);
    if (!res.headersSent) res.status(500).json({ error: "Server error" });
  } finally {
    if (connection) connection.release();
  }
};

// ממוצע N המבחנים האחרונים לנבחן, כולל פירוט ציונים לכל מבחן
exports.getStudentAvgLastExams = async (req, res) => {
  const { userId } = req.params;
  const limitRaw = req.query.limit;
  const limit = Math.max(1, Math.min(50, Number(limitRaw || 3)));

  let connection;
  try {
    connection = await db.getConnection();

    // מחשבים ציון מבחן כממוצע Grade ב-exam_result, בוחרים את N האחרונים לפי ExamDate
    const [rows] = await connection.query(
      `
      SELECT e.ExamID,
             DATE(e.ExamDate) AS exam_date,
             per_exam.exam_score
      FROM exam e
      JOIN (
        SELECT er.ExamID, AVG(er.Grade) AS exam_score
        FROM exam_result er
        GROUP BY er.ExamID
      ) AS per_exam ON per_exam.ExamID = e.ExamID
      WHERE e.UserID = ?
      ORDER BY e.ExamDate DESC
      LIMIT ?
      `,
      [userId, limit]
    );

    const exams = (rows || []).map(r => ({
      examId: r.ExamID,
      date: r.exam_date instanceof Date ? r.exam_date.toISOString().slice(0, 10) : String(r.exam_date),
      score: Number(Number(r.exam_score).toFixed(1))
    }));

    const average = exams.length
      ? Number((exams.reduce((s, x) => s + x.score, 0) / exams.length).toFixed(1))
      : 0;

    res.json({ userId: String(userId), limit, average, exams });
  } catch (err) {
    console.error("Error getStudentAvgLastExams:", err);
    if (!res.headersSent) res.status(500).json({ error: "Server error" });
  } finally {
    if (connection) connection.release();
  }
};

// דוח תלמידים: לכל תלמיד ממוצע כל המבחנים ושלושת הציונים האחרונים
exports.getStudentsReport = async (req, res) => {
  const { courseId, userId } = req.query;

  let connection;
  try {
    connection = await db.getConnection();

    // נחשב ציון מבחן ממוצע מתוך exam_result ואז נאגר ברמת תלמיד
    // last3_list מוחזרת כמחרוזת "90,88,76" לפי סדר מהחדש לישן
    const params = [];
    let where = "1=1";

    if (courseId) {
      where += " AND u.CourseID = ?";
      params.push(courseId);
    }
    if (userId) {
      where += " AND u.UserID = ?";
      params.push(userId);
    }

    const [rows] = await connection.query(
      `
      SELECT
        u.UserID,
        u.Name,
        AVG(pe.score) AS avg_all,
        SUBSTRING_INDEX(
          GROUP_CONCAT(pe.score ORDER BY pe.d DESC SEPARATOR ','),
          ',', 3
        ) AS last3_list
      FROM users u
      LEFT JOIN (
        SELECT
          e.UserID,
          e.ExamID,
          DATE(e.ExamDate) AS d,
          AVG(er.Grade) AS score
        FROM exam e
        JOIN exam_result er ON er.ExamID = e.ExamID
        GROUP BY e.ExamID
      ) pe ON pe.UserID = u.UserID
      WHERE ${where}
      GROUP BY u.UserID, u.Name
      ORDER BY u.UserID
      `,
      params
    );

    const data = (rows || []).map(r => {
      const avgAll = r.avg_all != null ? Number(Number(r.avg_all).toFixed(1)) : null;
      const last3 = (r.last3_list || "")
        .split(",")
        .filter(s => s !== "")
        .map(s => Number(Number(s).toFixed(1)));
      // נשלים ל־3 ערכים אם יש פחות
      while (last3.length < 3) last3.push(null);
      return {
        name: r.Name,
        userId: String(r.UserID),
        avgAll,
        last3 // [s1, s2, s3] מהחדש לישן
      };
    });

    res.json({ count: data.length, data });
  } catch (err) {
    console.error("Error getStudentsReport:", err);
    if (!res.headersSent) res.status(500).json({ error: "Server error" });
  } finally {
    if (connection) connection.release();
  }
};

/**
 * Gets topic failure rates for teacher view charts
 * @param {string|number} courseId - The course ID
 * @param {string|number} [from] - The start date of the range, defaults to 30 days ago
 * @param {string|number} [to] - The end date of the range, defaults to today
 * @returns {Promise<Object>} Response with topic failure rates data
 * @example
 * // Get topic failure rates for course 123 from 2020-01-01 to 2020-01-31
 * const response = await getTopicFailureRates({ courseId: 123, from: "2020-01-01", to: "2020-01-31" });
 * console.log(response);
 * // { courseId: "123", from: "2020-01-01", to: "2020-01-31", items: [ { topicId, topicName, total, failed, failureRate } ] }
 */
exports.getTopicFailureRates = async (req, res) => {
  const { courseId } = req.params;
  const { from, to } = req.query;

  // ברירת מחדל לטווח 30 ימים
  const today = new Date().toISOString().slice(0, 10);
  const d30 = new Date();
  d30.setDate(d30.getDate() - 30);
  const fromDate = from ? String(from) : d30.toISOString().slice(0, 10);
  const toDate = to ? String(to) : today;

  let connection;
  try {
    connection = await db.getConnection();

    // חשוב: WHERE רק על topic של הקורס - שומר נושאים גם אם אין להם תוצאות
    // שאר הסינונים בתוך LEFT JOIN כדי לא להפיל שורות ריקות
    const [rows] = await connection.query(
      `
      SELECT
        t.TopicID   AS topicId,
        t.TopicName AS topicName,
        COUNT(er.ExamID) AS total,
        SUM(
          CASE
            WHEN er.SelectedAnswer IS NULL THEN 0   -- אין רישום תשובה - לא נספור ככישלון אם אין נסיון
            WHEN er.SelectedAnswer <> q.CorrectAnswer THEN 1
            ELSE 0
          END
        ) AS failed
      FROM topic t
      LEFT JOIN exam_question q
        ON q.TopicID = t.TopicID
      LEFT JOIN exam_result er
        ON er.QuestionID = q.QuestionID
      LEFT JOIN exam e
        ON e.ExamID = er.ExamID
       AND DATE(e.ExamDate) BETWEEN ? AND ?
      LEFT JOIN users u
        ON u.UserID = e.UserID
       AND u.CourseID = ?
      WHERE t.CourseID = ?
      GROUP BY t.TopicID, t.TopicName
      ORDER BY t.TopicName
      `,
      [fromDate, toDate, courseId, courseId]
    );

    const items = rows.map((r) => {
      const total = Number(r.total || 0);
      const failed = Number(r.failed || 0);
      const failureRate =
        total > 0 ? Number(((failed / total) * 100).toFixed(1)) : 0;
      return {
        topicId: r.topicId,
        topicName: r.topicName,
        total,
        failed,
        failureRate,
      };
    });

    res.json({ courseId: String(courseId), from: fromDate, to: toDate, items });
  } catch (err) {
    console.error("Error getTopicFailureRates:", err);
    if (!res.headersSent) res.status(500).json({ error: "Server error" });
  } finally {
    if (connection) connection.release();
  }
};