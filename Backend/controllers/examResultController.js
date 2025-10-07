// בקובץ זה נמצאות כל הפונקציות לטיפול בתוצאות בחינות במערכת
// הקובץ מטפל בשמירת תוצאות בחינות, קבלת נתונים סטטיסטיים וניהול טבלת הבחינות
// הוא מספק מידע על היסטוריית בחינות, ציונים ממוצעים ונתונים עבור לוח הבקרה של הסטודנט
//controllers
// examResultController.js
const db = require("../dbConnection");

// Test function to check and create exam table
exports.testExamTable = async (req, res) => {
  console.log('testExamTable called');
  let connection;
  
  try {
    connection = await db.getConnection();
    console.log('Database connection established for table test');
    
    // Check if exam table exists
    const [tables] = await connection.query(`
      SHOW TABLES LIKE 'exam'
    `);
    
    console.log('Tables found:', tables);
    
    if (tables.length === 0) {
      console.log('Exam table does not exist, creating it...');
      
      // Create the exam table with grade column
      await connection.query(`
        CREATE TABLE exam (
          ExamID INT AUTO_INCREMENT PRIMARY KEY,
          UserID INT NOT NULL,
          ExamDate DATE NOT NULL,
          Grade DECIMAL(5,2) NOT NULL
        )
      `);
      
      console.log('Exam table created successfully');
      
      // Insert a test record
      const [insertResult] = await connection.query(`
        INSERT INTO exam (UserID, ExamDate, Grade) VALUES (1, CURDATE(), 85.5)
      `);
      
      console.log('Test record inserted with ID:', insertResult.insertId);
      
      res.json({ 
        message: "Exam table created and test record inserted", 
        tableCreated: true,
        testRecordId: insertResult.insertId
      });
    } else {
      console.log('Exam table already exists');
      
      // Check if grade column exists, if not add it
      const [columns] = await connection.query(`
        DESCRIBE exam
      `);
      
      console.log('Table structure:', columns);
      
      const hasGradeColumn = columns.some(col => col.Field === 'Grade');
      
      if (!hasGradeColumn) {
        console.log('Adding Grade column to existing table...');
        await connection.query(`
          ALTER TABLE exam ADD COLUMN Grade DECIMAL(5,2) NOT NULL DEFAULT 0.00
        `);
        console.log('Grade column added successfully');
      }
      
      // Count records
      const [countResult] = await connection.query(`
        SELECT COUNT(*) as recordCount FROM exam
      `);
      
      console.log('Record count:', countResult[0].recordCount);
      
      res.json({ 
        message: "Exam table exists", 
        tableExists: true,
        recordCount: countResult[0].recordCount,
        structure: columns,
        gradeColumnAdded: !hasGradeColumn
      });
    }
    
  } catch (err) {
    console.error("Error in testExamTable:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Server error", details: err.message });
    }
  } finally {
    if (connection && typeof connection.release === 'function') {
      connection.release();
    }
  }
};

// Submit exam results to the exam table
// Submit exam results to the exam table - optional detailed rows into exam_result
exports.submitExamResults = async (req, res) => {
  const { userId, score, answers, timeSpent, completedAt } = req.body;
  let connection;

  console.log("submitExamResults called with data:", {
    userId,
    score,
    answersCount: Array.isArray(answers) ? answers.length : 0,
    timeSpent,
    completedAt,
  });

  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    // יצירת רשומת exam - שמור תאריך
    const [examResult] = await connection.query(
      `INSERT INTO exam (UserID, ExamDate) VALUES (?, CURDATE())`,
      [userId]
    );
    const examId = examResult.insertId;

    // שמירת פירוט לתוך exam_result אם קיבלת תשובות
    // מצופה מבנה תשובה לדוגמה:
    // answers = [{ questionId: 123, position: 1, isCorrect: true, grade: 100 }, ...]
    if (Array.isArray(answers) && answers.length) {
      const values = [];
      const placeholders = [];

      answers.forEach((a) => {
        const qId = Number(a.questionId);
        const pos = Number(a.position || 0);
        const isCorrect = a.isCorrect ? 1 : 0;
        // אם אין grade מפורש, תן 100 או 0
        const grade = a.grade != null ? Number(a.grade) : isCorrect ? 100 : 0;

        placeholders.push("(?, ?, ?, ?, ?)");
        values.push(examId, qId, pos, isCorrect, grade);
      });

      await connection.query(
        `
        INSERT INTO exam_result (ExamID, QuestionID, Position, IsCorrect, Grade)
        VALUES ${placeholders.join(",")}
        `,
        values
      );
    }

    await connection.commit();

    res.json({
      message: "Exam results saved successfully",
      examId,
      score: score != null ? score : null,
      date: new Date().toISOString().split("T")[0],
    });
  } catch (err) {
    if (connection) await connection.rollback();
    console.error("Error in submitExamResults:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Server error", details: err.message });
    }
  } finally {
    if (connection && typeof connection.release === "function") {
      connection.release();
    }
  }
};


