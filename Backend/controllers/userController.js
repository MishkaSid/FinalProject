const ExcelJS = require("exceljs");
const db = require("../dbConnection");
const bcrypt = require("bcrypt");
const { sendInvitation } = require("../utils/mailer");

// Get a user by ID
exports.getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const connection = await db.getConnection();
    const [rows] = await connection.query(
      "SELECT * FROM users WHERE UserID = ?",
      [id]
    );
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

    // send invitation email (fire-and-forget)
    sendInvitation(Email, Name).catch((err) =>
      console.error("Failed sending email to", Email, err)
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
  let connection;

  try {
    connection = await db.getConnection();
    
    // Start a transaction to ensure all deletions succeed or none do
    await connection.beginTransaction();
    
    // First, get all exam IDs for this user
    const [examRows] = await connection.query("SELECT ExamID FROM exam WHERE UserID = ?", [id]);
    console.log(`Found ${examRows.length} exam records for user ${id}`);
    
    // Delete all exam_result records for these exams
    if (examRows.length > 0) {
      const examIds = examRows.map(row => row.ExamID);
      const placeholders = examIds.map(() => '?').join(',');
      const [examResultResult] = await connection.query(`DELETE FROM exam_result WHERE ExamID IN (${placeholders})`, examIds);
      console.log(`Deleted ${examResultResult.affectedRows} exam_result records`);
    }
    
    // Then delete all exam records for this user
    const [examResult] = await connection.query("DELETE FROM exam WHERE UserID = ?", [id]);
    console.log(`Deleted ${examResult.affectedRows} exam records`);
    
    // Finally delete the user
    const [result] = await connection.query("DELETE FROM users WHERE UserID = ?", [id]);
    console.log(`Deleted user with ID ${id}`);
    
    // Check if user was actually deleted
    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ error: "המשתמש לא נמצא" });
    }
    
    // Commit the transaction
    await connection.commit();
    
    res.json({ message: `User with ID ${id} and all related data deleted successfully` });
  } catch (err) {
    console.error("Error in deleteUser:", err);
    
    // Rollback transaction if there was an error
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackErr) {
        console.error("Error rolling back transaction:", rollbackErr);
      }
    }
    
    res.status(500).json({ error: "Server error" });
  } finally {
    if (connection && typeof connection.release === 'function') {
      connection.release();
    }
  }
};

/**
 * Bulk‑upload users from an Excel file.
 * Expects req.file.buffer to be an .xlsx with header row: [id, email, name].
 * Creates each user with Role="Examinee", CourseID=NULL, Password=UserID.
 */
exports.bulkUploadUsers = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded." });
  }

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(req.file.buffer);
  const sheet = workbook.worksheets[0];

  const results = {
    added: 0,
    errors: [],
  };

  // start at row 2 to skip header
  for (let i = 2; i <= sheet.rowCount; i++) {
    const row = sheet.getRow(i);

    const UserID = row.getCell(1).text?.trim();
    const Email = row.getCell(2).text?.trim();
    const Name = row.getCell(3).text?.trim();

    // if the entire row is empty, stop processing further
    if (!UserID && !Email && !Name) break;

    if (!Email || Email.includes("[object")) {
      console.log(`Row ${i} raw value:`, row.getCell(2).value);
    }

    const Role = "Examinee";
    const CourseID = null;
    const rawPassword = UserID;

    if (!UserID || !Email || !Name) {
      results.errors.push({ row: i, message: "Missing id/email/name." });
      continue;
    }

    try {
      const connection = await db.getConnection();

      // duplicate ID?
      const [idRows] = await connection.query(
        "SELECT 1 FROM users WHERE UserID = ?",
        [UserID]
      );
     
      if (idRows.length) {
        results.warnings = results.warnings || [];
        results.warnings.push({ row: i, message: "Skipped duplicate UserID." });
        continue;
      }

      // duplicate Email?
      const [emailRows] = await connection.query(
        "SELECT 1 FROM users WHERE Email = ?",
        [Email]
      );
      if (emailRows.length) {
        throw new Error("Email already exists");
      }

      // hash password = UserID
      const hashedPassword = await bcrypt.hash(rawPassword, 10);

      // insert
      await connection.query(
        `INSERT INTO users
         (UserID, Name, Email, Password, Role, CourseID)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [UserID, Name, Email, hashedPassword, Role, CourseID]
      );

      // send welcome email
      sendInvitation(Email, Name).catch((err) =>
        console.error(`Email error row ${i}:`, err)
      );

      results.added++;
    } catch (err) {
      results.errors.push({ row: i, message: err.message });
      console.error(`Row ${i} failed:`, err);
    }
  }

  res.json({
    added: results.added,
    errors: results.errors,
    warnings: results.warnings || [],
    // optional: a combined message string if you still want it
    message:
      `Bulk upload complete: ${results.added} added, ` +
      `${(results.warnings || []).length} skipped, ` +
      `${results.errors.length} errors.`,
  });
};
