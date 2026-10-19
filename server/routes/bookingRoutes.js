const express = require('express');
const router = express.Router();
const {
  createBooking,
  getUserBookings,
  cancelBooking
} = require('../controllers/bookingController');
const { verifyToken } = require('../middleware/authMiddleware');

// All booking routes require authentication
router.use(verifyToken);

router.post('/', createBooking);
router.get('/', getUserBookings);
router.put('/:id/cancel', cancelBooking);

module.exports = router;