// Get the last exam for a student
exports.getLastExam = async (req, res) => {
  const { userId } = req.params;
  let connection;
  try {
    connection = await db.getConnection();

    // ננסה להביא את המבחן האחרון עם ממוצע ציון מתוך exam_result
    const [rows] = await connection.query(
      `
      SELECT e.ExamID,
             e.UserID,
             e.ExamDate,
             ROUND(AVG(er.Grade), 2) AS Grade
      FROM exam e
      JOIN exam_result er ON er.ExamID = e.ExamID
      WHERE e.UserID = ?
      GROUP BY e.ExamID, e.UserID, e.ExamDate
      ORDER BY e.ExamDate DESC, e.ExamID DESC
      LIMIT 1
    `,
      [userId]
    );

    if (rows.length > 0) {
      return res.json(rows[0]);
    }

    // fallback אם אין exam_result - נשתמש בעמודה Grade אם קיימת ב-exam
    const [fallback] = await connection.query(
      `
      SELECT ExamID, UserID, ExamDate, Grade
      FROM exam
      WHERE UserID = ?
      ORDER BY ExamDate DESC, ExamID DESC
      LIMIT 1
    `,
      [userId]
    );

    return res.json(fallback[0] || null);
  } catch (err) {
    console.error("Error in getLastExam:", err);
    if (!res.headersSent) res.status(500).json({ error: "Server error" });
  } finally {
    if (connection && connection.release) connection.release();
  }
};


// Get exam results for a specific student
exports.getStudentExamResults = async (req, res) => {
  const { studentId } = req.params;
  let connection;
  try {
    connection = await db.getConnection();
    const [rows] = await connection.query(
      `
      SELECT e.ExamID,
             e.UserID,
             e.ExamDate,
             ROUND(AVG(er.Grade), 2) AS Grade
      FROM exam e
      JOIN exam_result er ON er.ExamID = e.ExamID
      WHERE e.UserID = ?
      GROUP BY e.ExamID, e.UserID, e.ExamDate
      ORDER BY e.ExamDate DESC, e.ExamID DESC
      LIMIT 50
    `,
      [studentId]
    );
    res.json(rows);
  } catch (err) {
    console.error("Error in getStudentExamResults:", err);
    if (!res.headersSent) res.status(500).json({ error: "Server error" });
  } finally {
    if (connection && connection.release) connection.release();
  }
};


// Get student exam statistics
exports.getStudentExamStats = async (req, res) => {
  const { studentId } = req.params;
  let connection;
  try {
    connection = await db.getConnection();

    // סטטיסטיקות מהתכנסויות של exam_result לפי מבחן
    const [stats] = await connection.query(
      `
      SELECT COUNT(*) AS totalExams,
             ROUND(AVG(exam_avg), 2) AS averageGrade,
             MAX(exam_avg) AS highestGrade,
             MIN(exam_avg) AS lowestGrade,
             SUM(CASE WHEN exam_avg >= 60 THEN 1 ELSE 0 END) AS passedExams,
             SUM(CASE WHEN exam_avg < 60 THEN 1 ELSE 0 END) AS failedExams
      FROM (
        SELECT e.ExamID, AVG(er.Grade) AS exam_avg
        FROM exam e
        JOIN exam_result er ON er.ExamID = e.ExamID
        WHERE e.UserID = ?
        GROUP BY e.ExamID
      ) t
    `,
      [studentId]
    );

    const [history] = await connection.query(
      `
      SELECT e.ExamID,
             e.ExamDate,
             ROUND(AVG(er.Grade), 2) AS Grade
      FROM exam e
      JOIN exam_result er ON er.ExamID = e.ExamID
      WHERE e.UserID = ?
      GROUP BY e.ExamID, e.ExamDate
      ORDER BY e.ExamDate DESC, e.ExamID DESC
      LIMIT 10
    `,
      [studentId]
    );

    const s = stats[0] || {};
    res.json({
      totalExams: s.totalExams || 0,
      averageGrade: s.averageGrade || 0,
      highestGrade: s.highestGrade || 0,
      lowestGrade: s.lowestGrade || 0,
      passedExams: s.passedExams || 0,
      failedExams: s.failedExams || 0,
      examHistory: history.map((r) => ({
        examId: r.ExamID,
        date: r.ExamDate,
        grade: Number(r.Grade || 0),
      })),
    });
  } catch (err) {
    console.error("Error in getStudentExamStats:", err);
    if (!res.headersSent) res.status(500).json({ error: "Server error" });
  } finally {
    if (connection && connection.release) connection.release();
  }
};


