// Backend/routes/examRoutes.js
const express = require("express");
const router = express.Router();
const examController = require("../controllers/examController");

// התחלת מבחן לנבחן מחזירה סט של שאלות רנדומליות לפי נושא
router.post("/start", examController.startExam);

module.exports = router;
