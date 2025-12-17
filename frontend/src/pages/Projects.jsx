import React, { useState, useEffect } from 'react';
import { FolderKanban, Plus, Search, Calendar, Users, X, Filter, Clock } from 'lucide-react';
import { projectAPI, employeeAPI } from '../services/api'; 
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedProject, setSelectedProject] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '', 
    description: '', 
    status: 'planning', 
    priority: 'medium',
    startDate: '', 
    dueDate: '', 
    budget: '', 
    team: [] 
  });

  const { user: currentUser } = useSelector((state) => state.auth);
  const location = useLocation();

  const canEditStatus = currentUser?.role === 'admin' || currentUser?.role === 'manager';

  useEffect(() => {
    if (location.state?.openCreate) {
        setShowCreateModal(true);
        window.history.replaceState({}, document.title);
    }
  }, [location]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      try {
        const { data } = await projectAPI.getAll();
        setProjects(data);
      } catch (error) {
        console.error("Failed to fetch projects:", error);
      }

      try {
        const { data } = await employeeAPI.getAll();
        setEmployees(data);
      } catch (error) {
        console.error("Failed to fetch employees:", error);
      }

    } finally {
      setLoading(false);
    }
  };

  // --- NEW: Helper to calculate progress based on status ---
  const getProgressFromStatus = (status) => {
    switch (status) {
      case 'planning': return 0;
      case 'in-progress': return 50;
      case 'completed': return 100;
      case 'on-hold': return 0;
      default: return 0;
    }
  };

  // --- UPDATED: Handle Status & Progress Change ---
  const handleStatusChange = async (projectId, newStatus) => {
    try {
        // Calculate new progress automatically
        const newProgress = getProgressFromStatus(newStatus);

        // Optimistic UI Update (Update Status AND Progress immediately)
        const updatedProjects = projects.map(p => 
            p._id === projectId ? { ...p, status: newStatus, progress: newProgress } : p
        );
        setProjects(updatedProjects);

        // Send both updates to backend
        await projectAPI.update(projectId, { status: newStatus, progress: newProgress });
    } catch (error) {
        console.error("Failed to update project status", error);
        fetchData(); // Revert on error
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      await projectAPI.create({
        ...formData,
        budget: Number(formData.budget),
        manager: currentUser._id,
        progress: 0 // Default start progress
      });
      setShowCreateModal(false);
      fetchData();
      setFormData({ 
        name: '', description: '', status: 'planning', priority: 'medium', 
        startDate: '', dueDate: '', budget: '', team: [] 
      });
    } catch (error) {
      alert(error.response?.data?.message || 'Error creating project');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'completed': 'bg-green-100 text-green-700 border-green-200',
      'in-progress': 'bg-blue-100 text-blue-700 border-blue-200',
      'planning': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'on-hold': 'bg-red-100 text-red-700 border-red-200'
    };
    return colors[status] || colors['planning'];
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-2 rounded-xl">
                <FolderKanban className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
                <p className="text-sm text-gray-500">{projects.length} total projects</p>
              </div>
            </div>
            {canEditStatus && (
                <button 
                onClick={() => setShowCreateModal(true)}
                className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 shadow-md"
                >
                <Plus className="w-4 h-4" />
                <span>New Project</span>
                </button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 max-w-md relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="planning">Planning</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredProjects.map((project) => (
            <div 
              key={project._id}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 cursor-pointer"
              onClick={() => setSelectedProject(project)}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{project.name}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2">{project.description}</p>
                </div>
                {canEditStatus ? (
                    <select 
                        value={project.status}
                        onChange={(e) => handleStatusChange(project._id, e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className={`text-xs px-2 py-1 rounded-full border font-medium cursor-pointer outline-none ${getStatusColor(project.status)}`}
                    >
                        <option value="planning">Planning</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="on-hold">On Hold</option>
                    </select>
                ) : (
                    <span className={`text-xs px-3 py-1 rounded-full border font-medium ${getStatusColor(project.status)}`}>
                        {project.status}
                    </span>
                )}
              </div>

              {/* Progress Bar (Updates automatically based on status) */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Progress</span>
                  <span className="text-sm font-bold text-gray-900">{project.progress || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-500 ease-in-out"
                    style={{ width: `${project.progress || 0}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-indigo-500" />
                    <span>
                        {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'Start'} 
                        {' - '} 
                        {project.dueDate ? new Date(project.dueDate).toLocaleDateString() : 'End'}
                    </span>
                </div>
                <div className="text-xs">
                   Manager: {project.manager ? project.manager.name : 'Unknown'}
                </div>
              </div>
            </div>
          ))}
          
          {filteredProjects.length === 0 && (
             <div className="col-span-full text-center py-12 text-gray-500">
                No projects found.
             </div>
          )}
        </div>
      </div>

      {showCreateModal && canEditStatus && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Create New Project</h2>
              <button onClick={() => setShowCreateModal(false)}><X className="w-6 h-6 text-gray-400" /></button>
            </div>
            
            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Project Name</label>
                <input 
                    type="text" 
                    required 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})} 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea 
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                    value={formData.description} 
                    onChange={(e) => setFormData({...formData, description: e.target.value})} 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                        value={formData.status} 
                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                    >
                        <option value="planning">Planning</option>
                        <option value="in-progress">In Progress</option>
                    </select>
                </div>
                {/* <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Budget ($)</label>
                    <input 
                        type="number" 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                        value={formData.budget} 
                        onChange={(e) => setFormData({...formData, budget: e.target.value})} 
                    />
                </div> */}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-indigo-500" /> Start Date
                    </label>
                    <input 
                        type="date" 
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                        value={formData.startDate} 
                        onChange={(e) => setFormData({...formData, startDate: e.target.value})} 
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-red-500" /> End Date
                    </label>
                    <input 
                        type="date" 
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                        value={formData.dueDate} 
                        onChange={(e) => setFormData({...formData, dueDate: e.target.value})} 
                    />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button 
                    type="button" 
                    onClick={() => setShowCreateModal(false)} 
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                    Cancel
                </button>
                <button 
                    type="submit" 
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;