// Get student dashboard data (profile + recent results)
exports.getStudentDashboardData = async (req, res) => {
  const { studentId } = req.params;
  let connection;
  
  try {
    connection = await db.getConnection();
    
    // Get user info
    let userRows;
    try {
      [userRows] = await connection.query(`
        SELECT u.UserID, u.Name, u.Email, c.CourseName
        FROM users u
        LEFT JOIN course c ON u.CourseID = c.CourseID
        WHERE u.UserID = ?
      `, [studentId]);
    } catch (userErr) {
      console.log("User table query failed, using fallback data");
      userRows = [];
    }
    
    // If no user found, create fallback user data
    const user = userRows.length > 0 ? userRows[0] : {
      UserID: studentId,
      Name: "סטודנט",
      Email: "student@example.com",
      CourseName: "מתמטיקה"
    };
    
    // Get latest exam result from the exam table
    let latestExamRows = [];
    try {
      [latestExamRows] = await connection.query(
        `
    SELECT e.ExamID,
           e.ExamDate,
           ROUND(AVG(er.Grade), 2) AS Grade
    FROM exam e
    JOIN exam_result er ON er.ExamID = e.ExamID
    WHERE e.UserID = ?
    GROUP BY e.ExamID, e.ExamDate
    ORDER BY e.ExamDate DESC, e.ExamID DESC
    LIMIT 1
  `,
        [studentId]
      );
    } catch (examErr) {
      console.log("Exam aggregate query failed:", examErr.message);
    }
    
    // Get overall average from the exam table (only completed exams)
   let overallAvgRows = [{ overallAverage: null, totalExams: 0 }];
   try {
     [overallAvgRows] = await connection.query(
       `
    SELECT ROUND(AVG(t.exam_avg), 2) AS overallAverage,
           COUNT(*) AS totalExams
    FROM (
      SELECT e.ExamID, AVG(er.Grade) AS exam_avg
      FROM exam e
      JOIN exam_result er ON er.ExamID = e.ExamID
      WHERE e.UserID = ?
      GROUP BY e.ExamID
    ) t
  `,
       [studentId]
     );
   } catch (avgErr) {
     console.log("Overall average aggregate failed:", avgErr.message);
   }
    
    const dashboardData = {
      user: {
        id: user.UserID,
        name: user.Name,
        email: user.Email,
        course: user.CourseName || "מתמטיקה"
      },
      lastExam: latestExamRows.length > 0 ? {
        examId: latestExamRows[0].ExamID,
        date: latestExamRows[0].ExamDate,
        grade: Math.round(latestExamRows[0].Grade)
      } : null,
      overallAverage: overallAvgRows[0].overallAverage ? Math.round(overallAvgRows[0].overallAverage * 100) / 100 : 0,
      totalExams: overallAvgRows[0].totalExams || 0
    };
    
    console.log(`Dashboard data for user ${studentId}:`, dashboardData);
    res.json(dashboardData);
    
  } catch (err) {
    console.error("Error in getStudentDashboardData:", err);
    if (!res.headersSent) {
      // Return fallback data instead of error when database fails
      const fallbackData = {
        user: {
          id: studentId,
          name: "סטודנט",
          email: "student@example.com",
          course: "מתמטיקה"
        },
        lastExam: null,
        overallAverage: 0,
        totalExams: 0
      };
      res.json(fallbackData);
    }
  } finally {
    if (connection && typeof connection.release === 'function') {
      connection.release();
    }
  }
};

