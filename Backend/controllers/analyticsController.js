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

    // Validate that the user exists and has Role = 'Examinee'
    const [userRows] = await connection.query(
      `
      SELECT UserID, Role
      FROM users
      WHERE UserID = ?
      `,
      [userId]
    );

    if (!userRows || userRows.length === 0) {
      return res.status(404).json({ 
        error: "ת.ז שהוזנה לא נמצאת במערכת.",
        userNotFound: true 
      });
    }

    if (userRows[0].Role !== 'Examinee') {
      return res.status(404).json({ 
        error: "ת.ז שהוזנה לא נמצאת במערכת.",
        userNotFound: true 
      });
    }

    // מחשבים ציון מבחן כממוצע Grade ב-exam_result, בוחרים את N האחרונים לפי ExamID
    // משתמשים ב-ExamID DESC כדי להבטיח שהמבחנים האחרונים נבחרים גם אם נלקחו באותו תאריך
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
      ORDER BY e.ExamID DESC
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

    // Count total exams for this user (validate via users.UserID)
    const [countRows] = await connection.query(
      `
      SELECT COUNT(*) AS totalExams
      FROM exam e
      INNER JOIN users u ON u.UserID = e.UserID
      WHERE e.UserID = ?
      `,
      [userId]
    );

    const totalExams = countRows[0] ? Number(countRows[0].totalExams || 0) : 0;

    res.json({ userId: String(userId), limit, average, exams, totalExams });
  } catch (err) {
    console.error("Error getStudentAvgLastExams:", err);
    if (!res.headersSent) res.status(500).json({ error: "Server error" });
  } finally {
    if (connection) connection.release();
  }
};

