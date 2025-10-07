// בקובץ זה נמצא השרת הראשי של המערכת
// הקובץ מגדיר את כל הנתיבים והנתבים של ה-API ומאזין על פורט מסוים
// הוא משמש כנקודת הכניסה הראשית לכל הבקשות מהלקוח
// server.js
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const path = require("path");
const app = express();

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

// Admin routes
const videosRoutes = require("./routes/admin/videosRoutes");
const examQuestionsRoutes = require("./routes/admin/examQuestionsRoutes");
const practiceExercisesRoutes = require("./routes/admin/practiceExercisesRoutes");

// Auth middleware
const { authenticateToken, requireAdmin } = require("./middleware/auth");

// CORS - מאפשר חיבור מהפרונט ב-3000 עם קוקיות
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// JSON parser
app.use(express.json());
app.use(cookieParser());  

// Static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Public routes
app.use("/api/general", generalDataRoutes);
app.use("/api/user", userRoutes);
app.use("/api/courses", coursesRoutes);
app.use("/api/topics", topicRoutes);
app.use("/api/practice", practiceContentRoutes);
app.use("/api/practice-dashboard", practiceDashboardRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/practice-tracking", practiceTrackingRoutes);

// Admin routes - מוגנים
app.use("/api", authenticateToken, requireAdmin, videosRoutes);
app.use("/api", authenticateToken, requireAdmin, examQuestionsRoutes);
app.use("/api", authenticateToken, requireAdmin, practiceExercisesRoutes);


// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
