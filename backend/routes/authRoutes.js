const express = require('express');
const router = express.Router();
const {
  login,
  getMe,
  updateDetails,
  updatePassword,
  register
} = require('../controllers/authController');

// ✅ FIXED: Changed '../middleware/authMiddleware' to '../middleware/auth'
const { protect } = require('../middleware/auth');

// Public Routes
router.post('/register', register); // Note: Register route is protected
router.post('/login', login);

// Note: Register route is removed for security.
// Only Admins can add users via the 'Employee' tab.

// Protected Routes
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);

module.exports = router;