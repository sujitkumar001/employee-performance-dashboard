import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Sidebar from './components/Sidebar'; // ✅ Import Sidebar directly
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Tasks from './pages/Tasks';
import Employees from './pages/Employees';
import Performance from './pages/Performance';

function App() {
  const { user } = useSelector((state) => state.auth);

  // 1. If NOT logged in, show full-screen Login/Register
  if (!user) {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    );
  }

  // 2. If Logged in, show Sidebar + Main Content
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Sidebar Component (Fixed position) */}
        <Sidebar />

        {/* MAIN CONTENT WRAPPER 
           - md:ml-64: Pushes content right on Desktop (to make room for Sidebar)
           - pt-16: Pushes content down on Mobile (to make room for the Header)
           - md:pt-0: Removes top padding on Desktop
        */}
        <main className="transition-all duration-300 md:ml-64 pt-16 md:pt-0">
          <div className="p-4 md:p-6">
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/employees" element={<Employees />} />
              <Route path="/performance" element={<Performance />} />
              <Route path="/" element={<Navigate to="/dashboard" />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;