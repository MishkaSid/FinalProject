// בקובץ זה נמצאים נתיבים לניהול תוכן התרגול במערכת
// הקובץ מגדיר endpoints לפעולות CRUD על תרגילים והעלאת קבצים
// הוא מספק גישה מלאה לניהול תוכן התרגול עבור המנהלים
//routes
// practiceContentRoutes.js
const express = require('express');
const router = express.Router();
const practiceContentController = require('../controllers/practiceContentController');

// Route for fetching all practice exercises
router.get('/practiceExercises', practiceContentController.getAllExercises);
// Route for fetching a single practice exercise by ID
router.get('/practiceExercise/:id', practiceContentController.getExerciseById);
// Route for creating a new practice exercise
router.post('/practiceExercise', practiceContentController.createExercise);
// Route for updating an existing practice exercise
router.put('/practiceExercise/:id', practiceContentController.updateExercise);
// Route for deleting a practice exercise
router.delete('/practiceExercise/:id', practiceContentController.deleteExercise);
// Route for uploading a file for a practice exercise
router.post('/practiceExercise/upload', practiceContentController.uploadFile);

module.exports = router; 