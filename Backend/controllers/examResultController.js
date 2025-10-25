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
    
    let examTableCreated = false;
    let hasGradeColumn = false;
    let examRecordCount = 0;
    
    if (tables.length === 0) {
      console.log('Exam table does not exist, creating it...');
      
      // Create the exam table with grade column
      await connection.query(`
        CREATE TABLE exam (
          ExamID INT AUTO_INCREMENT PRIMARY KEY,
          UserID INT NOT NULL,
          ExamDate DATE NOT NULL,
          Grade DECIMAL(5,2) DEFAULT NULL
        )
      `);
      
      console.log('Exam table created successfully');
      examTableCreated = true;
      hasGradeColumn = true;
    } else {
      console.log('Exam table already exists');
      
      // Check if grade column exists, if not add it
      const [columns] = await connection.query(`
        DESCRIBE exam
      `);
      
      console.log('Table structure:', columns);
      
      hasGradeColumn = columns.some(col => col.Field === 'Grade');
      
      if (!hasGradeColumn) {
        console.log('Adding Grade column to existing table...');
        await connection.query(`
          ALTER TABLE exam ADD COLUMN Grade DECIMAL(5,2) DEFAULT NULL
        `);
        console.log('Grade column added successfully');
        hasGradeColumn = true;
      }
      
      // Count records
      const [countResult] = await connection.query(`
        SELECT COUNT(*) as recordCount FROM exam
      `);
      
      examRecordCount = countResult[0].recordCount;
      console.log('Record count:', examRecordCount);
    }
    
    // Check if exam_result table exists
    const [examResultTables] = await connection.query(`
      SHOW TABLES LIKE 'exam_result'
    `);
    
    if (examResultTables.length === 0) {
      console.log('exam_result table does not exist, creating it...');
      
      await connection.query(`
        CREATE TABLE exam_result (
          ResultID INT AUTO_INCREMENT PRIMARY KEY,
          ExamID INT NOT NULL,
          QuestionID INT NOT NULL,
          Position INT NOT NULL DEFAULT 0,
          IsCorrect TINYINT(1) NOT NULL DEFAULT 0,
          Grade DECIMAL(5,2) NOT NULL DEFAULT 0.00,
          FOREIGN KEY (ExamID) REFERENCES exam(ExamID) ON DELETE CASCADE,
          INDEX idx_exam_id (ExamID),
          INDEX idx_question_id (QuestionID)
        )
      `);
      
      console.log('exam_result table created successfully');
    }
    
    // Count exam_result records
    const [examResultCount] = await connection.query(`
      SELECT COUNT(*) as recordCount FROM exam_result
    `);
    
    console.log('exam_result record count:', examResultCount[0].recordCount);
    
    res.json({ 
      message: "Database tables verified and configured", 
      examTable: {
        exists: true,
        created: examTableCreated,
        recordCount: examRecordCount,
        hasGradeColumn: hasGradeColumn
      },
      examResultTable: {
        exists: true,
        created: examResultTables.length === 0,
        recordCount: examResultCount[0].recordCount
      }
    });
    
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

    // יצירת רשומת exam - שמור תאריך וציון
    const [examResult] = await connection.query(
      `INSERT INTO exam (UserID, ExamDate, Grade) VALUES (?, CURDATE(), ?)`,
      [userId, score]
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
      grade: score != null ? parseFloat(score) : null,
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


// Get student dashboard data (profile + recent results)
// This is the main endpoint used by the student dashboard
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
      CourseName: "Math"
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
        course: user.CourseName || "Math"
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
          course: "Math"
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

// Migrate existing exam records to include grades if missing (utility function, not actively used)
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