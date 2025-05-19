exports.getSpecificUser = async (req, res) => {
  const { id } = req.params;

  try {
    const connection = await db.getConnection();
    const [rows] = await connection.query(
      "SELECT * FROM users WHERE id = ?",
      [id]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error("Error in getSpecificUser:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getSpecificExaminee = async (req, res) => {
  const { id } = req.params;

  try {
    const connection = await db.getConnection();
    const [rows] = await connection.query(
      "SELECT * FROM users WHERE id = ? AND role = 'Examinee'",
      [id]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error("Error in getSpecificExaminee:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getSpecificTeacher = async (req, res) => {
  const { id } = req.params;

  try {
    const connection = await db.getConnection();
    const [rows] = await connection.query(
      "SELECT * FROM users WHERE id = ? AND role = 'Teacher'",
      [id]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error("Error in getSpecificTeacher:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getSpecificAdmin = async (req, res) => {
  const { id } = req.params;

  try {
    const connection = await db.getConnection();
    const [rows] = await connection.query(
      "SELECT * FROM users WHERE id = ? AND role = 'Admin'",
      [id]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error("Error in getSpecificAdmin:", err);
    res.status(500).json({ error: "Server error" });
  }
};
