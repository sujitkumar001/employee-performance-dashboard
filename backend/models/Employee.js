const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  department: {
    type: String,
    required: [true, 'Please add a department'],
    enum: ['Engineering', 'Design', 'Product', 'Marketing', 'Sales', 'HR', 'General'],
    default: 'General'
  },
  designation: {
    type: String,
    required: [true, 'Please add a designation'],
    default: 'Employee'
  },
  status: {
    type: String,
    enum: ['Active', 'On Leave', 'Terminated'],
    default: 'Active'
  },
  joinDate: {
    type: Date,
    default: Date.now
  },
  salary: {
    type: Number,
    required: false
  },
  skills: [{
    type: String
  }],
  performanceRating: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Employee', employeeSchema);