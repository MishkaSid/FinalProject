// בקובץ זה נמצאים הנתיבים לטיפול בקורסים במערכת
// הקובץ מגדיר את כל ה-endpoints עבור פעולות CRUD על קורסים
// הוא מחבר בין הבקשות HTTP לפונקציות המתאימות בקונטרולר
//routes
// coursesRoutes.js
const express = require('express');
const router = express.Router();
const coursesDataController = require('../controllers/coursesDataController');

// Route for fetching all courses
router.get('/getCourses', coursesDataController.getAllCourses);
// Route for fetching a specific course by ID
router.get('/getCourse/:id', coursesDataController.getCourseById);
// Route for adding a new course
router.post('/addCourse', coursesDataController.createCourse);
// Route for updating an existing course
router.put('/updateCourse/:id', coursesDataController.updateCourse);
// Route for deleting a course
router.delete('/deleteCourse/:id', coursesDataController.deleteCourse);

module.exports = router; 