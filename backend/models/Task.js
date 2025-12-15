const mongoose = require('mongoose');

const taskSchema = mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  status: { 
    type: String, 
    enum: ['Pending', 'In Progress', 'Completed', 'Done'], 
    default: 'Pending' 
  },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  dueDate: { type: Date },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  
  
  comments: [{
    text: String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
  }],
  attachments: [{
    name: String,
    link: String,
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true,
});

module.exports = mongoose.model('Task', taskSchema);