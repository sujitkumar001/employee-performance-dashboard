const asyncHandler = require('express-async-handler');
const Project = require('../models/Project');



const getProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find()
    .populate('team', 'name email avatar') 
    .populate('manager', 'name email')     
    .sort({ createdAt: -1 });
  res.status(200).json(projects);
});



const getProjectById = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate('team', 'name email avatar')
    .populate('manager', 'name email');

  if (project) {
    res.status(200).json(project);
  } else {
    res.status(404);
    throw new Error('Project not found');
  }
});



const createProject = asyncHandler(async (req, res) => {
  const { name, description, startDate, dueDate, team, status, progress, budget } = req.body;

  if (!name) {
    res.status(400);
    throw new Error('Project name is required');
  }

  
  const manager = req.body.manager || req.user._id;

  const project = await Project.create({
    name,
    description,
    startDate,
    dueDate,
    manager, 
    team,    
    status: status || 'planning',
    progress: progress || 0,
    budget: budget || 0
  });

 
  const populatedProject = await Project.findById(project._id)
    .populate('team', 'name avatar')
    .populate('manager', 'name');

  res.status(201).json(populatedProject);
});



const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  const updatedProject = await Project.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  )
  .populate('team', 'name avatar')
  .populate('manager', 'name');

  res.status(200).json(updatedProject);
});



const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }
  await project.deleteOne();
  res.status(200).json({ id: req.params.id, message: 'Project removed' });
});



const getProjectStats = asyncHandler(async (req, res) => {
  const total = await Project.countDocuments();
  const completed = await Project.countDocuments({ status: 'completed' });
  const active = await Project.countDocuments({ status: 'in-progress' });
  const planning = await Project.countDocuments({ status: 'planning' });

  res.status(200).json({ total, completed, active, planning });
});

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getProjectStats
};