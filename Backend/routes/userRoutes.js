const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Route for adding a new user
router.post('/addUser', userController.createUser);
// Route for updating a user
router.put('/updateUser/:id', userController.updateUser);
// Route for deleting a user
router.delete('/deleteUser/:id', userController.deleteUser);

module.exports = router; 