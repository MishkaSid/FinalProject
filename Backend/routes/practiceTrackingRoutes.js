const express = require("express");
const router = express.Router();
const practiceTrackingController = require("../controllers/practiceTrackingController");

// Practice tracking endpoints
router.post("/attempt", practiceTrackingController.recordPracticeAttempt);
router.post("/video-watch", practiceTrackingController.recordVideoWatch);

module.exports = router;
