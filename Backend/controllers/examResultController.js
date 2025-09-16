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
exports.submitExamResults = async (req, res) => {
  const { userId, score, answers, timeSpent, completedAt } = req.body;
  let connection;
  
  console.log('submitExamResults called with data:', { userId, score, answers, timeSpent, completedAt });
  
  try {
    connection = await db.getConnection();
    console.log('Database connection established for exam submission');
    
    // Insert exam record into the exam table with grade
    const query = "INSERT INTO exam (UserID, ExamDate, Grade) VALUES (?, CURDATE(), ?)";
    const params = [userId, score];
    
    console.log('Executing insert query:', query);
    console.log('With parameters:', params);
    
    const [examResult] = await connection.query(query, params);
    
    console.log('Insert result:', examResult);
    
    const examId = examResult.insertId;
    
    console.log('Exam inserted successfully with ID:', examId);
    
    res.json({ 
      message: "Exam results saved successfully", 
      examId: examId,
      score: score,
      date: new Date().toISOString().split('T')[0] // Current date in YYYY-MM-DD format
    });
    
  } catch (err) {
    console.error("Error in submitExamResults:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Server error" });
    }
  } finally {
    if (connection && typeof connection.release === 'function') {
      connection.release();
    }
  }
};

// Get the last exam for a student
exports.getLastExam = async (req, res) => {
  const { userId } = req.params;
  let connection;
  
  console.log('getLastExam called with userId:', userId);
  
  try {
    connection = await db.getConnection();
    console.log('Database connection established');
    
    // Get the most recent exam for the student from the exam table including grade
    const query = `
      SELECT ExamID, UserID, ExamDate, Grade
      FROM exam 
      WHERE UserID = ? 
      ORDER BY ExamDate DESC, ExamID DESC 
      LIMIT 1
    `;
    
    console.log('Executing query:', query);
    console.log('With parameters:', [userId]);
    
    const [rows] = await connection.query(query, [userId]);
    
    console.log('Query result rows:', rows);
    
    if (rows.length > 0) {
      console.log('Found exam data:', rows[0]);
      res.json(rows[0]);
    } else {
      console.log('No exam found for user:', userId);
      res.json(null);
    }
    
  } catch (err) {
    console.error("Error in getLastExam:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Server error" });
    }
  } finally {
    if (connection && typeof connection.release === 'function') {
      connection.release();
    }
  }
};

// Get exam results for a specific student
exports.getStudentExamResults = async (req, res) => {
  const { studentId } = req.params;
  let connection;
  
  try {
    connection = await db.getConnection();
    
    // Get all exam results for the student from the new exam table
    const [rows] = await connection.query(`
      SELECT 
        ExamID,
        UserID,
        ExamDate,
        Grade
      FROM exam 
      WHERE UserID = ? 
      ORDER BY ExamDate DESC, ExamID DESC
      LIMIT 50
    `, [studentId]);
    
    res.json(rows);
  } catch (err) {
    console.error("Error in getStudentExamResults:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Server error" });
    }
  } finally {
    if (connection && typeof connection.release === 'function') {
      connection.release();
    }
  }
};

