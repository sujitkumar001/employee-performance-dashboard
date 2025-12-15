// ============================================
// FILE: frontend/src/redux/slices/performanceSlice.js
// ============================================
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  evaluations: [],
  myEvaluations: [],
  currentEvaluation: null,
  loading: false,
  error: null,
  stats: null,
};

const performanceSlice = createSlice({
  name: 'performance',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setEvaluations: (state, action) => {
      state.evaluations = action.payload;
      state.loading = false;
      state.error = null;
    },
    setMyEvaluations: (state, action) => {
      state.myEvaluations = action.payload;
      state.loading = false;
    },
    setCurrentEvaluation: (state, action) => {
      state.currentEvaluation = action.payload;
      state.loading = false;
    },
    addEvaluation: (state, action) => {
      state.evaluations.unshift(action.payload);
    },
    updateEvaluation: (state, action) => {
      const index = state.evaluations.findIndex(e => e._id === action.payload._id);
      if (index !== -1) {
        state.evaluations[index] = action.payload;
      }
      if (state.currentEvaluation?._id === action.payload._id) {
        state.currentEvaluation = action.payload;
      }
    },
    setPerformanceStats: (state, action) => {
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
  setEvaluations,
  setMyEvaluations,
  setCurrentEvaluation,
  addEvaluation,
  updateEvaluation,
  setPerformanceStats,
  setError,
  clearError,
} = performanceSlice.actions;

export default performanceSlice.reducer;
