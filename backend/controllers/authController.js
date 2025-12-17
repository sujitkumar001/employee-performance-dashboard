const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// @desc    Check if at least one Admin exists
// @route   GET /api/auth/check-admin
// @access  Public
const checkAdminStatus = asyncHandler(async (req, res) => {
  const adminExists = await User.findOne({ role: 'admin' });
  res.status(200).json({ adminExists: !!adminExists });
});

// @desc    Register a user (Only allowed if no Admin exists)
const register = asyncHandler(async (req, res) => {
  const { name, email, password, department, designation } = req.body;
  const adminExists = await User.findOne({ role: 'admin' });

  if (adminExists) {
    res.status(403);
    throw new Error('An administrator already exists. Public registration is closed.');
  }

  const user = await User.create({
    name,
    email,
    password,
    role: 'admin', // Force first user to be admin
    department: department || 'Administration',
    designation: designation || 'System Administrator'
  });

  if (user) {
    res.status(201).json({
      success: true,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
      token: user.getSignedJwtToken(),
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Login user
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide an email and password');
  }
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid credentials');
  }
  res.status(200).json({
    success: true,
    user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    token: user.getSignedJwtToken(),
  });
});

// @desc    Get current logged in user
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({ success: true, user });
});

module.exports = {
  checkAdminStatus,
  register,
  login,
  getMe,
  updateDetails: asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(req.user.id, req.body, { new: true, runValidators: true });
    res.status(200).json({ success: true, user });
  }),
  updatePassword: asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id).select('+password');
    if (!(await user.matchPassword(req.body.currentPassword))) {
      res.status(401);
      throw new Error('Password is incorrect');
    }
    user.password = req.body.newPassword;
    await user.save();
    res.status(200).json({ success: true, token: user.getSignedJwtToken() });
  })
};