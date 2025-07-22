const db = require("../dbConnection");
const bcrypt = require("bcrypt");

// Get a user by ID
exports.getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const connection = await db.getConnection();
    const [rows] = await connection.query("SELECT * FROM users WHERE UserID = ?", [id]);
    res.json(rows[0]);
  } catch (err) {
    console.error("Error in getUserById:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Create a new user
exports.createUser = async (req, res) => {
  let { UserID, Name, Email, Password, Role, CourseID } = req.body;

  if (Role === "Examinee") {
    Password = UserID.toString();
  }
  Password = Password.toString().trim();
  const hashedPassword = await bcrypt.hash(Password, 10);

  try {
    const connection = await db.getConnection();
    // Check for existing UserID
    const [userIdRows] = await connection.query(
      "SELECT * FROM users WHERE UserID = ?",
      [UserID]
    );
    if (userIdRows.length > 0) {
      return res.status(400).json({ error: "משתמש זה כבר קיים" });
    }
    // Check for existing Email
    const [emailRows] = await connection.query(
      "SELECT * FROM users WHERE Email = ?",
      [Email]
    );
    if (emailRows.length > 0) {
      return res.status(400).json({ error: "אימייל זה כבר קיים" });
    }
    const [result] = await connection.query(
      "INSERT INTO users (UserID, Name, Email, Password, Role, CourseID) VALUES (?, ?, ?, ?, ?, ?)",
      [UserID, Name, Email, hashedPassword, Role, CourseID]
    );

    res.status(201).json({ UserID, Name, Email, Role, CourseID });
  } catch (err) {
    console.error("Error in createUser:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Update a user
exports.updateUser = async (req, res) => {
  const { id } = req.params; // old ID
  const { UserID: newId, Name, Email, Role } = req.body;

  try {
    const connection = await db.getConnection();

    // First: get the current user by original ID
    const [existingUserRows] = await connection.query(
      "SELECT * FROM users WHERE UserID = ?",
      [id]
    );

    if (existingUserRows.length === 0) {
      return res.status(404).json({ error: "המשתמש לא נמצא" });
    }

    // 1. Check for duplicate ID (if changed)
    if (String(newId) !== String(id)) {
      const [idRows] = await connection.query(
        "SELECT * FROM users WHERE UserID = ?",
        [newId]
      );
      if (idRows.length > 0) {
        return res.status(400).json({ error: "תעודת זהות זו כבר קיימת" });
      }
    }

    // 2. Check for duplicate Email (if changed)
    const [emailRows] = await connection.query(
      "SELECT * FROM users WHERE Email = ? AND UserID != ?",
      [Email, id]
    );
    if (emailRows.length > 0) {
      return res.status(400).json({ error: "אימייל זה כבר קיים" });
    }

    // Update the user (including UserID if changed)
    await connection.query(
      "UPDATE users SET UserID = ?, Name = ?, Email = ?, Role = ? WHERE UserID = ?",
      [newId, Name, Email, Role, id]
    );

    res.json({ UserID: newId, Name, Email, Role });

  } catch (err) {
    console.error("Error in updateUser:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Delete a user
exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const connection = await db.getConnection();
    await connection.query("DELETE FROM users WHERE UserID = ?", [id]);
    res.json({ message: `User with ID ${id} deleted` });
  } catch (err) {
    console.error("Error in deleteUser:", err);
    res.status(500).json({ error: "Server error" });
  }
};
