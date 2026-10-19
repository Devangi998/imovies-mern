const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Movie title is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Movie description is required'],
      trim: true
    },
    genre: {
      type: [String],
      required: [true, 'At least one genre is required'],
      default: []
    },
    duration: {
      type: Number, // duration in minutes
      required: [true, 'Duration in minutes is required']
    },
    releaseDate: {
      type: Date,
      default: Date.now
    },
    posterUrl: {
      type: String,
      required: [true, 'Poster URL is required']
    },
    rating: {
      type: Number,
      min: 0,
      max: 10,
      default: 7.5
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Movie', movieSchema);
