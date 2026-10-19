const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema(
  {
    seatNumber: {
      type: String,
      required: true
    },
    isBooked: {
      type: Boolean,
      default: false
    },
    bookedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { _id: false }
);

const showtimeSchema = new mongoose.Schema(
  {
    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: [true, 'Movie reference is required']
    },
    theaterName: {
      type: String,
      required: [true, 'Theater name is required'],
      trim: true
    },
    showTime: {
      type: Date,
      required: [true, 'Show time is required']
    },
    ticketPrice: {
      type: Number,
      required: [true, 'Ticket price is required'],
      min: 0
    },
    seats: {
      type: [seatSchema],
      default: []
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Showtime', showtimeSchema);