// Get student exam statistics
exports.getStudentExamStats = async (req, res) => {
  const { studentId } = req.params;
  let connection;
  
  try {
    connection = await db.getConnection();
    
    // Get exam statistics for the student from the new exam table
    const [rows] = await connection.query(`
      SELECT 
        ExamID,
        Grade,
        ExamDate
      FROM exam 
      WHERE UserID = ? 
      ORDER BY ExamDate DESC, ExamID DESC
      LIMIT 10
    `, [studentId]);
    
    // Calculate statistics from the rows
    if (rows.length > 0) {
      const grades = rows.map(row => row.Grade);
      const totalExams = grades.length;
      const averageGrade = grades.reduce((sum, grade) => sum + grade, 0) / totalExams;
      const highestGrade = Math.max(...grades);
      const lowestGrade = Math.min(...grades);
      const passedExams = grades.filter(grade => grade >= 60).length;
      const failedExams = grades.filter(grade => grade < 60).length;
      
      res.json({
        totalExams,
        averageGrade: Math.round(averageGrade * 100) / 100,
        highestGrade,
        lowestGrade,
        passedExams,
        failedExams,
        examHistory: rows
      });
    } else {
      res.json({
        totalExams: 0,
        averageGrade: 0,
        highestGrade: 0,
        lowestGrade: 0,
        passedExams: 0,
        failedExams: 0,
        examHistory: []
      });
    }
    
  } catch (err) {
    console.error("Error in getStudentExamStats:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Server error" });
    }
  } finally {
    if (connection && typeof connection.release === 'function') {
      connection.release();
    }
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
      [latestExamRows] = await connection.query(`
        SELECT 
          ExamID,
          Grade,
          ExamDate
        FROM exam 
        WHERE UserID = ? AND Grade > 0
        ORDER BY ExamDate DESC, ExamID DESC 
        LIMIT 1
      `, [studentId]);
    } catch (examErr) {
      console.log("Exam table query failed:", examErr.message);
    }
    
    // Get overall average from the exam table (only completed exams)
    let overallAvgRows = [{ overallAverage: null }];
    try {
      [overallAvgRows] = await connection.query(`
        SELECT AVG(Grade) as overallAverage, COUNT(*) as totalExams
        FROM exam 
        WHERE UserID = ? AND Grade > 0
      `, [studentId]);
    } catch (avgErr) {
      console.log("Overall average query failed:", avgErr.message);
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
exports.getStudentMetrics = async (req, res) => {
  const { userId } = req.params;
  let connection;
  
  try {
    connection = await db.getConnection();
    
    // Get latest exam
    const [latestExamRows] = await connection.query(`
      SELECT ExamID, Grade, ExamDate
      FROM exam 
      WHERE UserID = ? AND Grade > 0
      ORDER BY ExamDate DESC, ExamID DESC 
      LIMIT 1
    `, [userId]);
    
    // Get exam statistics
    const [statsRows] = await connection.query(`
      SELECT 
        COUNT(*) as totalExams,
        AVG(Grade) as averageGrade,
        MAX(Grade) as highestGrade,
        MIN(Grade) as lowestGrade,
        SUM(CASE WHEN Grade >= 60 THEN 1 ELSE 0 END) as passedExams,
        SUM(CASE WHEN Grade < 60 THEN 1 ELSE 0 END) as failedExams
      FROM exam 
      WHERE UserID = ? AND Grade > 0
    `, [userId]);
    
    // Get recent exam history (last 5 exams)
    const [historyRows] = await connection.query(`
      SELECT ExamID, Grade, ExamDate
      FROM exam 
      WHERE UserID = ? AND Grade > 0
      ORDER BY ExamDate DESC, ExamID DESC 
      LIMIT 5
    `, [userId]);
    
    const metrics = {
      lastExam: latestExamRows.length > 0 ? {
        examId: latestExamRows[0].ExamID,
        date: latestExamRows[0].ExamDate,
        grade: Math.round(latestExamRows[0].Grade)
      } : null,
      statistics: {
        totalExams: statsRows[0].totalExams || 0,
        averageGrade: statsRows[0].averageGrade ? Math.round(statsRows[0].averageGrade * 100) / 100 : 0,
        highestGrade: statsRows[0].highestGrade || 0,
        lowestGrade: statsRows[0].lowestGrade || 0,
        passedExams: statsRows[0].passedExams || 0,
        failedExams: statsRows[0].failedExams || 0
      },
      examHistory: historyRows.map(row => ({
        examId: row.ExamID,
        date: row.ExamDate,
        grade: Math.round(row.Grade)
      }))
    };
    
    console.log(`Metrics for user ${userId}:`, metrics);
    res.json(metrics);
    
  } catch (err) {
    console.error("Error in getStudentMetrics:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Server error", details: err.message });
    }
  } finally {
    if (connection && typeof connection.release === 'function') {
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