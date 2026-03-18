const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { initDB } = require('./db');

// Import routes
const authRoutes = require('./routes/auth');
const roomRoutes = require('./routes/rooms');
const reservationRoutes = require('./routes/reservations');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve uploaded images as static files
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Initialize Database connection and create tables if they do not exist
initDB();

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the Hotel Management API');
});

// Use routes
app.use('/', authRoutes); // Includes register, login, me
app.use('/rooms', roomRoutes);
app.use('/reservations', reservationRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
