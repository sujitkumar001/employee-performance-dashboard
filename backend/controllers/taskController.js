const asyncHandler = require('express-async-handler');
const Task = require('../models/Task');


const getTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.find()
    .populate('assignedTo', 'name email')
    .populate('project', 'name')
    .populate('comments.user', 'name') 
    .sort({ createdAt: -1 });
  res.status(200).json(tasks);
});


const createTask = asyncHandler(async (req, res) => {
  const { name, description, projectId, assignedTo, priority, status, dueDate } = req.body;
  
  const task = await Task.create({
    name, description, project: projectId, assignedTo, priority, status, dueDate
  });

  
  const populatedTask = await Task.findById(task._id)
    .populate('assignedTo', 'name email')
    .populate('project', 'name');

  res.status(201).json(populatedTask);
});


const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) { res.status(404); throw new Error('Task not found'); }
  
  const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .populate('assignedTo', 'name email')
    .populate('project', 'name');
    
  res.status(200).json(updatedTask);
});


const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) { res.status(404); throw new Error('Task not found'); }
  await task.deleteOne();
  res.status(200).json({ id: req.params.id });
});


const addTaskComment = asyncHandler(async (req, res) => {
  const { text } = req.body;
  const task = await Task.findById(req.params.id);

  if (task) {
    const comment = {
      text,
      user: req.user._id,
      createdAt: new Date()
    };

    task.comments.push(comment);
    await task.save();
    
    
    const updated = await Task.findById(req.params.id)
        .populate('assignedTo', 'name')
        .populate('comments.user', 'name');
        
    res.status(201).json(updated);
  } else {
    res.status(404);
    throw new Error('Task not found');
  }
});


const addTaskAttachment = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (task) {
    if (!req.file) {
        res.status(400);
        throw new Error('No file uploaded');
    }

    
    let cleanPath = req.file.path.replace(/\\/g, "/"); 
    
   
    if (cleanPath.startsWith('backend/')) {
        cleanPath = cleanPath.replace('backend/', '');
    }


    if (cleanPath.startsWith('/')) {
        cleanPath = cleanPath.substring(1);
    }

    const attachment = {
      name: req.file.originalname,
      link: cleanPath, 
      uploadedBy: req.user._id,
      createdAt: new Date()
    };

    task.attachments.push(attachment);
    await task.save();
    res.status(201).json(task);
  } else {
    res.status(404);
    throw new Error('Task not found');
  }
});

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  addTaskComment,
  addTaskAttachment
};