const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/health_dashboard';
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const connection = mongoose.connection;
connection.once('open', () => {
  console.log('MongoDB database connection established successfully');
});

connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

// Test route to check if backend is working
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend server is working!', timestamp: new Date() });
});

// Routes
const patientRouter = require('./routes/patients');
const appointmentRouter = require('./routes/appointments');
const vaccinationRouter = require('./routes/vaccinations');
const reportRouter = require('./routes/reports');

app.use('/api/patients', patientRouter);
app.use('/api/appointments', appointmentRouter);
app.use('/api/vaccinations', vaccinationRouter);
app.use('/api/reports', reportRouter);

// Serve the main page for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port: ${PORT}`);
  console.log(`📊 MongoDB URI: ${MONGODB_URI}`);
  console.log(`🔗 Test backend: http://localhost:${PORT}/api/test`);
});