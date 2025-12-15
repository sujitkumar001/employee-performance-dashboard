// ============================================
// FILE: frontend/src/redux/slices/employeeSlice.js
// ============================================
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  employees: [],
  currentEmployee: null,
  loading: false,
  error: null,
  stats: null,
};

const employeeSlice = createSlice({
  name: 'employees',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setEmployees: (state, action) => {
      state.employees = action.payload;
      state.loading = false;
      state.error = null;
    },
    setCurrentEmployee: (state, action) => {
      state.currentEmployee = action.payload;
      state.loading = false;
    },
    updateEmployee: (state, action) => {
      const index = state.employees.findIndex(e => e._id === action.payload._id);
      if (index !== -1) {
        state.employees[index] = action.payload;
      }
    },
    setEmployeeStats: (state, action) => {
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
  setEmployees,
  setCurrentEmployee,
  updateEmployee,
  setEmployeeStats,
  setError,
  clearError,
} = employeeSlice.actions;

export default employeeSlice.reducer;