// ============================================
// FILE: frontend/src/redux/slices/projectSlice.js
// ============================================
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  projects: [],
  currentProject: null,
  loading: false,
  error: null,
  stats: null,
};

const projectSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setProjects: (state, action) => {
      state.projects = action.payload;
      state.loading = false;
      state.error = null;
    },
    setCurrentProject: (state, action) => {
      state.currentProject = action.payload;
      state.loading = false;
    },
    addProject: (state, action) => {
      state.projects.unshift(action.payload);
    },
    updateProject: (state, action) => {
      const index = state.projects.findIndex(p => p._id === action.payload._id);
      if (index !== -1) {
        state.projects[index] = action.payload;
      }
      if (state.currentProject?._id === action.payload._id) {
        state.currentProject = action.payload;
      }
    },
    deleteProject: (state, action) => {
      state.projects = state.projects.filter(p => p._id !== action.payload);
    },
    setProjectStats: (state, action) => {
      state.stats = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setLoading,
  setProjects,
  setCurrentProject,
  addProject,
  updateProject,
  deleteProject,
  setProjectStats,
  setError,
  clearError,
} = projectSlice.actions;

export default projectSlice.reducer;

