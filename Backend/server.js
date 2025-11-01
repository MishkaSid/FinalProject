
// בקובץ זה נמצא השרת הראשי של המערכת
// הקובץ מגדיר את כל הנתיבים והנתבים של ה-API ומאזין על פורט מסוים
// הוא משמש כנקודת הכניסה הראשית לכל הבקשות מהלקוח
// server.js
// שרת ראשי של המערכת: מגדיר CORS, קוקיז, סטטיק, ומחבר את כל הראוטים

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const path = require("path");
const fs = require("fs");
const app = express();
app.get("/__debug/stat", (req, res) => {
  const name = req.query.name || "";
  const abs = path.join(__dirname, "uploads", "exam-questions", name);
  fs.stat(abs, (err, st) => {
    if (err)
      return res.json({ ok: false, exists: false, path: abs, error: err.code });
    res.json({
      ok: true,
      exists: true,
      path: abs,
      size: st.size,
      mtime: st.mtime,
    });
  });
});

app.get("/__debug/ls", (req, res) => {
  const dir = path.join(__dirname, "uploads", "exam-questions");
  fs.readdir(dir, (err, files) => {
    if (err) return res.json({ ok: false, error: err.code, dir });
    res.json({ ok: true, dir, files });
  });
});
// ראוטים כלליים
const generalDataRoutes = require("./routes/generalDataRoutes");
const userRoutes = require("./routes/userRoutes");
const coursesRoutes = require("./routes/coursesRoutes");
const topicRoutes = require("./routes/topicRoutes");
const practiceContentRoutes = require("./routes/practiceContentRoutes");
const practiceDashboardRoutes = require("./routes/practiceDashboardRoutes");
const studentRoutes = require("./routes/studentRoutes");
const authRoutes = require("./auth/auth");
const analyticsRoutes = require("./routes/analyticsRoutes");
const practiceTrackingRoutes = require("./routes/practiceTrackingRoutes");
const examRoutes = require("./routes/examRoutes");

// ראוטים לאדמין
const videosRoutes = require("./routes/admin/videosRoutes");
const examQuestionsRoutes = require("./routes/admin/examQuestionsRoutes");
const practiceExercisesRoutes = require("./routes/admin/practiceExercisesRoutes");

// מידלוורים לאימות
const { authenticateToken, requireAdmin } = require("./middleware/auth");

// CORS - מאפשר חיבור מהפרונט בכתובת 3000 כולל שליחת קוקיז
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// פרסרים
app.use(express.json());
app.use(cookieParser());

// קבצים סטטיים
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ראוטים הדורשים התחברות משתמש
app.use("/api/exams", authenticateToken, examRoutes);                 // נקודת קצה לנבחנים להתחלת מבחן
app.use("/api/student", authenticateToken, studentRoutes);            // דשבורד סטודנט, היסטוריית מבחנים, הגשת מבחן

// ראוטים ציבוריים
app.use("/api/general", generalDataRoutes);
app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes);

// ראוטים הדורשים התחברות משתמש
app.use("/api/courses", authenticateToken, coursesRoutes);
app.use("/api/topics", topicRoutes);
app.use("/api/practice", authenticateToken, practiceContentRoutes);
app.use("/api/practice-dashboard", practiceDashboardRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/practice-tracking", practiceTrackingRoutes);

// ראוטים לאדמין - דרוש JWT תקין ותפקיד מתאים
app.use("/api", authenticateToken, requireAdmin, videosRoutes);
app.use("/api", authenticateToken, requireAdmin, examQuestionsRoutes);
app.use("/api", authenticateToken, requireAdmin, practiceExercisesRoutes);

// הפעלת השרת
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

