import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register'; // Import Register
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Tasks from './pages/Tasks';
import Employees from './pages/Employees';
import Performance from './pages/Performance';

function App() {
  const { user } = useSelector((state) => state.auth);

  if (!user) {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} /> {/* NEW ROUTE */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/performance" element={<Performance />} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;