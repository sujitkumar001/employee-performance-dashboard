// ============================================
// FILE: frontend/src/redux/slices/taskSlice.js
// ============================================
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  tasks: [],
  myTasks: [],
  currentTask: null,
  loading: false,
  error: null,
  stats: null,
};

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setTasks: (state, action) => {
      state.tasks = action.payload;
      state.loading = false;
      state.error = null;
    },
    setMyTasks: (state, action) => {
      state.myTasks = action.payload;
      state.loading = false;
    },
    setCurrentTask: (state, action) => {
      state.currentTask = action.payload;
      state.loading = false;
    },
    addTask: (state, action) => {
      state.tasks.unshift(action.payload);
    },
    updateTask: (state, action) => {
      const index = state.tasks.findIndex(t => t._id === action.payload._id);
      if (index !== -1) {
        state.tasks[index] = action.payload;
      }
      const myIndex = state.myTasks.findIndex(t => t._id === action.payload._id);
      if (myIndex !== -1) {
        state.myTasks[myIndex] = action.payload;
      }
      if (state.currentTask?._id === action.payload._id) {
        state.currentTask = action.payload;
      }
    },
    deleteTask: (state, action) => {
      state.tasks = state.tasks.filter(t => t._id !== action.payload);
      state.myTasks = state.myTasks.filter(t => t._id !== action.payload);
    },
    setTaskStats: (state, action) => {
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
  setTasks,
  setMyTasks,
  setCurrentTask,
  addTask,
  updateTask,
  deleteTask,
  setTaskStats,
  setError,
  clearError,
} = taskSlice.actions;

export default taskSlice.reducer;
