const express = require('express');
const router = express.Router();
const {
  getShowtimesByMovie,
  getSeatMatrix,
  createShowtime
} = require('../controllers/showtimeController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// Get all or filter by query: GET /api/showtimes?movieId=xyz
router.get('/', getShowtimesByMovie);

// Get showtimes by movie ID: GET /api/showtimes/movie/:movieId
router.get('/movie/:movieId', getShowtimesByMovie);

// Get seat matrix for a showtime: GET /api/showtimes/:id/seats or GET /api/showtimes/:id
router.get('/:id/seats', getSeatMatrix);
router.get('/:id', getSeatMatrix);

// Create showtime (admin only)
router.post('/', verifyToken, isAdmin, createShowtime);

module.exports = router;
