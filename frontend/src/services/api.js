
import axios from 'axios';

const API_URL = "https://employee-performance-dashboard-gocr.onrender.com/api";

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============================================
// Auth API
// ============================================
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/updatedetails', data),
  updatePassword: (data) => api.put('/auth/updatepassword', data),
};

// ============================================
// Employee API
// ============================================
export const employeeAPI = {
  getAll: (params) => api.get('/employees', { params }),
  getOne: (id) => api.get(`/employees/${id}`),
  create: (data) => api.post('/employees', data), // Used by Add Employee Modal
  update: (id, data) => api.put(`/employees/${id}`, data),
  delete: (id) => api.delete(`/employees/${id}`),
  getByDepartment: (department) => api.get(`/employees/department/${department}`),
  getStats: () => api.get('/employees/stats'),
};

// ============================================
// Project API
// ============================================
export const projectAPI = {
  getAll: (params) => api.get('/projects', { params }),
  getOne: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data), // Used for Status Updates
  delete: (id) => api.delete(`/projects/${id}`),
  addTeamMember: (id, data) => api.post(`/projects/${id}/team`, data),
  removeTeamMember: (id, userId) => api.delete(`/projects/${id}/team/${userId}`),
  getStats: () => api.get('/projects/stats'),
};

// ============================================
// Task API
// ============================================
export const taskAPI = {
  getAll: (params) => api.get('/tasks', { params }),
  getOne: (id) => api.get(`/tasks/${id}`),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data), // Used for Kanban Status Updates
  delete: (id) => api.delete(`/tasks/${id}`),
  addComment: (id, data) => api.post(`/tasks/${id}/comments`, data),
  getByProject: (projectId) => api.get(`/tasks/project/${projectId}`),
  getMyTasks: (params) => api.get('/tasks/my/tasks', { params }),
  getStats: () => api.get('/tasks/stats'),
};

// ============================================
// Performance API
// ============================================
export const performanceAPI = {
  getAll: (params) => api.get('/performance', { params }),
  getOne: (id) => api.get(`/performance/${id}`),
  create: (data) => api.post('/performance', data),
  update: (id, data) => api.put(`/performance/${id}`, data),
  delete: (id) => api.delete(`/performance/${id}`),
  acknowledge: (id) => api.put(`/performance/${id}/acknowledge`),
  getByEmployee: (employeeId) => api.get(`/performance/employee/${employeeId}`),
  getMyEvaluations: () => api.get('/performance/my/evaluations'),
  updateGoal: (id, goalId, data) => api.put(`/performance/${id}/goals/${goalId}`, data),
  getStats: () => api.get('/performance/stats'),
};

export default api;