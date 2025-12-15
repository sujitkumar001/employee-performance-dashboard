import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search, Calendar, Flag, X, ChevronDown, CheckCircle2, Circle, Clock, MessageSquare, Paperclip, Send, FileText, ExternalLink, UploadCloud, Trash2 } from 'lucide-react';
import { taskAPI, projectAPI, employeeAPI } from '../services/api';
import { useSelector } from 'react-redux';
import api from '../services/api'; 

// --- HELPER: FIX BROKEN FILE URLS ---
// This ensures the link is always correct, even if the database has bad data
const getFileUrl = (filePath) => {
  if (!filePath) return '#';
  
  // 1. Remove any leading slashes (fixes double slash issue)
  // 2. Remove 'backend/' if it was accidentally saved
  let cleanPath = filePath.replace(/^[/\\]+/, '').replace(/^backend[/\\]+/, '');
  
  // 3. Return the full correct URL
  return `http://localhost:5000/${cleanPath}`;
};

// ... (StatusSelect Component remains the same) ...
const StatusSelect = ({ status, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  const statusConfig = {
    'Pending': { label: 'To Do', color: 'bg-gray-100 text-gray-600 hover:bg-gray-200', icon: Circle },
    'In Progress': { label: 'In Progress', color: 'bg-blue-50 text-blue-600 hover:bg-blue-100', icon: Clock },
    'Completed': { label: 'Done', color: 'bg-green-50 text-green-600 hover:bg-green-100', icon: CheckCircle2 },
  };

  const currentKey = Object.keys(statusConfig).find(k => k.toLowerCase() === (status || '').toLowerCase()) || 'Pending';
  const current = statusConfig[currentKey];
  const Icon = current.icon;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={wrapperRef}>
      <button 
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
        className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${current.color} border border-transparent hover:border-black/5`}
      >
        <Icon className="w-3.5 h-3.5" />
        <span>{current.label}</span>
        <ChevronDown className="w-3 h-3 opacity-50" />
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-36 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
          {Object.entries(statusConfig).map(([key, config]) => (
            <div 
              key={key}
              onClick={(e) => { e.stopPropagation(); onChange(key); setIsOpen(false); }}
              className={`px-4 py-2 text-xs font-medium cursor-pointer flex items-center space-x-2 hover:bg-gray-50 transition-colors ${currentKey === key ? 'text-indigo-600 bg-indigo-50' : 'text-gray-700'}`}
            >
              <config.icon className="w-3.5 h-3.5" />
              <span>{config.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddTask, setShowAddTask] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // --- DETAIL MODAL STATE ---
  const [selectedTask, setSelectedTask] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [activeTab, setActiveTab] = useState('comments'); 
  
  // --- FILE UPLOAD STATE ---
  const [fileToUpload, setFileToUpload] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const { user: currentUser } = useSelector((state) => state.auth);

  const [columns] = useState([
    { id: 'Pending', title: 'To Do' },
    { id: 'In Progress', title: 'In Progress' },
    { id: 'Completed', title: 'Done' }
  ]);

  const [formData, setFormData] = useState({
    name: '', description: '', priority: 'medium', status: 'Pending',
    assignedTo: '', projectId: '', dueDate: ''
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tasksRes, projectsRes, employeesRes] = await Promise.allSettled([
        taskAPI.getAll(), projectAPI.getAll(), employeeAPI.getAll()
      ]);
      if (tasksRes.status === 'fulfilled') setTasks(tasksRes.value.data);
      if (projectsRes.status === 'fulfilled') setProjects(projectsRes.value.data);
      if (employeesRes.status === 'fulfilled') setEmployees(employeesRes.value.data);
    } catch (error) { console.error("Error fetching data:", error); } 
    finally { setLoading(false); }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const updatedTasks = tasks.map(t => t._id === taskId ? { ...t, status: newStatus } : t);
      setTasks(updatedTasks);
      await taskAPI.update(taskId, { status: newStatus });
    } catch (error) { console.error("Failed to update status", error); fetchData(); }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await taskAPI.create(formData);
      setShowAddTask(false);
      fetchData(); 
      setFormData({ name: '', description: '', priority: 'medium', status: 'Pending', assignedTo: '', projectId: '', dueDate: '' });
    } catch (error) { alert(error.response?.data?.message || 'Failed to create task'); }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
        const updatedTask = { 
            ...selectedTask, 
            comments: [...(selectedTask.comments || []), { text: newComment, user: currentUser, createdAt: new Date() }] 
        };
        setSelectedTask(updatedTask);
        setNewComment('');
        await api.post(`/tasks/${selectedTask._id}/comment`, { text: newComment });
        fetchData();
    } catch (error) { console.error("Failed to add comment", error); }
  };

  // --- DRAG AND DROP HANDLERS ---
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFileToUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFileToUpload(e.target.files[0]);
    }
  };

  const handleUploadFile = async (e) => {
    e.preventDefault();
    if (!fileToUpload) return;

    const formData = new FormData();
    formData.append('file', fileToUpload);

    try {
        const updatedTask = {
            ...selectedTask,
            attachments: [...(selectedTask.attachments || []), { 
                name: fileToUpload.name, 
                link: '#', 
                uploadedBy: currentUser 
            }]
        };
        setSelectedTask(updatedTask);
        setFileToUpload(null);

        await api.post(`/tasks/${selectedTask._id}/attachment`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        fetchData();
    } catch (error) { console.error("Failed to upload file", error); }
  };

  const visibleTasks = tasks.filter(task => {
    const matchesSearch = task.name.toLowerCase().includes(searchTerm.toLowerCase());
    if (currentUser?.role === 'admin' || currentUser?.role === 'manager') return matchesSearch;
    return matchesSearch && (task.assignedTo?._id === currentUser?._id || task.assignedTo === currentUser?._id);
  });

  const getTasksByColumn = (status) => visibleTasks.filter(task => {
      const s = (task.status || '').toLowerCase();
      const colId = status.toLowerCase();
      if (colId === 'pending') return s === 'pending' || s === 'to do';
      if (colId === 'completed') return s === 'completed' || s === 'done';
      return s === colId;
  });

  const getPriorityStyle = (priority) => {
    const styles = { 'high': 'text-red-600 bg-red-50 border-red-100', 'medium': 'text-amber-600 bg-amber-50 border-amber-100', 'low': 'text-emerald-600 bg-emerald-50 border-emerald-100' };
    return styles[priority?.toLowerCase()] || styles['medium'];
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
      {/* Header and Kanban Board sections remain exactly as they were */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tasks</h1>
          {(currentUser?.role === 'admin' || currentUser?.role === 'manager') && (
              <button onClick={() => setShowAddTask(true)} className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl shadow-md transition-all">
                <Plus className="w-5 h-5" /> <span className="font-medium">New Task</span>
              </button>
          )}
        </div>
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input type="text" placeholder="Search tasks..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white shadow-sm" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((column) => {
          const columnTasks = getTasksByColumn(column.id);
          return (
            <div key={column.id} className="bg-gray-50/50 rounded-2xl p-4 flex flex-col h-full border border-gray-100">
              <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="font-bold text-gray-700">{column.title}</h3>
                <span className="bg-white text-gray-500 text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm">{columnTasks.length}</span>
              </div>
              <div className="space-y-3">
                {columnTasks.map((task) => (
                  <div key={task._id} onClick={() => setSelectedTask(task)} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 cursor-pointer group">
                    <div className="flex justify-between items-start mb-3">
                      <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-md border ${getPriorityStyle(task.priority)}`}>{task.priority}</span>
                      <StatusSelect status={task.status} onChange={(val) => handleStatusChange(task._id, val)} />
                    </div>
                    <h4 className="font-bold text-gray-900 mb-1 leading-snug">{task.name}</h4>
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">{task.description}</p>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                      <div className="flex items-center space-x-3 text-gray-400">
                         <div className="flex items-center text-xs"><MessageSquare className="w-3.5 h-3.5 mr-1" />{task.comments?.length || 0}</div>
                         <div className="flex items-center text-xs"><Paperclip className="w-3.5 h-3.5 mr-1" />{task.attachments?.length || 0}</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {task.assignedTo && <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-[10px] text-white font-bold">{task.assignedTo.name?.charAt(0)}</div>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* DETAIL MODAL WITH DRAG & DROP & FIXED LINKS */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{selectedTask.name}</h2>
                        <div className="flex items-center space-x-2 mt-2">
                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${getPriorityStyle(selectedTask.priority)}`}>{selectedTask.priority}</span>
                            <span className="text-sm text-gray-500">Assigned to: <span className="font-medium text-gray-700">{selectedTask.assignedTo?.name || 'Unassigned'}</span></span>
                        </div>
                    </div>
                    <button onClick={() => setSelectedTask(null)} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg"><X className="w-6 h-6" /></button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6">
                    <p className="text-gray-600 mb-6">{selectedTask.description}</p>
                    <div className="flex space-x-6 border-b border-gray-100 mb-6">
                        <button onClick={() => setActiveTab('comments')} className={`pb-2 text-sm font-medium transition-colors ${activeTab === 'comments' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}>Comments</button>
                        <button onClick={() => setActiveTab('files')} className={`pb-2 text-sm font-medium transition-colors ${activeTab === 'files' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}>Files</button>
                    </div>
                    
                    {activeTab === 'comments' ? (
                        <div className="space-y-4">
                            {selectedTask.comments?.map((comment, idx) => (
                                <div key={idx} className="flex space-x-3">
                                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs flex-shrink-0">{comment.user?.name?.charAt(0) || 'U'}</div>
                                    <div className="bg-gray-50 p-3 rounded-xl flex-1">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-xs font-bold text-gray-900">{comment.user?.name || 'Unknown'}</span>
                                            <span className="text-[10px] text-gray-400">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-sm text-gray-600">{comment.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {selectedTask.attachments?.map((file, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-gray-50">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><FileText className="w-5 h-5"/></div>
                                        <div><p className="text-sm font-medium text-gray-900">{file.name}</p></div>
                                    </div>
                                    
                                    {/* --- THE FIX: USE HELPER FUNCTION FOR URL --- */}
                                    <a 
                                        href={getFileUrl(file.link)} 
                                        target="_blank" 
                                        rel="noreferrer" 
                                        className="text-indigo-600 hover:text-indigo-700 p-2 flex items-center gap-1 text-xs font-medium"
                                    >
                                        <ExternalLink className="w-4 h-4"/> Open
                                    </a>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer Input Area */}
                <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                    {activeTab === 'comments' ? (
                        <form onSubmit={handleAddComment} className="flex gap-2">
                            <input type="text" className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20" placeholder="Write a comment..." value={newComment} onChange={(e) => setNewComment(e.target.value)} />
                            <button type="submit" className="bg-indigo-600 text-white p-2.5 rounded-xl hover:bg-indigo-700"><Send className="w-5 h-5" /></button>
                        </form>
                    ) : (
                        <form onSubmit={handleUploadFile} className="flex flex-col gap-3">
                            {/* DRAG AND DROP ZONE */}
                            <div 
                                className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400'}`}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current.click()}
                            >
                                <input 
                                    ref={fileInputRef}
                                    type="file" 
                                    className="hidden" 
                                    onChange={handleFileChange} 
                                />
                                {fileToUpload ? (
                                    <div className="flex items-center space-x-2 text-indigo-600">
                                        <FileText className="w-6 h-6" />
                                        <span className="font-medium text-sm">{fileToUpload.name}</span>
                                        <button onClick={(e) => { e.stopPropagation(); setFileToUpload(null); }} className="p-1 hover:bg-indigo-100 rounded-full"><X className="w-4 h-4"/></button>
                                    </div>
                                ) : (
                                    <>
                                        <UploadCloud className="w-8 h-8 text-gray-400 mb-2" />
                                        <p className="text-sm text-gray-500 font-medium">Click to upload or drag and drop</p>
                                        <p className="text-xs text-gray-400">PDF, PNG, JPG</p>
                                    </>
                                )}
                            </div>
                            
                            {fileToUpload && (
                                <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-xl hover:bg-indigo-700 transition-colors font-medium">
                                    Upload File
                                </button>
                            )}
                        </form>
                    )}
                </div>
            </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddTask && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-900">Create New Task</h2>
              <button onClick={() => setShowAddTask(false)} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreateTask} className="p-6 space-y-5">
              {/* Form content remains the same */}
              <input type="text" required className="w-full px-4 py-2.5 border border-gray-200 rounded-xl" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Task Title" />
              <textarea rows="3" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Description" />
              <div className="grid grid-cols-2 gap-5">
                <select required className="w-full px-4 py-2.5 border border-gray-200 rounded-xl" value={formData.assignedTo} onChange={(e) => setFormData({...formData, assignedTo: e.target.value})}>
                    <option value="">Select Employee</option>
                    {employees.map(emp => <option key={emp.user._id} value={emp.user._id}>{emp.user.name} ({emp.designation})</option>)}
                </select>
                <select className="w-full px-4 py-2.5 border border-gray-200 rounded-xl" value={formData.priority} onChange={(e) => setFormData({...formData, priority: e.target.value})}>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <input type="date" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl" value={formData.dueDate} onChange={(e) => setFormData({...formData, dueDate: e.target.value})} />
                <select required className="w-full px-4 py-2.5 border border-gray-200 rounded-xl" value={formData.projectId} onChange={(e) => setFormData({...formData, projectId: e.target.value})}>
                    <option value="">Select Project</option>
                    {projects.map(proj => <option key={proj._id} value={proj._id}>{proj.name}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddTask(false)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksPage;