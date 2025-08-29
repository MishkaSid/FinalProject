const db = require("../dbConnection");

// Get all courses
exports.getAllCourses = async (req, res) => {
  try {
    const connection = await db.getConnection();
    const [rows] = await connection.query("SELECT * FROM course ORDER BY CourseName");
    res.json(rows);
  } catch (err) {
    console.error("Error in getAllCourses:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Get course by ID
exports.getCourseById = async (req, res) => {
  const { id } = req.params;
  try {
    const connection = await db.getConnection();
    const [rows] = await connection.query("SELECT * FROM course WHERE CourseID = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Course not found" });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error("Error in getCourseById:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Get all topics
exports.getAllTopics = async (req, res) => {
  try {
    const connection = await db.getConnection();
    const [rows] = await connection.query(`
      SELECT t.*, c.CourseName 
      FROM topic t 
      LEFT JOIN course c ON t.CourseID = c.CourseID 
      ORDER BY c.CourseName, t.TopicName
    `);
    res.json(rows);
  } catch (err) {
    console.error("Error in getAllTopics:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Get topics by course ID
exports.getTopicsByCourse = async (req, res) => {
  const { courseId } = req.params;
  try {
    const connection = await db.getConnection();
    const [rows] = await connection.query(
      "SELECT * FROM topic WHERE CourseID = ? ORDER BY TopicName",
      [courseId]
    );
    res.json(rows);
  } catch (err) {
    console.error("Error in getTopicsByCourse:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Get topic by ID
exports.getTopicById = async (req, res) => {
  const { id } = req.params;
  try {
    const connection = await db.getConnection();
    const [rows] = await connection.query(`
      SELECT t.*, c.CourseName 
      FROM topic t 
      LEFT JOIN course c ON t.CourseID = c.CourseID 
      WHERE t.TopicID = ?
    `, [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Topic not found" });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error("Error in getTopicById:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Get practice exercises by topic ID
exports.getPracticeExercisesByTopic = async (req, res) => {
  const { topicId } = req.params;
  try {
    const connection = await db.getConnection();
    const [rows] = await connection.query(
      "SELECT * FROM practice_exercise WHERE TopicID = ? ORDER BY ExerciseID",
      [topicId]
    );
    res.json(rows);
  } catch (err) {
    console.error("Error in getPracticeExercisesByTopic:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Get practice videos by topic ID
exports.getPracticeVideosByTopic = async (req, res) => {
  const { topicId } = req.params;
  try {
    const connection = await db.getConnection();
    const [rows] = await connection.query(
      "SELECT * FROM practice_video WHERE TopicID = ? ORDER BY VideoID",
      [topicId]
    );
    res.json(rows);
  } catch (err) {
    console.error("Error in getPracticeVideosByTopic:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Get exam questions by topic ID
exports.getExamQuestionsByTopic = async (req, res) => {
  const { topicId } = req.params;
  try {
    const connection = await db.getConnection();
    const [rows] = await connection.query(
      "SELECT * FROM exam_question WHERE TopicID = ? ORDER BY QuestionID",
      [topicId]
    );
    res.json(rows);
  } catch (err) {
    console.error("Error in getExamQuestionsByTopic:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Get student's exam history
exports.getStudentExamHistory = async (req, res) => {
  const { studentId } = req.params;
  try {
    const connection = await db.getConnection();
    const [rows] = await connection.query(
      "SELECT * FROM exam WHERE UserID = ? ORDER BY ExamDate DESC",
      [studentId]
    );
    res.json(rows);
  } catch (err) {
    console.error("Error in getStudentExamHistory:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Get exam results for a specific exam
exports.getExamResults = async (req, res) => {
  const { examId } = req.params;
  try {
    const connection = await db.getConnection();
    const [rows] = await connection.query(`
      SELECT er.*, eq.QuestionPicURL, eq.AnswerOptions, eq.CorrectAnswer
      FROM exam_result er
      JOIN exam_question eq ON er.QuestionID = eq.QuestionID
      WHERE er.ExamID = ?
    `, [examId]);
    res.json(rows);
  } catch (err) {
    console.error("Error in getExamResults:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Exam submission moved to examResultController.js to avoid conflicts

// Dashboard implementation moved to examResultController.js to avoid conflicts

// Get practice session data
exports.getPracticeSessionData = async (req, res) => {
  const { topicId } = req.params;
  try {
    const connection = await db.getConnection();
    
    // Get topic info
    const [topicRows] = await connection.query(`
      SELECT t.*, c.CourseName
      FROM topic t
      LEFT JOIN course c ON t.CourseID = c.CourseID
      WHERE t.TopicID = ?
    `, [topicId]);
    
    if (topicRows.length === 0) {
      return res.status(404).json({ error: "Topic not found" });
    }
    
    const topic = topicRows[0];
    
    // Get practice exercises
    const [exerciseRows] = await connection.query(
      "SELECT * FROM practice_exercise WHERE TopicID = ? ORDER BY ExerciseID",
      [topicId]
    );
    
    // Get practice videos
    const [videoRows] = await connection.query(
      "SELECT * FROM practice_video WHERE TopicID = ? ORDER BY VideoID",
      [topicId]
    );
    
    const practiceData = {
      topic: {
        id: topic.TopicID,
        name: topic.TopicName,
        courseName: topic.CourseName
      },
      exercises: exerciseRows,
      videos: videoRows
    };
    
    res.json(practiceData);
  } catch (err) {
    console.error("Error in getPracticeSessionData:", err);
    res.status(500).json({ error: "Server error" });
  }
};
