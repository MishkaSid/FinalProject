const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const upload = require('../middleware/upload');


// Route for adding a new user
router.post('/addUser', userController.createUser);

// Route for bulk‑uploading users from Excel
// POST /api/user/upload
// field name: file (an .xlsx with columns: id, email, name)
router.post(
  '/upload',
  upload.single('file'),
  userController.bulkUploadUsers
);

// Route for updating a user
router.put('/updateUser/:id', userController.updateUser);
// Route for deleting a user
router.delete('/deleteUser/:id', userController.deleteUser);

module.exports = router; 