// Get comprehensive student metrics (new endpoint)
// Get comprehensive student metrics (reworked to use exam_result)
exports.getStudentMetrics = async (req, res) => {
  const { userId } = req.params;
  let connection;

  try {
    connection = await db.getConnection();

    // המבחן האחרון לפי ExamDate וממוצע ציונים מתוך exam_result
    const [latestExamRows] = await connection.query(
      `
      SELECT e.ExamID, e.ExamDate, ROUND(AVG(er.Grade), 2) AS Grade
      FROM exam e
      JOIN exam_result er ON er.ExamID = e.ExamID
      WHERE e.UserID = ?
      GROUP BY e.ExamID, e.ExamDate
      ORDER BY e.ExamDate DESC, e.ExamID DESC
      LIMIT 1
      `,
      [userId]
    );

    // סטטיסטיקות גלובליות לפי ממוצע לכל מבחן
    const [statsRows] = await connection.query(
      `
      SELECT 
        COUNT(*) AS totalExams,
        ROUND(AVG(t.exam_avg), 2) AS averageGrade,
        MAX(t.exam_avg) AS highestGrade,
        MIN(t.exam_avg) AS lowestGrade,
        SUM(CASE WHEN t.exam_avg >= 60 THEN 1 ELSE 0 END) AS passedExams,
        SUM(CASE WHEN t.exam_avg < 60 THEN 1 ELSE 0 END) AS failedExams
      FROM (
        SELECT e.ExamID, AVG(er.Grade) AS exam_avg
        FROM exam e
        JOIN exam_result er ON er.ExamID = e.ExamID
        WHERE e.UserID = ?
        GROUP BY e.ExamID
      ) t
      `,
      [userId]
    );

    // היסטוריה אחרונה של מבחנים עם ממוצע מה־exam_result
    const [historyRows] = await connection.query(
      `
      SELECT e.ExamID, e.ExamDate, ROUND(AVG(er.Grade), 2) AS Grade
      FROM exam e
      JOIN exam_result er ON er.ExamID = e.ExamID
      WHERE e.UserID = ?
      GROUP BY e.ExamID, e.ExamDate
      ORDER BY e.ExamDate DESC, e.ExamID DESC
      LIMIT 5
      `,
      [userId]
    );

    const metrics = {
      lastExam: latestExamRows.length
        ? {
            examId: latestExamRows[0].ExamID,
            date: latestExamRows[0].ExamDate,
            grade: Math.round(latestExamRows[0].Grade || 0),
          }
        : null,
      statistics: {
        totalExams: statsRows[0]?.totalExams || 0,
        averageGrade: statsRows[0]?.averageGrade || 0,
        highestGrade: statsRows[0]?.highestGrade || 0,
        lowestGrade: statsRows[0]?.lowestGrade || 0,
        passedExams: statsRows[0]?.passedExams || 0,
        failedExams: statsRows[0]?.failedExams || 0,
      },
      examHistory: historyRows.map((row) => ({
        examId: row.ExamID,
        date: row.ExamDate,
        grade: Math.round(row.Grade || 0),
      })),
    };

    res.json(metrics);
  } catch (err) {
    console.error("Error in getStudentMetrics:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Server error", details: err.message });
    }
  } finally {
    if (connection && typeof connection.release === "function") {
      connection.release();
    }
  }
};


// Migrate existing exam records to include grades if missing
exports.migrateExamGrades = async (req, res) => {
  console.log('migrateExamGrades called');
  let connection;
  
  try {
    connection = await db.getConnection();
    console.log('Database connection established for migration');
    
    // Check if there are any exam records without grades
    const [rows] = await connection.query(`
      SELECT ExamID, UserID, ExamDate, Grade
      FROM exam 
      WHERE Grade IS NULL OR Grade = 0
    `);
    
    console.log('Found records without grades:', rows.length);
    
    if (rows.length > 0) {
      // Update records with default grade (assuming 85 as default)
      const [updateResult] = await connection.query(`
        UPDATE exam 
        SET Grade = 85.00 
        WHERE Grade IS NULL OR Grade = 0
      `);
      
      console.log('Updated records:', updateResult.affectedRows);
      
      res.json({ 
        message: "Migration completed", 
        recordsUpdated: updateResult.affectedRows,
        defaultGrade: 85.00
      });
    } else {
      res.json({ 
        message: "No migration needed", 
        recordsUpdated: 0
      });
    }
    
  } catch (err) {
    console.error("Error in migrateExamGrades:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Server error", details: err.message });
    }
  } finally {
    if (connection && typeof connection.release === 'function') {
      connection.release();
    }
  }
}; 