const asyncHandler = require('express-async-handler');
const Performance = require('../models/Performance');
const Employee = require('../models/Employee');
const User = require('../models/User'); 


const getAllPerformanceReviews = asyncHandler(async (req, res) => {
  let reviews;

  if (req.user.role === 'employee') {
    const employeeProfile = await Employee.findOne({ user: req.user._id });
    if (!employeeProfile) return res.status(200).json([]);

    reviews = await Performance.find({ employee: employeeProfile._id })
      .populate({
        path: 'employee',
        populate: { path: 'user', select: 'name email avatar' }
      })
      .sort({ createdAt: -1 });
  } else {
    reviews = await Performance.find()
      .populate({
        path: 'employee',
        populate: { path: 'user', select: 'name email avatar' }
      })
      .sort({ createdAt: -1 });
  }

  res.status(200).json(reviews);
});


const getEmployeeReviews = asyncHandler(async (req, res) => {
  const reviews = await Performance.find({ employee: req.params.id })
    .sort({ createdAt: -1 });
  res.status(200).json(reviews);
});


const createReview = asyncHandler(async (req, res) => {
 
  if (req.user.role !== 'admin' && req.user.role !== 'manager') {
    res.status(403);
    throw new Error('Not authorized to create reviews');
  }

  
  const { employeeId, reviewPeriod, goals, rating, status, feedback } = req.body;

  if (!employeeId) {
    res.status(400);
    throw new Error('Employee ID is required');
  }

 
  console.log(`[Create Review] Processing ID: ${employeeId}`);

  
  let employee = await Employee.findById(employeeId);


  if (!employee) {
     console.log(`[Create Review] ID is not an Employee ID. Checking User ID...`);
     employee = await Employee.findOne({ user: employeeId });
  }

  
  if (!employee) {
     console.log(`[Create Review] Profile missing. Checking if User exists to auto-create profile...`);
     const userExists = await User.findById(employeeId);
     
     if (userExists) {
         console.log(`[Create Review] User found! Creating default Employee profile...`);
         
         employee = await Employee.create({
             user: userExists._id,
             department: 'General',   
             designation: 'Staff',    
             phone: '',
             location: 'Remote'
         });
     } else {
         
      
         res.status(404);
         throw new Error('User not found in database. Cannot create review.');
     }
  }

  
  
  const initialFeedback = feedback ? [{
      reviewer: req.user._id,
      comment: feedback,
      rating: Number(rating) || 0
  }] : [];

  const review = await Performance.create({
    employee: employee._id, 
    reviewer: req.user._id,
    reviewPeriod,
    goals: goals || [],
    
    
    
    status: status || 'Pending',
    overallRating: Number(rating) || 0,
    feedback: initialFeedback
  });

  
  
  const populatedReview = await Performance.findById(review._id)
    .populate({
      path: 'employee',
      populate: { path: 'user', select: 'name' }
    });

  res.status(201).json(populatedReview);
});



const addFeedback = asyncHandler(async (req, res) => {
  const review = await Performance.findById(req.params.id);
  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  const newFeedback = {
    reviewer: req.user._id,
    comment: req.body.comment,
    rating: Number(req.body.rating)
  };

  review.feedback.push(newFeedback);

  const totalRating = review.feedback.reduce((acc, item) => acc + item.rating, 0);
  review.overallRating = (totalRating / review.feedback.length).toFixed(1);

  await review.save();
  res.status(200).json(review);
});

module.exports = {
  getAllPerformanceReviews,
  getEmployeeReviews,
  createReview,
  addFeedback
};