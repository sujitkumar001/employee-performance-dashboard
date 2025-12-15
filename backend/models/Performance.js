const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  comment: String,
  rating: Number,
  createdAt: { type: Date, default: Date.now }
});

const performanceSchema = new mongoose.Schema({
  employee: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Employee', 
    required: true 
  },
  reviewer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }, 
  reviewPeriod: { 
    type: String, 
    required: true 
  },
  goals: [{
    title: String,
    status: { type: String, default: 'Not Started' },
    description: String
  }],
  feedback: [feedbackSchema], 
  overallRating: { 
    type: Number, 
    default: 0 
  },
  status: {
    type: String,
    
    enum: ['Draft', 'Pending', 'In Progress', 'Submitted', 'Completed'], 
    default: 'Draft'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Performance', performanceSchema);