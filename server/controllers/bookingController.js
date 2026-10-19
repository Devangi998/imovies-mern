const Booking = require('../models/Booking');
const Showtime = require('../models/Showtime');

// @desc    Create a new booking with atomic seat reservation & collision prevention
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res) => {
  try {
    const { showtimeId, seatsBooked } = req.body;

    if (!showtimeId || !seatsBooked || !Array.isArray(seatsBooked) || seatsBooked.length === 0) {
      return res.status(400).json({ message: 'Please provide showtimeId and a non-empty array of seatsBooked' });
    }

    // 1. Verify showtime exists
    const showtime = await Showtime.findById(showtimeId).populate('movieId', 'title posterUrl');
    if (!showtime) {
      return res.status(404).json({ message: 'Showtime not found' });
    }

    // 2. Validate all requested seat numbers exist in the showtime's seats
    const existingSeatMap = new Map();
    showtime.seats.forEach((s) => existingSeatMap.set(s.seatNumber, s));

    for (const seatNum of seatsBooked) {
      if (!existingSeatMap.has(seatNum)) {
        return res.status(400).json({ message: `Seat ${seatNum} does not exist in this auditorium.` });
      }
    }

    // 3. Collision check: Check if any seat is already booked
    const alreadyBooked = seatsBooked.filter(
      (seatNum) => existingSeatMap.get(seatNum)?.isBooked === true
    );

    if (alreadyBooked.length > 0) {
      return res.status(409).json({
        message: `Collision detected: The following seat(s) are already booked: ${alreadyBooked.join(', ')}`,
        conflictedSeats: alreadyBooked
      });
    }

    // 4. Calculate total amount
    const totalAmount = showtime.ticketPrice * seatsBooked.length;

    // 5. ATOMIC UPDATE: Reserve seats in a single atomic findOneAndUpdate operation
    // The query condition ensures NO selected seat is currently booked at the exact instant of execution
    const updatedShowtime = await Showtime.findOneAndUpdate(
      {
        _id: showtimeId,
        seats: {
          $not: {
            $elemMatch: {
              seatNumber: { $in: seatsBooked },
              isBooked: true
            }
          }
        }
      },
      {
        $set: {
          'seats.$[elem].isBooked': true,
          'seats.$[elem].bookedBy': req.user._id
        }
      },
      {
        arrayFilters: [{ 'elem.seatNumber': { $in: seatsBooked } }],
        new: true
      }
    );

    // If update returned null, a concurrent booking reserved one or more seats in that exact millisecond
    if (!updatedShowtime) {
      return res.status(409).json({
        message: 'Seat booking collision: One or more selected seats were just reserved by another customer. Please select different seats.'
      });
    }

    // 6. Create booking record
    const booking = await Booking.create({
      userId: req.user._id,
      showtimeId,
      seatsBooked,
      totalAmount,
      bookingDate: new Date(),
      status: 'confirmed'
    });

    const populatedBooking = await Booking.findById(booking._id).populate({
      path: 'showtimeId',
      populate: { path: 'movieId', select: 'title posterUrl duration rating genre' }
    });

    return res.status(201).json({
      message: 'Booking confirmed successfully!',
      booking: populatedBooking
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    return res.status(500).json({ message: error.message || 'Server error while processing booking' });
  }
};

// @desc    Get user's confirmed and past bookings
// @route   GET /api/bookings
// @access  Private
const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .populate({
        path: 'showtimeId',
        populate: { path: 'movieId', select: 'title posterUrl duration rating genre' }
      })
      .sort({ createdAt: -1 });

    return res.status(200).json(bookings);
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    return res.status(500).json({ message: error.message || 'Error retrieving bookings' });
  }
};

// @desc    Cancel a booking and free up the seats
// @route   PUT /api/bookings/:id/cancel
// @access  Private
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Verify ownership
    if (booking.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'This booking is already cancelled' });
    }

    // Update booking status
    booking.status = 'cancelled';
    await booking.save();

    // Release seats in Showtime
    await Showtime.updateOne(
      { _id: booking.showtimeId },
      {
        $set: {
          'seats.$[elem].isBooked': false,
          'seats.$[elem].bookedBy': null
        }
      },
      {
        arrayFilters: [{ 'elem.seatNumber': { $in: booking.seatsBooked } }]
      }
    );

    return res.status(200).json({
      message: 'Booking cancelled successfully. Seats have been made available.',
      booking
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return res.status(500).json({ message: error.message || 'Error cancelling booking' });
  }
};

module.exports = {
  createBooking,
  getUserBookings,
  cancelBooking
};
