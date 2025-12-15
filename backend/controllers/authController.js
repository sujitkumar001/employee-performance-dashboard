const asyncHandler = require('express-async-handler');
const User = require('../models/User');



const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create({
    name,
    email,
    password,
    role
  });

  if (user) {
    res.status(201).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token: user.getSignedJwtToken(),
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});



const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide an email and password');
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  res.status(200).json({
    success: true,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token: user.getSignedJwtToken(),
  });
});




const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({ success: true, user });
});



const updateDetails = asyncHandler(async (req, res) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email
  };
  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });
  res.status(200).json({ success: true, user });
});



const updatePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('+password');
  if (!(await user.matchPassword(req.body.currentPassword))) {
    res.status(401);
    throw new Error('Password is incorrect');
  }
  user.password = req.body.newPassword;
  await user.save();
  res.status(200).json({ success: true, token: user.getSignedJwtToken() });
});

module.exports = {
  register,
  login,
  getMe,
  updateDetails,
  updatePassword
};