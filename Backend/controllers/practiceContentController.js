// בקובץ זה נמצאות פונקציות לניהול תוכן התרגול במערכת
// הקובץ מטפל בהעלאת קבצים, יצירה ועדכון של תרגילים וניהול תוכן התרגול
// הוא מספק פונקציונליות מלאה לפעולות CRUD על תרגילים ותוכן תרגול
//controllers
// practiceContentController.js
const db = require("../dbConnection");
const path = require("path");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || ".jpg").toLowerCase();
    const uniqueId = uuidv4();
    console.log(`${uniqueId}${ext}`)
    cb(null, `${uniqueId}${ext}`);
  },
});

const upload = multer({ storage });

/**
 * @function uploadFile
 * @description Handles file uploads using multer and returns the URL of the uploaded file.
 * This is an array of middleware functions. The first function, `upload.single("file")`,
 * processes a single file upload with the field name "file". The second function
 * is a standard Express route handler that checks if a file was uploaded and,
 * if so, returns the URL to the uploaded file.
 * @type {Array<Function>}
 */
exports.uploadFile = [
  upload.single("file"),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    // Return the URL to the uploaded file
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
  },
];

/**
 * @function getAllExercises
 * @description Fetches all practice exercises from the database.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @returns {void}
 */
exports.getAllExercises = async (req, res) => {
  let connection;
  try {
    connection = await db.getConnection();
    
    // Get user's courseId and role from authenticated user
    const userCourseId = req.user?.courseId || req.user?.CourseID;
    const userRole = req.user?.Role || req.user?.role;
    
    // If user is an Examinee, check if their course is active
    if (userRole === 'Examinee') {
      // If no course assigned, return empty array
      if (!userCourseId) {
        return res.json([]);
      }
      
      const [courseRows] = await connection.query(
        "SELECT Status FROM course WHERE CourseID = ?",
        [userCourseId]
      );
      
      if (courseRows.length === 0 || (courseRows[0].Status && courseRows[0].Status !== 'active')) {
        return res.json([]); // Return empty array for inactive courses
      }
    }
    
    let query = `
      SELECT pe.* 
      FROM practice_exercise pe
      INNER JOIN topic t ON pe.TopicID = t.TopicID
      INNER JOIN course c ON t.CourseID = c.CourseID
    `;
    const params = [];
    
    // If user has a courseId, filter by it
    if (userCourseId) {
      query += " WHERE t.CourseID = ?";
      params.push(userCourseId);
    }
    
    // For Examinees, also filter to only active courses
    if (userRole === 'Examinee') {
      if (userCourseId) {
        query += " AND (c.Status = 'active' OR c.Status IS NULL)";
      } else {
        query += " WHERE (c.Status = 'active' OR c.Status IS NULL)";
      }
    }
    
    const [rows] = await connection.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error("Error in getAllExercises:", err);
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
 * @function getExerciseById
 * @description Fetches a single practice exercise by its ID.
 * @param {object} req - The request object, containing the exercise ID as a parameter.
 * @param {object} res - The response object.
 * @returns {void}
 */
exports.getExerciseById = async (req, res) => {
  const { id } = req.params;
  let connection;
  try {
    connection = await db.getConnection();
    const [rows] = await connection.query("SELECT * FROM practice_exercise WHERE ExerciseID = ?", [id]);
    res.json(rows[0]);
  } catch (err) {
    console.error("Error in getExerciseById:", err);
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
 * @function createExercise
 * @description Creates a new practice exercise in the database.
 * @param {object} req - The request object, containing the exercise data in the body.
 * @param {object} res - The response object.
 * @returns {void}
 */
exports.createExercise = async (req, res) => {
  const { TopicID, ContentType, ContentValue, AnswerOptions, CorrectAnswer } = req.body;
  let connection;
  try {
    connection = await db.getConnection();
    const [result] = await connection.query(
      "INSERT INTO practice_exercise (TopicID, ContentType, ContentValue, AnswerOptions, CorrectAnswer) VALUES (?, ?, ?, ?, ?)",
      [TopicID, ContentType, ContentValue, JSON.stringify(AnswerOptions), CorrectAnswer]
    );
    res.status(201).json({ ExerciseID: result.insertId, TopicID, ContentType, ContentValue, AnswerOptions, CorrectAnswer });
  } catch (err) {
    console.error("Error in createExercise:", err);
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
 * @function updateExercise
 * @description Updates an existing practice exercise in the database.
 * @param {object} req - The request object, containing the exercise ID as a parameter and the updated data in the body.
 * @param {object} res - The response object.
 * @returns {void}
 */
exports.updateExercise = async (req, res) => {
  const { id } = req.params;
  const { TopicID, ContentType, ContentValue, AnswerOptions, CorrectAnswer } = req.body;
  let connection;
  try {
    connection = await db.getConnection();
    await connection.query(
      "UPDATE practice_exercise SET TopicID = ?, ContentType = ?, ContentValue = ?, AnswerOptions = ?, CorrectAnswer = ? WHERE ExerciseID = ?",
      [TopicID, ContentType, ContentValue, JSON.stringify(AnswerOptions), CorrectAnswer, id]
    );
    res.json({ ExerciseID: id, TopicID, ContentType, ContentValue, AnswerOptions, CorrectAnswer });
  } catch (err) {
    console.error("Error in updateExercise:", err);
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
 * @function deleteExercise
 * @description Deletes a practice exercise from the database by its ID.
 * @param {object} req - The request object, containing the exercise ID as a parameter.
 * @param {object} res - The response object.
 * @returns {void}
 */
exports.deleteExercise = async (req, res) => {
  const { id } = req.params;
  let connection;
  try {
    connection = await db.getConnection();
    await connection.query("DELETE FROM practice_exercise WHERE ExerciseID = ?", [id]);
    res.json({ message: `Exercise with ID ${id} deleted` });
  } catch (err) {
    console.error("Error in deleteExercise:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Server error" });
    }
  } finally {
    if (connection) {
      connection.release();
    }
  }
}; 