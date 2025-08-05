const db = require("../dbConnection");

// Get practice videos by topic
exports.getPracticeVideos = async (req, res) => {
  const { topicId } = req.params;
  
  try {
    const connection = await db.getConnection();
    
    // Get practice videos for the topic
    const [rows] = await connection.query(`
      SELECT 
        pv.VideoID,
        pv.TopicID,
        pv.VideoTopic,
        t.TopicName
      FROM practice_video pv
      LEFT JOIN topics t ON pv.TopicID = t.TopicID
      WHERE pv.TopicID = ?
      ORDER BY pv.VideoID DESC
    `, [topicId]);
    
    res.json(rows);
  } catch (err) {
    console.error("Error in getPracticeVideos:", err);
    // Return mock data if database fails
    const mockVideos = [
      {
        VideoID: 1,
        TopicID: topicId,
        VideoTopic: "מבוא לאלגברה ליניארית",
        TopicName: "אלגברה ליניארית"
      },
      {
        VideoID: 2,
        TopicID: topicId,
        VideoTopic: "פתרון מערכות משוואות",
        TopicName: "אלגברה ליניארית"
      }
    ];
    res.json(mockVideos);
  }
};

// Get practice exercises by topic
exports.getPracticeExercises = async (req, res) => {
  const { topicId } = req.params;
  
  try {
    const connection = await db.getConnection();
    
    // Get practice exercises for the topic
    const [rows] = await connection.query(`
      SELECT 
        pe.ExerciseID,
        pe.TopicID,
        pe.AnswerOptions,
        pe.CorrectAnswer,
        pe.ContentType,
        pe.ContentValue,
        t.TopicName
      FROM practice_exercise pe
      LEFT JOIN topics t ON pe.TopicID = t.TopicID
      WHERE pe.TopicID = ?
      ORDER BY pe.ExerciseID DESC
      LIMIT 10
    `, [topicId]);
    
    res.json(rows);
  } catch (err) {
    console.error("Error in getPracticeExercises:", err);
    // Return mock data if database fails
    const mockExercises = [
      {
        ExerciseID: 1,
        TopicID: topicId,
        AnswerOptions: JSON.stringify(["א", "ב", "ג", "ד"]),
        CorrectAnswer: "א",
        ContentType: "question",
        ContentValue: "מהו הפתרון של המשוואה 2x + 3 = 7?",
        TopicName: "אלגברה ליניארית"
      },
      {
        ExerciseID: 2,
        TopicID: topicId,
        AnswerOptions: JSON.stringify(["1", "2", "3", "4"]),
        CorrectAnswer: "2",
        ContentType: "question",
        ContentValue: "פתור את המשוואה: x² - 4 = 0",
        TopicName: "אלגברה ליניארית"
      }
    ];
    res.json(mockExercises);
  }
};

// Get topic information
exports.getTopicInfo = async (req, res) => {
  const { topicId } = req.params;
  
  try {
    const connection = await db.getConnection();
    
    // Get topic information
    const [rows] = await connection.query(`
      SELECT 
        t.TopicID,
        t.TopicName,
        c.CourseName
      FROM topics t
      LEFT JOIN courses c ON t.CourseID = c.CourseID
      WHERE t.TopicID = ?
    `, [topicId]);
    
    if (rows.length === 0) {
      // Return mock data if topic not found
      const mockTopic = {
        TopicID: topicId,
        TopicName: "אלגברה ליניארית",
        CourseName: "מתמטיקה"
      };
      res.json(mockTopic);
    } else {
      res.json(rows[0]);
    }
  } catch (err) {
    console.error("Error in getTopicInfo:", err);
    // Return mock data if database fails
    const mockTopic = {
      TopicID: topicId,
      TopicName: "אלגברה ליניארית",
      CourseName: "מתמטיקה"
    };
    res.json(mockTopic);
  }
};

// Get all available topics for subject selection
exports.getAllTopics = async (req, res) => {
  try {
    const connection = await db.getConnection();
    
    // Get all topics with course information
    const [rows] = await connection.query(`
      SELECT 
        t.TopicID,
        t.TopicName,
        c.CourseName
      FROM topics t
      LEFT JOIN courses c ON t.CourseID = c.CourseID
      ORDER BY t.TopicID
    `);
    
    if (rows.length === 0) {
      // Return mock data if no topics found
      const mockTopics = [
        { TopicID: 1, TopicName: "אלגברה ליניארית", CourseName: "מתמטיקה" },
        { TopicID: 2, TopicName: "חשבון דיפרנציאלי", CourseName: "מתמטיקה" },
        { TopicID: 3, TopicName: "גאומטריה", CourseName: "מתמטיקה" },
        { TopicID: 4, TopicName: "סטטיסטיקה", CourseName: "מתמטיקה" },
        { TopicID: 5, TopicName: "טריגונומטריה", CourseName: "מתמטיקה" }
      ];
      res.json(mockTopics);
    } else {
      res.json(rows);
    }
  } catch (err) {
    console.error("Error in getAllTopics:", err);
    // Return mock data if database fails
    const mockTopics = [
      { TopicID: 1, TopicName: "אלגברה ליניארית", CourseName: "מתמטיקה" },
      { TopicID: 2, TopicName: "חשבון דיפרנציאלי", CourseName: "מתמטיקה" },
      { TopicID: 3, TopicName: "גאומטריה", CourseName: "מתמטיקה" },
      { TopicID: 4, TopicName: "סטטיסטיקה", CourseName: "מתמטיקה" },
      { TopicID: 5, TopicName: "טריגונומטריה", CourseName: "מתמטיקה" }
    ];
    res.json(mockTopics);
  }
}; 