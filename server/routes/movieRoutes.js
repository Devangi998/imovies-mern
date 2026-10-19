const express = require('express');
const router = express.Router();
const { getAllMovies, getMovieById, addMovie } = require('../controllers/movieController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

router.get('/', getAllMovies);
router.get('/:id', getMovieById);
router.post('/', verifyToken, isAdmin, addMovie);

module.exports = router;
