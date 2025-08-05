//Michael sidoruk, Nadav sayag class 49/1
const express = require("express");
const cors = require("cors");
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

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/general", generalDataRoutes);
app.use("/api/user", userRoutes);
app.use("/api/courses", coursesRoutes);
app.use("/api/topics", topicRoutes);
app.use("/api/practice", practiceContentRoutes);
app.use("/api/practice-dashboard", practiceDashboardRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/auth", authRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

