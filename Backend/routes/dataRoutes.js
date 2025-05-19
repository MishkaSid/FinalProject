const express = require('express');
const router = express.Router();
const generalDataController = require('../controllers/generalDataController');
const specificDataController = require('../controllers/specificUserDataController');

/*  general data routes  */


// Route for fetching all users
router.get('/users',generalDataController.getUsers);

// Route for fetching all admins
router.get('/admins',generalDataController.getAdmins);

// Route for fetching all teachers
router.get('/teachers',generalDataController.getTeachers);

// Route for fetching all examinees
router.get('/examinees',generalDataController.getExaminees);

// Route for fetching practice data
router.get('/practice', generalDataController.getPracticeData);

// Route for fetching exam data
router.get('/exams',generalDataController.getExamData);

// Route for fetching all videos
router.get('/videos',generalDataController.getVideos);


/* specific data routes */

// Route for fetching specific user data
router.get('/user/:id', specificDataController.getSpecificUser);

// Route for fetching specific examinee data
router.get('/examinee/:id', specificDataController.getSpecificExaminee);

// Route for fetching specific teacher data
router.get('/teacher/:id', specificDataController.getSpecificTeacher);

// Route for fetching specific admin data
router.get('/admin/:id', specificDataController.getSpecificAdmin);






module.exports = router;