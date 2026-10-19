const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

// Connect to MongoDB
connectDB();

const app = express();

// Middlewares
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logger (Development)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/movies', require('./routes/movieRoutes'));
app.use('/api/showtimes', require('./routes/showtimeRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));

// Health check endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: '🎬 IMovies API - Movie ticket booking made simple is running smoothly.',
    timestamp: new Date()
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    message: `Resource not found: ${req.originalUrl}`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Application Error:', err);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 IMovies Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
