const Showtime = require('../models/Showtime');

// Helper to generate standard 80 seats (Rows A-H, Cols 1-10)
const generate80Seats = () => {
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const seats = [];
  for (const row of rows) {
    for (let col = 1; col <= 10; col++) {
      seats.push({
        seatNumber: `${row}${col}`,
        isBooked: false,
        bookedBy: null
      });
    }
  }
  return seats;
};

// @desc    Get showtimes by movieId or all showtimes
// @route   GET /api/showtimes OR GET /api/showtimes/movie/:movieId
// @access  Public
const getShowtimesByMovie = async (req, res) => {
  try {
    const movieId = req.params.movieId || req.query.movieId;
    const filter = movieId ? { movieId } : {};

    const showtimes = await Showtime.find(filter)
      .populate('movieId', 'title posterUrl duration rating')
      .sort({ showTime: 1 });

    return res.status(200).json(showtimes);
  } catch (error) {
    console.error('Error fetching showtimes:', error);
    return res.status(500).json({ message: error.message || 'Error fetching showtimes' });
  }
};

// @desc    Get seat matrix for a specific showtime
// @route   GET /api/showtimes/:id/seats OR GET /api/showtimes/:id
// @access  Public
const getSeatMatrix = async (req, res) => {
  try {
    const showtime = await Showtime.findById(req.params.id).populate(
      'movieId',
      'title posterUrl duration rating genre'
    );

    if (!showtime) {
      return res.status(404).json({ message: 'Showtime not found' });
    }

    return res.status(200).json({
      _id: showtime._id,
      movie: showtime.movieId,
      theaterName: showtime.theaterName,
      showTime: showtime.showTime,
      ticketPrice: showtime.ticketPrice,
      totalSeats: showtime.seats.length,
      availableSeatsCount: showtime.seats.filter((s) => !s.isBooked).length,
      bookedSeatsCount: showtime.seats.filter((s) => s.isBooked).length,
      seats: showtime.seats
    });
  } catch (error) {
    console.error('Error fetching seat matrix:', error);
    return res.status(500).json({ message: error.message || 'Error fetching seat matrix' });
  }
};

// @desc    Create a new showtime (Admin only)
// @route   POST /api/showtimes
// @access  Private (Admin only)
const createShowtime = async (req, res) => {
  try {
    const { movieId, theaterName, showTime, ticketPrice } = req.body;

    if (!movieId || !theaterName || !showTime || !ticketPrice) {
      return res.status(400).json({ message: 'Please provide movieId, theaterName, showTime, and ticketPrice' });
    }

    const seats = generate80Seats();

    const showtime = await Showtime.create({
      movieId,
      theaterName,
      showTime: new Date(showTime),
      ticketPrice: Number(ticketPrice),
      seats
    });

    return res.status(201).json({
      message: 'Showtime created successfully with 80-seat grid',
      showtime
    });
  } catch (error) {
    console.error('Error creating showtime:', error);
    return res.status(500).json({ message: error.message || 'Error creating showtime' });
  }
};

module.exports = {
  getShowtimesByMovie,
  getSeatMatrix,
  createShowtime,
  generate80Seats
};
