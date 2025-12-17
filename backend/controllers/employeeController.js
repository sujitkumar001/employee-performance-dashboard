const asyncHandler = require('express-async-handler');
const Employee = require('../models/Employee');
const User = require('../models/User');

// ==========================================
// GET ALL EMPLOYEES
// ==========================================
const getEmployees = asyncHandler(async (req, res) => {
  const employees = await Employee.find({})
    .populate('user', '-password')
    .populate('reportsTo', 'name email role');

  const validEmployees = employees.filter(emp => emp.user !== null);
  res.status(200).json(validEmployees);
});

// ==========================================
// CREATE EMPLOYEE (Restricted to Admin/Manager)
// ==========================================
const createEmployee = asyncHandler(async (req, res) => {
  const { name, email, password, role, department, designation, reportsTo } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  // Create User with the role specified by the Admin (employee or manager)
  const user = await User.create({
    name,
    email,
    password: password || '123456', 
    role: role || 'employee',
    department: department || 'General',  
    designation: designation || 'Employee' 
  });

  if (user) {
    const validManager = (reportsTo && reportsTo !== "") ? reportsTo : null;

    await Employee.create({
      user: user._id,
      reportsTo: validManager, 
      department: department || 'General',
      designation: designation || 'Employee',
      status: 'Active',
    });

    res.status(201).json({ _id: user._id, user: user });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
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
  getEmployeeById: asyncHandler(async (req, res) => {
    const employee = await Employee.findById(req.params.id).populate('user', 'name email role').populate('reportsTo', 'name');
    if (employee) res.status(200).json(employee);
    else { res.status(404); throw new Error('Employee not found'); }
  }),
  createEmployee,
  updateEmployee: asyncHandler(async (req, res) => {
    const employee = await Employee.findById(req.params.id);
    if (!employee) { res.status(404); throw new Error('Employee not found'); }
    const { name, email, role } = req.body;
    if (name || email || role) {
      await User.findByIdAndUpdate(employee.user, { name, email, role });
    }
    const updated = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('user', '-password');
    res.status(200).json(updated);
  }),
  deleteEmployee: asyncHandler(async (req, res) => {
    const employee = await Employee.findById(req.params.id);
    if (!employee) { res.status(404); throw new Error('Employee not found'); }
    await User.findByIdAndDelete(employee.user);
    await employee.deleteOne();
    res.status(200).json({ message: 'Removed' });
  }),
  getEmployeeStats
};