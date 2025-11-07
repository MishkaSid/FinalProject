// Backend/controllers/userController.js
const ExcelJS = require("exceljs");
const db = require("../dbConnection");
const bcrypt = require("bcrypt");
const { sendInvitation } = require("../utils/mailer");
const { generatePdfReportv2 } = require("../utils/pdfUtils");

// helpers
const digitsOnly = (val) => String(val || "").replace(/\D/g, "");

// Israeli ID checksum validation:
// 1) pad to 9 with leading zeros
// 2) multiply digits alternately by 1 and 2, sum digits of products (if > 9 subtract 9)
// 3) sum % 10 === 0
const padToNine = (id) => id.padStart(9, "0");
const isValidIsraeliID = (raw) => {
  const id = padToNine(digitsOnly(raw));
  if (!/^\d{9}$/.test(id)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    let inc = Number(id[i]) * ((i % 2) + 1);
    if (inc > 9) inc -= 9;
    sum += inc;
  }
  return sum % 10 === 0;
};

// ===== CRUD =====

exports.getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const connection = await db.getConnection();
    const [rows] = await connection.query(
      "SELECT * FROM users WHERE UserID = ?",
      [id]
    );
    connection.release();
    res.json(rows[0]);
  } catch (err) {
    console.error("Error in getUserById:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.createUser = async (req, res) => {
  let { UserID, Name, Email, Password, Role, CourseID, expired_date } = req.body;

  // require exactly 9 digits and valid checksum on direct create
  const idDigits = digitsOnly(UserID);
  const idFinal = padToNine(idDigits);
  if (!/^\d{9}$/.test(idFinal) || !isValidIsraeliID(idFinal)) {
    return res
      .status(400)
      .json({ error: "תז חייבת להיות בת 9 ספרות עם ספרת ביקורת תקפה" });
  }

  if (Role === "Examinee") {
    Password = idFinal;
  }
  Password = String(Password || "").trim();
  const hashedPassword = await bcrypt.hash(Password, 10);

  try {
    const connection = await db.getConnection();

    const [userIdRows] = await connection.query(
      "SELECT 1 FROM users WHERE UserID = ?",
      [idFinal]
    );
    if (userIdRows.length > 0) {
      connection.release();
      return res.status(400).json({ error: "משתמש עם תז זו כבר קיים" });
    }

    const [emailRows] = await connection.query(
      "SELECT 1 FROM users WHERE Email = ?",
      [Email]
    );
    if (emailRows.length > 0) {
      connection.release();
      return res.status(400).json({ error: "אימייל זה כבר קיים" });
    }

    await connection.query(
      "INSERT INTO users (UserID, Name, Email, Password, Role, CourseID, expired_date) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [idFinal, Name, Email, hashedPassword, Role, CourseID, expired_date || null]
    );

    connection.release();

    sendInvitation(Email, Name).catch((err) =>
      console.error("Failed sending email to", Email, err)
    );

    res.status(201).json({ UserID: idFinal, Name, Email, Role, CourseID, expired_date });
  } catch (err) {
    console.error("Error in createUser:", err);
    res.status(500).json({ error: String(err?.message || err) });
  }
};

exports.updateUser = async (req, res) => {
  const { id } = req.params; // old ID
  const { UserID: newId, Name, Email, Role, CourseID, expired_date, Password } = req.body;

  const newIdDigits = digitsOnly(newId);
  const newIdFinal = padToNine(newIdDigits);
  if (!/^\d{9}$/.test(newIdFinal) || !isValidIsraeliID(newIdFinal)) {
    return res
      .status(400)
      .json({ error: "תז חייבת להיות בת 9 ספרות עם ספרת ביקורת תקפה" });
  }

  try {
    const connection = await db.getConnection();

    const [existingUserRows] = await connection.query(
      "SELECT * FROM users WHERE UserID = ?",
      [id]
    );
    if (existingUserRows.length === 0) {
      connection.release();
      return res.status(404).json({ error: "המשתמש לא נמצא" });
    }

    if (String(newIdFinal) !== String(id)) {
      const [idRows] = await connection.query(
        "SELECT 1 FROM users WHERE UserID = ?",
        [newIdFinal]
      );
      if (idRows.length > 0) {
        connection.release();
        return res.status(400).json({ error: "תז זו כבר קיימת" });
      }
    }

    const [emailRows] = await connection.query(
      "SELECT 1 FROM users WHERE Email = ? AND UserID != ?",
      [Email, id]
    );
    if (emailRows.length > 0) {
      connection.release();
      return res.status(400).json({ error: "אימייל זה כבר קיים" });
    }

    // Build dynamic UPDATE query based on whether password is provided
    let updateQuery = "UPDATE users SET UserID = ?, Name = ?, Email = ?, Role = ?, CourseID = ?, expired_date = ?";
    const updateValues = [newIdFinal, Name, Email, Role, CourseID, expired_date || null];

    // If password is provided, hash it and add to update
    if (Password && Password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(String(Password).trim(), 10);
      updateQuery += ", Password = ?";
      updateValues.push(hashedPassword);
    }

    updateQuery += " WHERE UserID = ?";
    updateValues.push(id);

    await connection.query(updateQuery, updateValues);

    connection.release();
    res.json({ UserID: newIdFinal, Name, Email, Role, CourseID, expired_date });
  } catch (err) {
    console.error("Error in updateUser:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const connection = await db.getConnection();
    await connection.query("DELETE FROM users WHERE UserID = ?", [id]);
    connection.release();
    res.json({ message: `User with ID ${id} deleted` });
  } catch (err) {
    console.error("Error in deleteUser:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ===== Bulk upload with checksum and auto leading zero handling =====

exports.bulkUploadUsers = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    // Get courseId from form data (optional)
    const bulkCourseId = req.body.courseId || null;
    console.log(`Bulk upload with courseId: ${bulkCourseId}`);

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);
    const sheet = workbook.worksheets[0];

    const results = {
      added: 0,
      errors: [], // { rowNumber, id, name, email, reasons: [] }
      paddedWarnings: [], // { rowNumber, paddedId, originalId, name, email, note }
    };

    const isValidEmail = (val) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(val || "").trim());

    for (let i = 1; i <= sheet.rowCount; i++) {
      const row = sheet.getRow(i);

      const rawIdCell = row.getCell(1);
      const rawIdVal = rawIdCell.text ?? rawIdCell.value ?? "";
      const email = String( row.getCell(2).text || row.getCell(2).value || "" ).trim();
      const name = String( row.getCell(3).text || row.getCell(3).value || ""   ).trim();


      const idDigits = digitsOnly(rawIdVal);
      const reasons = [];
      let idToUse = "";
      let wasPadded = false;

      // stop early if entire row is empty
      if (!idDigits && !email && !name) break;

      // ID validations and padding
      if (!idDigits) {
        reasons.push("Missing ID");
      } else if (idDigits.length === 9) {
        idToUse = idDigits;
        if (!isValidIsraeliID(idToUse)) {
          reasons.push("Invalid ID checksum");
        }
      } else if (idDigits.length === 8) {
        // auto pad with leading zero and validate checksum
        idToUse = padToNine(idDigits); // adds one 0 at start
        wasPadded = true;
        if (!isValidIsraeliID(idToUse)) {
          reasons.push("Invalid ID checksum after padding");
        }
      } else {
        reasons.push(
          "Invalid ID length (must be 9 digits, or 8 for auto padding)"
        );
      }

      // Name
      if (!name) reasons.push("Missing full name");

      // Email
      if (!email) reasons.push("Missing email");
      else if (!isValidEmail(email)) reasons.push("Invalid email");

      // duplicate checks only if basic validations passed
      try {
        if (reasons.length === 0) {
          const connection = await db.getConnection();

          const [idRows] = await connection.query(
            "SELECT 1 FROM users WHERE UserID = ?",
            [idToUse]
          );
          if (idRows.length) reasons.push("ID already exists");

          const [emailRows] = await connection.query(
            "SELECT 1 FROM users WHERE Email = ?",
            [email]
          );
          if (emailRows.length) reasons.push("Email already exists");

          connection.release();
        }
      } catch (dupErr) {
        reasons.push("Duplicate check failed");
        console.error(`Row ${i} duplicate check error:`, dupErr);
      }

      if (reasons.length > 0) {
        results.errors.push({
          rowNumber: i,
          id: idToUse || idDigits,
          name,
          email,
          reasons,
        });
        continue;
      }

      // insert
      try {
        const connection = await db.getConnection();

        const role = "Examinee";
        // Use the bulk courseId from form data
        const courseId = bulkCourseId || null;
        const rawPassword = String(idToUse);
        const hashedPassword = await bcrypt.hash(rawPassword, 10);

        await connection.query(
          `INSERT INTO users (UserID, Name, Email, Password, Role, CourseID)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [idToUse, name, email, hashedPassword, role, courseId]
        );

        connection.release();

        // email invitation
        sendInvitation(email, name).catch((err) =>
         console.error(`Email error row ${i}:`, err)
        );

        results.added++;

        // record padded info for PDF table 2
        if (wasPadded) {
          results.paddedWarnings.push({
         rowNumber: i,
         paddedId: idToUse,
         originalId: idDigits,
         name,
         email,
         note: "הושלם 0 בתחילת תעודת הזות באופן אוטומטי. אנא אמת מול התלמיד.",
       }
        );
        }
        } catch (insErr) {
        results.errors.push({
          rowNumber: i,
          id: idToUse,
          name,
          email,
          reasons: [insErr.message || "Insert failed"],
        });
        console.error(`Row ${i} insert error:`, insErr);
      }
    }

    const totalCount = sheet.rowCount - 1;

    // Return PDF if there are errors or padded warnings. Otherwise JSON success.
        if (results.errors.length > 0 || results.paddedWarnings.length > 0) {
       try {
        const pdf = await generatePdfReportv2({
         sourceFileName: req.file.originalname,
         errors: results.errors,
         paddedWarnings: results.paddedWarnings,
         addedCount: results.added,
         totalCount,
        }
        )
        ;

        res.setHeader("Content-Type", "application/pdf");
        const asciiName = "upload_report.pdf";
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${asciiName}"`
        );
        return res.status(200).send(pdf);
      } catch (pdfErr) {
        console.error("PDF generation failed. Falling back to JSON:", String(pdfErr?.stack || pdfErr));
        return res.status(200).json({
          added: results.added,
          errors: results.errors,
          paddedWarnings: results.paddedWarnings,
          message: `PDF generated failed. Bulk upload completed. Added ${results.added}. Errors ${results.errors.length}. Padded ${results.paddedWarnings.length}.`,
        });
      }
    }

    return res.status(200).json({
      added: results.added,
      errors: [],
      paddedWarnings: [],
      message: `Bulk upload succeeded. Added ${results.added}.`,
    });
  } catch (err) {
    console.error("bulkUploadUsers error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};
