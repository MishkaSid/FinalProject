// בקובץ זה נמצאים נתיבים לניהול נושאי הלימוד במערכת
// הקובץ מגדיר endpoints לפעולות CRUD על נושאים
// הוא מספק גישה מלאה לניהול נושאי הלימוד עבור המנהלים
//routes
// topicRoutes.js
const express = require('express');
const router = express.Router();
const topicDataController = require('../controllers/topicDataController');

// Route for fetching all topics
router.get('/getTopics', topicDataController.getAllTopics);
// Route for fetching a specific topic by ID
router.get('/getTopic/:id', topicDataController.getTopicById);
// Route for adding a new topic
router.post('/addTopic', topicDataController.createTopic);
// Route for updating an existing topic
router.put('/updateTopic/:id', topicDataController.updateTopic);
// Route for deleting a topic
router.delete('/deleteTopic/:id', topicDataController.deleteTopic);

module.exports = router; 