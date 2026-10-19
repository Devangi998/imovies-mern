const Movie = require('../models/Movie');

// @desc    Get all movies
// @route   GET /api/movies
// @access  Public
const getAllMovies = async (req, res) => {
  try {
    const { genre, search } = req.query;
    let query = {};

    if (genre && genre !== 'All') {
      query.genre = { $regex: new RegExp(genre, 'i') };
    }

    if (search) {
      query.$or = [
        { title: { $regex: new RegExp(search, 'i') } },
        { description: { $regex: new RegExp(search, 'i') } }
      ];
    }

    const movies = await Movie.find(query).sort({ releaseDate: -1, createdAt: -1 });
    return res.status(200).json(movies);
  } catch (error) {
    console.error('Error fetching movies:', error);
    return res.status(500).json({ message: error.message || 'Error fetching movies' });
  }
};

// @desc    Get movie by ID
// @route   GET /api/movies/:id
// @access  Public
const getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }
    return res.status(200).json(movie);
  } catch (error) {
    console.error('Error fetching movie by ID:', error);
    return res.status(500).json({ message: error.message || 'Error fetching movie' });
  }
};

// @desc    Add new movie
// @route   POST /api/movies
// @access  Private (Admin only)
const addMovie = async (req, res) => {
  try {
    const { title, description, genre, duration, releaseDate, posterUrl, rating } = req.body;

    if (!title || !description || !posterUrl || !duration) {
      return res.status(400).json({ message: 'Please provide title, description, duration, and posterUrl' });
    }

    let parsedGenre = genre;
    if (typeof genre === 'string') {
      parsedGenre = genre.split(',').map((g) => g.trim()).filter(Boolean);
    }

    const movie = await Movie.create({
      title,
      description,
      genre: parsedGenre && parsedGenre.length > 0 ? parsedGenre : ['Action'],
      duration: Number(duration),
      releaseDate: releaseDate ? new Date(releaseDate) : new Date(),
      posterUrl,
      rating: rating ? Number(rating) : 7.5
    });

    return res.status(201).json({
      message: 'Movie added successfully',
      movie
    });
  } catch (error) {
    console.error('Error adding movie:', error);
    return res.status(500).json({ message: error.message || 'Error creating movie' });
  }
};

module.exports = {
  getAllMovies,
  getMovieById,
  addMovie
};
