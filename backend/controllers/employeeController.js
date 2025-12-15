const asyncHandler = require('express-async-handler');
const Employee = require('../models/Employee');
const User = require('../models/User');


const getEmployees = asyncHandler(async (req, res) => {
  
  
  const users = await User.find({ 
    role: { $in: ['employee', 'manager'] } 
  }).select('-password');

  
  
  const formattedEmployees = users.map(user => ({
    _id: user._id, 
    user: user, 
    department: user.department || 'General',
    designation: user.designation || 'Staff',
    reportsTo: null
  }));

  res.status(200).json(formattedEmployees);
});



const getEmployeeById = asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.params.id)
    .populate('user', 'name email role avatar')
    .populate('reportsTo', 'name email');

  if (employee) {
    res.status(200).json(employee);
  } else {
    res.status(404);
    throw new Error('Employee not found');
  }
});



const createEmployee = asyncHandler(async (req, res) => {
  const { name, email, password, role, department, designation, phone, location, reportsTo } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create({
    name,
    email,
    password: password || '123456', 
    role: role || 'employee',
    department: department || 'General',  
    designation: designation || 'Employee' 
  });

  if (user) {
    

    await Employee.create({
      user: user._id,
      reportsTo: reportsTo || null,
      department: department || 'General',
      designation: designation || 'Employee',
      status: 'Active',
    });

    res.status(201).json({
      _id: user._id,
      user: user
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});



const updateEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.params.id);
  if (!employee) return res.status(404).throw(new Error('Not found'));
  
  const updated = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.status(200).json(updated);
});



const deleteEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.params.id);
  if (!employee) {
    res.status(404);
    throw new Error('Employee not found');
  }
  if (employee.user) await User.findByIdAndDelete(employee.user);
  await employee.deleteOne();
  res.status(200).json({ id: req.params.id, message: 'Removed' });
});

const getEmployeeStats = asyncHandler(async (req, res) => {
  const total = await User.countDocuments({ role: { $in: ['employee', 'manager'] } });
  res.status(200).json({ total, active: total, departments: [] });
});

module.exports = {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeStats
};