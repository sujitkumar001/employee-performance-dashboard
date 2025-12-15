
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const path = require('path'); 

dotenv.config();


const app = express();


connectDB();


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 Employee Performance Dashboard API',
    status: 'Server is running',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      employees: '/api/employees',
      projects: '/api/projects',
      tasks: '/api/tasks',
      performance: '/api/performance'
    }
  });
});


app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
 

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/employees', require('./routes/employeeRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/performance', require('./routes/performanceRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));


app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'Route not found',
    requestedUrl: req.originalUrl
  });
});
 

app.use(errorHandler);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Serving Uploads at: http://localhost:${PORT}/uploads/`);
});