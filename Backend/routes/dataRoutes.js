const express = require('express');
const router = express.Router();
const dataController = require('../controllers/dataController');

// Middleware to handle errors
const asyncHandler = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Route for fetching all users
router.get('/users', asyncHandler(dataController.getUsers));

// Route for fetching practice data
router.get('/practice', asyncHandler(dataController.getPracticeData));

// Route for fetching exam data
router.get('/exams', asyncHandler(dataController.getExamData));

module.exports = router;

