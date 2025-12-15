// ============================================
// FILE: frontend/src/utils/helpers.js
// ============================================
import { format, formatDistance, isValid } from 'date-fns';

// Date formatting
export const formatDate = (date, formatStr = 'MMM dd, yyyy') => {
  if (!date) return 'N/A';
  const parsedDate = new Date(date);
  return isValid(parsedDate) ? format(parsedDate, formatStr) : 'Invalid Date';
};

export const formatDateTime = (date) => {
  return formatDate(date, 'MMM dd, yyyy HH:mm');
};

export const timeAgo = (date) => {
  if (!date) return 'N/A';
  const parsedDate = new Date(date);
  return isValid(parsedDate) 
    ? formatDistance(parsedDate, new Date(), { addSuffix: true })
    : 'Invalid Date';
};

// Status badge colors
export const getStatusColor = (status) => {
  const statusColors = {
    // Task statuses
    'todo': 'bg-gray-100 text-gray-800',
    'in-progress': 'bg-blue-100 text-blue-800',
    'review': 'bg-purple-100 text-purple-800',
    'completed': 'bg-green-100 text-green-800',
    'cancelled': 'bg-red-100 text-red-800',
    
    // Project statuses
    'planning': 'bg-yellow-100 text-yellow-800',
    'active': 'bg-green-100 text-green-800',
    'on-hold': 'bg-orange-100 text-orange-800',
    
    // Performance statuses
    'draft': 'bg-gray-100 text-gray-800',
    'submitted': 'bg-blue-100 text-blue-800',
    'acknowledged': 'bg-green-100 text-green-800',
  };
  
  return statusColors[status] || 'bg-gray-100 text-gray-800';
};

// Priority badge colors
export const getPriorityColor = (priority) => {
  const priorityColors = {
    'low': 'bg-gray-100 text-gray-800',
    'medium': 'bg-yellow-100 text-yellow-800',
    'high': 'bg-orange-100 text-orange-800',
    'urgent': 'bg-red-100 text-red-800',
  };
  
  return priorityColors[priority] || 'bg-gray-100 text-gray-800';
};

// Role badge colors
export const getRoleColor = (role) => {
  const roleColors = {
    'admin': 'bg-purple-100 text-purple-800',
    'manager': 'bg-blue-100 text-blue-800',
    'employee': 'bg-green-100 text-green-800',
  };
  
  return roleColors[role] || 'bg-gray-100 text-gray-800';
};

// Format full name
export const getFullName = (user) => {
  if (!user) return 'Unknown';
  if (user.fullName) return user.fullName;
  return `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown';
};

// Get initials for avatar
export const getInitials = (user) => {
  if (!user) return '?';
  const firstName = user.firstName || '';
  const lastName = user.lastName || '';
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || '?';
};

// Calculate progress percentage
export const calculateProgress = (completed, total) => {
  if (!total || total === 0) return 0;
  return Math.round((completed / total) * 100);
};

// Format currency
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount || 0);
};

// Truncate text
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Check if date is overdue
export const isOverdue = (dueDate) => {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date();
};

// Get days until due
export const getDaysUntilDue = (dueDate) => {
  if (!dueDate) return null;
  const now = new Date();
  const due = new Date(dueDate);
  const diffTime = due - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Sort array by property
export const sortBy = (array, key, order = 'asc') => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (order === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });
};

// Group array by property
export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const groupKey = item[key];
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {});
};

// Validate email
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Generate random color for avatar
export const getRandomColor = () => {
  const colors = [
    'bg-red-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Get score color based on value
export const getScoreColor = (score) => {
  if (score >= 90) return 'text-green-600';
  if (score >= 75) return 'text-blue-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-red-600';
};

// Get performance rating
export const getPerformanceRating = (score) => {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Good';
  if (score >= 60) return 'Satisfactory';
  return 'Needs Improvement';
};

// Export all functions as default
export default {
  formatDate,
  formatDateTime,
  timeAgo,
  getStatusColor,
  getPriorityColor,
  getRoleColor,
  getFullName,
  getInitials,
  calculateProgress,
  formatCurrency,
  truncateText,
  isOverdue,
  getDaysUntilDue,
  sortBy,
  groupBy,
  isValidEmail,
  getRandomColor,
  getScoreColor,
  getPerformanceRating,
};