// דוח תלמידים: לכל תלמיד ממוצע כל המבחנים ושלושת הציונים האחרונים
exports.getStudentsReport = async (req, res) => {
  const { courseId, userId, role } = req.query;

  let connection;
  try {
    connection = await db.getConnection();

    // נחשב ציון מבחן ממוצע מתוך exam_result ואז נאגר ברמת תלמיד
    // last3_list מוחזרת כמחרוזת "90,88,76" לפי סדר מהחדש לישן
    // משתמשים ב-ExamID DESC כדי להבטיח שהמבחנים האחרונים נבחרים גם אם נלקחו באותו תאריך
    const params = [];
    let where = "1=1";

    if (courseId) {
      where += " AND u.CourseID = ?";
      params.push(courseId);
    }
    if (userId) {
      // Support filtering by both UserID and Name
      where += " AND (u.UserID LIKE ? OR u.Name LIKE ?)";
      const searchTerm = `%${userId}%`;
      params.push(searchTerm, searchTerm);
    }
    if (role) {
      where += " AND u.Role = ?";
      params.push(role);
    }

    const [rows] = await connection.query(
      `
      SELECT
        u.UserID,
        u.Name,
        AVG(pe.score) AS avg_all,
        SUBSTRING_INDEX(
          GROUP_CONCAT(pe.score ORDER BY pe.ExamID DESC SEPARATOR ','),
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

    // Use exam_result and exam tables to analyze correctness by position (topic)
    // Position column represents topics, isCorrect indicates correctness
    const [rows] = await connection.query(
      `
      SELECT
        er.Position AS topicId,
        CONCAT('נושא ', er.Position) AS topicName,
        COUNT(*) AS total,
        SUM(CASE WHEN er.IsCorrect = 0 THEN 1 ELSE 0 END) AS failed,
        AVG(CASE WHEN er.IsCorrect = 1 THEN 1 ELSE 0 END) * 100 AS correctRate
      FROM exam_result er
      JOIN exam e ON e.ExamID = er.ExamID
      JOIN users u ON u.UserID = e.UserID
      WHERE u.CourseID = ?
        AND DATE(e.ExamDate) BETWEEN ? AND ?
      GROUP BY er.Position
      ORDER BY failed ASC, total ASC
      `,
      [courseId, fromDate, toDate]
    );

    const items = rows.map((r) => {
      const total = Number(r.total || 0);
      const failed = Number(r.failed || 0);
      const failureRate = total > 0 ? Number(((failed / total) * 100).toFixed(1)) : 0;
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

/**
 * Get site visit statistics - enhanced version
 * If userId is provided: returns specific user's name, last visit, and total visits
 * If no userId: returns aggregated stats (total examinees, examinees who visited in range, percentage)
 * @param {string} userId - Optional user ID to filter
 * @param {string} from - Start date (YYYY-MM-DD)
 * @param {string} to - End date (YYYY-MM-DD)
 */
// analyticsController.js

exports.getSiteVisitStats = async (req, res) => {
  const { userId, from, to } = req.query;
  let connection;

  try {
    connection = await db.getConnection();

    // Normalize date range
    const toDate = (to && String(to)) || new Date().toISOString().slice(0, 10);
    const d = new Date();
    d.setDate(d.getDate() - 30);
    const fromDate = (from && String(from)) || d.toISOString().slice(0, 10);

    if (userId) {
      // Filter by the selected range for this specific user
      const [rows] = await connection.query(
        `
        SELECT
          u.Name,
          MIN(CASE WHEN DATE(sv.VisitedAt) BETWEEN ? AND ? THEN sv.VisitedAt END) AS firstVisitInRange,
          MAX(CASE WHEN DATE(sv.VisitedAt) BETWEEN ? AND ? THEN sv.VisitedAt END) AS lastVisitInRange,
          SUM(CASE WHEN DATE(sv.VisitedAt) BETWEEN ? AND ? THEN 1 ELSE 0 END)     AS totalDaysInRange
        FROM users u
        LEFT JOIN site_visit sv ON sv.UserID = u.UserID
        WHERE u.UserID = ? AND u.Role = 'Examinee'
        GROUP BY u.UserID, u.Name
        `,
        [fromDate, toDate, fromDate, toDate, fromDate, toDate, userId]
      );

      if (!rows || rows.length === 0) {
        return res.json({ userId, found: false, message: "User not found or not an Examinee" });
      }

      // Optional: return the exact dates within the range to show a list or dots on a chart
      const [seriesRows] = await connection.query(
        `
        SELECT DATE(VisitedAt) AS d
        FROM site_visit
        WHERE UserID = ? AND DATE(VisitedAt) BETWEEN ? AND ?
        ORDER BY DATE(VisitedAt)
        `,
        [userId, fromDate, toDate]
      );

      const r = rows[0];
      const days = (seriesRows || []).map(row =>
        row.d instanceof Date ? row.d.toISOString().slice(0, 10) : String(row.d)
      );

      return res.json({
        userId: String(userId),
        found: true,
        name: r.Name,
        from: fromDate,
        to: toDate,
        firstVisit: r.firstVisitInRange,
        lastVisit: r.lastVisitInRange,
        totalVisits: Number(r.totalDaysInRange || 0), // exactly how many rows belong to this ID in the range
        days // optional helper array of the dates
      });
    }

    // Aggregated stats for all examinees (kept as is)
    const [totalRows] = await connection.query(
      `SELECT COUNT(*) AS total FROM users WHERE Role = 'Examinee'`
    );
    const totalExaminees = Number(totalRows[0].total || 0);

    const [visitedRows] = await connection.query(
      `
      SELECT COUNT(DISTINCT sv.UserID) AS visited
      FROM site_visit sv
      JOIN users u ON u.UserID = sv.UserID
      WHERE u.Role = 'Examinee'
        AND DATE(sv.VisitedAt) BETWEEN ? AND ?
      `,
      [fromDate, toDate]
    );

    const examinessWhoVisited = Number(visitedRows[0].visited || 0);
    const percentage = totalExaminees > 0
      ? Number(((examinessWhoVisited / totalExaminees) * 100).toFixed(1))
      : 0;

    return res.json({
      from: fromDate,
      to: toDate,
      totalExaminees,
      examinessWhoVisited,
      percentage
    });
  } catch (err) {
    console.error("Error getSiteVisitStats:", err);
    if (!res.headersSent) res.status(500).json({ error: "Server error" });
  } finally {
    if (connection) connection.release();
  }
};


/**
 * @function getGradeDistribution
 * @description Gets grade distribution data grouped into ranges for bar chart visualization
 * @param {object} req - Express request object with from/to query params
 * @param {object} res - Express response object
 */
exports.getGradeDistribution = async (req, res) => {
  const { from, to } = req.query;

  let connection;
  try {
    connection = await db.getConnection();

    // Default to last 30 days if no date range provided
    const today = new Date();
    const defaultFrom = new Date();
    defaultFrom.setDate(defaultFrom.getDate() - 30);

    const fromDate = from || defaultFrom.toISOString().split("T")[0];
    const toDate = to || today.toISOString().split("T")[0];

    // Query to get exam grades grouped by ranges using Grade column from Exam table
    const [rows] = await connection.query(
      `
      SELECT 
        CASE 
          WHEN e.Grade >= 0 AND e.Grade < 10 THEN '0-10'
          WHEN e.Grade >= 10 AND e.Grade < 20 THEN '10-20'
          WHEN e.Grade >= 20 AND e.Grade < 30 THEN '20-30'
          WHEN e.Grade >= 30 AND e.Grade < 40 THEN '30-40'
          WHEN e.Grade >= 40 AND e.Grade < 50 THEN '40-50'
          WHEN e.Grade >= 50 AND e.Grade < 60 THEN '50-60'
          WHEN e.Grade >= 60 AND e.Grade < 70 THEN '60-70'
          WHEN e.Grade >= 70 AND e.Grade < 80 THEN '70-80'
          WHEN e.Grade >= 80 AND e.Grade < 90 THEN '80-90'
          WHEN e.Grade >= 90 AND e.Grade <= 100 THEN '90-100'
        END AS grade_range,
        COUNT(*) AS exam_count
      FROM exam e
      WHERE DATE(e.ExamDate) BETWEEN ? AND ?
        AND e.Grade IS NOT NULL
      GROUP BY grade_range
      HAVING grade_range IS NOT NULL
      ORDER BY grade_range
      `,
      [fromDate, toDate]
    );

    // Create a complete range map with all possible ranges
    const rangeMap = {
      '0-10': 0,
      '10-20': 0,
      '20-30': 0,
      '30-40': 0,
      '40-50': 0,
      '50-60': 0,
      '60-70': 0,
      '70-80': 0,
      '80-90': 0,
      '90-100': 0
    };

    // Populate the map with actual data
    rows.forEach(row => {
      if (rangeMap.hasOwnProperty(row.grade_range)) {
        rangeMap[row.grade_range] = row.exam_count;
      }
    });

    // Convert to array format for the chart
    const distribution = Object.entries(rangeMap).map(([range, count]) => ({
      range,
      students: count
    }));

    res.json({ 
      distribution,
      from: fromDate,
      to: toDate,
      totalExams: distribution.reduce((sum, item) => sum + item.students, 0)
    });
  } catch (err) {
    console.error("Error in getGradeDistribution:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Server error" });
    }
  } finally {
    if (connection) {
      connection.release();
    }
  }
};