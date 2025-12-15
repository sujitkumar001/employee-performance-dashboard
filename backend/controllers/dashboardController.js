const asyncHandler = require('express-async-handler');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Employee = require('../models/Employee');
const User = require('../models/User');


const getDashboardStats = asyncHandler(async (req, res) => {
 

  const totalProjects = await Project.countDocuments();
  const activeProjects = await Project.countDocuments({ status: 'in-progress' });
  const totalTasks = await Task.countDocuments();
  const completedTasks = await Task.countDocuments({ status: 'completed' });
  const teamMembers = await Employee.countDocuments({ status: 'Active' });
  
  
  const recentProjects = await Project.find()
    .sort({ createdAt: -1 })
    .limit(3)
    .select('name status progress team dueDate');

  
  const recentTasks = await Task.find()
    .sort({ createdAt: -1 })
    .limit(4)
    .populate('assignedTo', 'name') 
    .select('name status priority assignedTo');


  res.status(200).json({
    stats: {
      totalProjects,
      activeProjects,
      totalTasks,
      completedTasks,
      teamMembers,
      pendingReviews: 0 
    },
    recentProjects: recentProjects.map(p => ({
      id: p._id,
      name: p.name,
      status: p.status,
      progress: p.progress,
      team: p.team.length,
      dueDate: p.dueDate ? new Date(p.dueDate).toLocaleDateString() : 'N/A'
    })),
    recentTasks: recentTasks.map(t => ({
      id: t._id,
      title: t.name,
      assignee: t.assignedTo ? t.assignedTo.name : 'Unassigned',
      status: t.status,
      priority: 'medium' 
    }))
  });
});

module.exports = { getDashboardStats };