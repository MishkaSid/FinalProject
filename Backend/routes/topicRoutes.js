// בקובץ זה נמצאים נתיבים לניהול נושאי הלימוד במערכת
// הקובץ מגדיר endpoints לפעולות CRUD על נושאים
// הוא מספק גישה מלאה לניהול נושאי הלימוד עבור המנהלים
//routes
// topicRoutes.js
const express = require('express');
const router = express.Router();
const topicDataController = require('../controllers/topicDataController');
const { authenticateToken } = require('../middleware/auth');

// Route for fetching all topics
router.get('/getTopics', topicDataController.getAllTopics);
// Route for fetching a specific topic by ID
router.get('/getTopic/:id', topicDataController.getTopicById);
// Route for adding a new topic (requires authentication)
router.post('/addTopic', authenticateToken, topicDataController.createTopic);
// Route for updating an existing topic (requires authentication)
router.put('/updateTopic/:id', authenticateToken, topicDataController.updateTopic);
// Route for deleting a topic (requires authentication)
router.delete('/deleteTopic/:id', authenticateToken, topicDataController.deleteTopic);

module.exports = router; 