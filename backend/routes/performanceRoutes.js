const express = require('express');
const router = express.Router();
const {
  getAllPerformanceReviews, 
  getEmployeeReviews,
  createReview,
  addFeedback
} = require('../controllers/performanceController');
const { protect } = require('../middleware/auth');


router.route('/')
  .get(protect, getAllPerformanceReviews)
  .post(protect, createReview);


router.get('/employee/:id', protect, getEmployeeReviews);
router.post('/:id/feedback', protect, addFeedback);

module.exports = router;