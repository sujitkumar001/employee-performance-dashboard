const express = require('express');
const router = express.Router();
const {
  getEmployees,
  getEmployeeById,
  createEmployee, 
  updateEmployee,
  deleteEmployee,
  getEmployeeStats
} = require('../controllers/employeeController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, getEmployees)
  .post(protect, authorize('admin', 'manager'), createEmployee); 

router.route('/stats')
  .get(protect, getEmployeeStats);

router.route('/:id')
  .get(protect, getEmployeeById)
  .put(protect, authorize('admin', 'manager'), updateEmployee)
  .delete(protect, authorize('admin'), deleteEmployee);

module.exports = router;