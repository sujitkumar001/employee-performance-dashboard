import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { taskAPI, projectAPI, employeeAPI } from '../services/api';
import { Users, FolderKanban, CheckCircle, AlertCircle, Plus, ChevronRight, Calendar, Target, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    teamMembers: 0,
    pendingReviews: 0
  });

  const [recentProjects, setRecentProjects] = useState([]);
  const [recentTasks, setRecentTasks] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // 1. Fetch ALL data freshly
        const [projectsRes, tasksRes, employeesRes] = await Promise.allSettled([
          projectAPI.getAll(),
          taskAPI.getAll(),
          employeeAPI.getAll()
        ]);

        const projects = projectsRes.status === 'fulfilled' ? projectsRes.value.data : [];
        const tasks = tasksRes.status === 'fulfilled' ? tasksRes.value.data : [];
        const employees = employeesRes.status === 'fulfilled' ? employeesRes.value.data : [];

        // 2. Filter Tasks based on User Role (Admin sees all, Employee sees theirs)
        let relevantTasks = tasks;
        if (user && user.role === 'employee') {
            relevantTasks = tasks.filter(t => {
                // Handle both populated object ({_id: ...}) and raw string ID
                const assigneeId = t.assignedTo?._id || t.assignedTo;
                return assigneeId === user._id;
            });
        }

        // 3. Robust Calculation Logic (Case Insensitive)
        const normalize = (str) => str ? str.toLowerCase().trim() : '';

        const activeProjectsCount = projects.filter(p => normalize(p.status) === 'in-progress').length;
        
        // FIX: Count 'Completed', 'completed', or 'Done' as completed
        const completedTasksCount = relevantTasks.filter(t => {
            const status = normalize(t.status);
            return status === 'completed' || status === 'done';
        }).length;

        // FIX: Count 'Pending', 'pending', or 'To Do' as pending
        const pendingTasksCount = relevantTasks.filter(t => {
            const status = normalize(t.status);
            return status === 'pending' || status === 'to do';
        }).length;

        setStats({
          totalProjects: projects.length,
          activeProjects: activeProjectsCount,
          totalTasks: relevantTasks.length,
          completedTasks: completedTasksCount,
          teamMembers: employees.length,
          pendingReviews: pendingTasksCount
        });

        // 4. Update Recent Lists
        setRecentProjects(projects.slice(0, 3));
        setRecentTasks(relevantTasks.slice(0, 4));

      } catch (error) {
        console.error("Error calculating dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  // Helper functions for colors
  const getStatusColor = (status) => {
    const safeStatus = status ? status.toLowerCase() : 'todo';
    const colors = {
      'completed': 'bg-green-100 text-green-700 border-green-200',
      'done': 'bg-green-100 text-green-700 border-green-200',
      'in-progress': 'bg-blue-100 text-blue-700 border-blue-200',
      'planning': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'pending': 'bg-gray-100 text-gray-700 border-gray-200',
      'to do': 'bg-gray-100 text-gray-700 border-gray-200',
      'on-hold': 'bg-red-100 text-red-700 border-red-200'
    };
    return colors[safeStatus] || colors['pending'];
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'high': 'bg-red-100 text-red-700',
      'medium': 'bg-yellow-100 text-yellow-700',
      'low': 'bg-green-100 text-green-700'
    };
    return colors[priority] || colors['medium'];
  };

  const handleCreateProjectClick = () => {
    navigate('/projects', { state: { openCreate: true } });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-500">Overview of your projects and tasks</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Active Projects Card */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 p-3 rounded-xl">
              <FolderKanban className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.activeProjects}</h3>
          <p className="text-sm text-gray-500">Active Projects</p>
          <div className="mt-4 flex items-center text-xs text-gray-400">
            <span>{stats.totalProjects} total</span>
          </div>
        </div>

        {/* Completed Tasks Card */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-100 p-3 rounded-xl">
              <CheckCircle className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.completedTasks}</h3>
          <p className="text-sm text-gray-500">Tasks Completed</p>
          <div className="mt-4 flex items-center text-xs text-gray-400">
            <span>{stats.totalTasks} total tasks</span>
          </div>
        </div>

        {/* Team Members Card */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 p-3 rounded-xl">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.teamMembers}</h3>
          <p className="text-sm text-gray-500">Team Members</p>
          <div className="mt-4 flex items-center text-xs text-gray-400">
            <span>Across all departments</span>
          </div>
        </div>

        {/* Pending Reviews Card */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-orange-100 p-3 rounded-xl">
              <AlertCircle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.pendingReviews}</h3>
          <p className="text-sm text-gray-500">Pending Tasks</p>
          <div className="mt-4 flex items-center text-xs text-gray-400">
            <span>Requires attention</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Recent Projects */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Recent Projects</h2>
            <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center space-x-1" onClick={() => navigate('/projects')}>
              <span>View all</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          {recentProjects.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No projects found. Create one to get started!</div>
          ) : (
            <div className="space-y-4">
              {recentProjects.map((project) => (
                <div key={project._id} className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200 cursor-pointer">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="bg-indigo-100 p-2 rounded-lg">
                        <FolderKanban className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{project.name}</h3>
                        <div className="flex items-center space-x-3 mt-1">
                          <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(project.status)}`}>
                            {project.status}
                          </span>
                          <span className="text-xs text-gray-500 flex items-center">
                            {/* UPDATED: User Initial Circle for Project Creator or Team Lead */}
                            <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-xs mr-1 border border-white shadow-sm">
                                {project.createdBy?.name ? project.createdBy.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            {project.team ? project.team.length : 0} members
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900">{project.progress || 0}%</div>
                      <div className="text-xs text-gray-500 flex items-center justify-end mt-1">
                        <Calendar className="w-3 h-3 mr-1" />
                        {project.dueDate ? new Date(project.dueDate).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${project.progress || 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="space-y-3">
            {/* 1. Create Project (Admins/Managers Only) */}
            {(user?.role === 'admin' || user?.role === 'manager') && (
                <button 
                onClick={handleCreateProjectClick} 
                className="w-full flex items-center space-x-3 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 rounded-xl transition-all duration-200"
                >
                <div className="bg-indigo-600 p-2 rounded-lg">
                    <Plus className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium text-gray-900">Create Project</span>
                </button>
            )}

            {/* 2. View Projects (All Users) */}
            <button 
              onClick={() => navigate('/projects')}
              className="w-full flex items-center space-x-3 p-4 bg-gradient-to-r from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100 rounded-xl transition-all duration-200"
            >
              <div className="bg-orange-600 p-2 rounded-lg">
                <FolderKanban className="w-5 h-5 text-white" />
              </div>
              <span className="font-medium text-gray-900">Projects</span>
            </button>

            {/* 3. Tasks */}
            <button 
              onClick={() => navigate('/tasks')}
              className="w-full flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 rounded-xl transition-all duration-200"
            >
              <div className="bg-blue-600 p-2 rounded-lg">
                <Target className="w-5 h-5 text-white" />
              </div>
              <span className="font-medium text-gray-900">
                {user?.role === 'employee' ? 'My Tasks' : 'Assign Task'}
              </span>
            </button>

            {/* 4. Performance Review */}
            <button 
              onClick={() => navigate('/performance')}
              className="w-full flex items-center space-x-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 rounded-xl transition-all duration-200"
            >
              <div className="bg-green-600 p-2 rounded-lg">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="font-medium text-gray-900">Performance Review</span>
            </button>

            {/* 5. Team Directory */}
            <button 
              onClick={() => navigate('/employees')}
              className="w-full flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 rounded-xl transition-all duration-200"
            >
              <div className="bg-purple-600 p-2 rounded-lg">
                <Users className="w-5 h-5 text-white" />
              </div>
              <span className="font-medium text-gray-900">Team Directory</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Tasks */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">Recent Tasks</h2>
          <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center space-x-1" onClick={() => navigate('/tasks')}>
            <span>View all</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        
        {recentTasks.length === 0 ? (
           <div className="text-center py-8 text-gray-500">No tasks found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentTasks.map((task) => (
              <div key={task._id} className="p-4 bg-gray-50 rounded-xl hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-100">
                <div className="flex items-start justify-between mb-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(task.status)}`}>
                    {task.status}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{task.name}</h3>
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  {/* UPDATED: User Initial Circle for Task Assignee */}
                  <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-[10px] border border-indigo-200">
                    {task.assignedTo?.name ? task.assignedTo.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span>{task.assignedTo?.name || 'Unassigned'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;