const express = require('express');
const router = express.Router();
const {
  login,
  getMe,
  updateDetails,
  updatePassword,
  register,
  checkAdminStatus
} = require('../controllers/authController');

const { protect } = require('../middleware/auth');

// Public Routes
router.get('/check-admin', checkAdminStatus); // Used by login page to show/hide register button
router.post('/register', register); 
router.post('/login', login);

// Protected Routes
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);

module.exports = router;