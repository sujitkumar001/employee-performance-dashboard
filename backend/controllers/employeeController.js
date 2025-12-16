const asyncHandler = require('express-async-handler');
const Employee = require('../models/Employee');
const User = require('../models/User');

// ==========================================
// GET ALL EMPLOYEES
// ==========================================
const getEmployees = asyncHandler(async (req, res) => {
  const employees = await Employee.find({})
    .populate('user', '-password') // Get user details
    .populate('reportsTo', 'name email role'); // Get manager details

  // Filter out any broken records where the user was deleted
  const validEmployees = employees.filter(emp => emp.user !== null);

  res.status(200).json(validEmployees);
});

// ==========================================
// GET SINGLE EMPLOYEE
// ==========================================
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

// ==========================================
// CREATE EMPLOYEE
// ==========================================
const createEmployee = asyncHandler(async (req, res) => {
  const { name, email, password, role, department, designation, phone, location, reportsTo } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  // 1. Create User
  const user = await User.create({
    name,
    email,
    password: password || '123456', 
    role: role || 'employee',
    department: department || 'General',  
    designation: designation || 'Employee' 
  });

  if (user) {
    // 2. Create Employee Profile
    const validManager = (reportsTo && reportsTo !== "") ? reportsTo : null;

    await Employee.create({
      user: user._id,
      reportsTo: validManager, 
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

// ==========================================
// UPDATE EMPLOYEE (Now Updates Name & Email too!)
// ==========================================
const updateEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.params.id);

  if (!employee) {
    res.status(404);
    throw new Error('Employee not found');
  }

  // 1. Update the USER info (Name, Email, Role)
  const { name, email, role } = req.body;
  if (name || email || role) {
    const userUpdate = {};
    if (name) userUpdate.name = name;
    if (email) userUpdate.email = email;
    if (role) userUpdate.role = role;

    // Update the linked User document
    await User.findByIdAndUpdate(employee.user, userUpdate);
  }
  
  // 2. Update the EMPLOYEE info (Department, Designation, Manager)
  if (req.body.reportsTo === "") {
    req.body.reportsTo = null;
  }

  const updated = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .populate('user', '-password')
    .populate('reportsTo', 'name email');

  res.status(200).json(updated);
});

// ==========================================
// DELETE EMPLOYEE
// ==========================================
const deleteEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.params.id);
  
  if (!employee) {
    res.status(404);
    throw new Error('Employee not found');
  }

  // Delete the associated User account too
  if (employee.user) {
    await User.findByIdAndDelete(employee.user);
  }

  await employee.deleteOne();
  res.status(200).json({ id: req.params.id, message: 'Removed' });
});

// ==========================================
// GET STATS
// ==========================================
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