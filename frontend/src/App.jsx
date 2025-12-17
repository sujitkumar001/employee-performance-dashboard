import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Tasks from './pages/Tasks';
import Employees from './pages/Employees';
import Performance from './pages/Performance';

function App() {
  const { user } = useSelector((state) => state.auth);

  return (
    <Router>
      {!user ? (
        // Public Routes
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      ) : (
        // Protected Private Routes
        <div className="min-h-screen bg-gray-50">
          <Sidebar />
          <main className="transition-all duration-300 md:ml-64 pt-16 md:pt-0">
            <div className="p-4 md:p-6">
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/tasks" element={<Tasks />} />
                <Route path="/employees" element={<Employees />} />
                <Route path="/performance" element={<Performance />} />
                {/* Redirect from home or register to dashboard if logged in */}
                <Route path="/register" element={<Navigate to="/dashboard" />} />
                <Route path="/login" element={<Navigate to="/dashboard" />} />
                <Route path="/" element={<Navigate to="/dashboard" />} />
                <Route path="*" element={<Navigate to="/dashboard" />} />
              </Routes>
            </div>
          </main>
        </div>
      )}
    </Router>
  );
}

export default App;