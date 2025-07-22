const db = require("../dbConnection");

// Fetch all topics
exports.getAllTopics = async (req, res, next) => {
  try {
    const connection = await db.getConnection();
    const [rows] = await connection.query("SELECT * FROM topic");
    res.json(rows);
  } catch (err) {
    console.error("Error in getAllTopics:", err);
    next({ error: "Server error" }, 500);
  }
};

// Fetch a specific topic by ID
exports.getTopicById = async (req, res, next) => {
  const { id } = req.params;

  try {
    const connection = await db.getConnection();
    const [rows] = await connection.query("SELECT * FROM topic WHERE TopicID = ?", [id]);
    res.json(rows[0]);
  } catch (err) {
    console.error("Error in getTopicById:", err);
    next({ error: "Server error" }, 500);
  }
};

// Create a new topic
exports.createTopic = async (req, res, next) => {
  const { TopicName, CourseID } = req.body;

  try {
    const connection = await db.getConnection();
    const [courseRows] = await connection.query(
      "SELECT * FROM course WHERE CourseID = ?",
      [CourseID]
    );
    if (courseRows.length === 0) {
      return next({ error: "Course doesn't exist" }, 400);
    }
    const [result] = await connection.query(
      "INSERT INTO topic (TopicName, CourseID) VALUES (?, ?)",
      [TopicName, CourseID]
    );
    res.json({ TopicID: result.insertId, TopicName, CourseID });
  } catch (err) {
    console.error("Error in createTopic:", err);
    next({ error: "Server error" }, 500);
  }
};

// Update a topic
exports.updateTopic = async (req, res, next) => {
  const { id } = req.params;
  const { TopicName, CourseID } = req.body;

  try {
    const connection = await db.getConnection();
    await connection.query(
      "UPDATE topic SET TopicName = ?, CourseID = ? WHERE TopicID = ?",
      [TopicName, CourseID, id]
    );
    res.json({ TopicID: id, TopicName, CourseID });
  } catch (err) {
    console.error("Error in updateTopic:", err);
    next({ error: "Server error" }, 500);
  }
};

// Delete a topic
exports.deleteTopic = async (req, res, next) => {
  const { id } = req.params;

  try {
    const connection = await db.getConnection();
    await connection.query("DELETE FROM topic WHERE TopicID = ?", [id]);
    res.json({ message: `Topic with TopicID ${id} deleted` });
  } catch (err) {
    console.error("Error in deleteTopic:", err);
    next({ error: "Server error" }, 500);
  }
};

