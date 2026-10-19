import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import BookingModal from '../components/BookingModal';
import AuthModal from '../components/AuthModal';

const ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const COLS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const SeatMatrix = () => {
  const { id: showtimeId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [showtimeData, setShowtimeData] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals state
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState('');

  useEffect(() => {
    fetchSeatMatrix();
  }, [showtimeId]);

  const fetchSeatMatrix = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/showtimes/${showtimeId}/seats`);
      setShowtimeData(res.data);
      setError('');
    } catch (err) {
      console.error('Error fetching seat matrix:', err);
      setError('Failed to load theater seat arrangement.');
    } finally {
      setLoading(false);
    }
  };

  // Helper map for quick seat status lookup
  const seatMap = React.useMemo(() => {
    const map = new Map();
    if (showtimeData?.seats) {
      showtimeData.seats.forEach((seat) => {
        map.set(seat.seatNumber, seat);
      });
    }
    return map;
  }, [showtimeData]);

  // Handle seat click
  const handleSeatClick = (seatNumber) => {
    const seat = seatMap.get(seatNumber);
    if (!seat || seat.isBooked) return; // Cannot select booked seats

    if (selectedSeats.includes(seatNumber)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seatNumber));
    } else {
      setSelectedSeats([...selectedSeats, seatNumber]);
    }
    setBookingError('');
  };

  // Pricing calculations
  const ticketPrice = showtimeData?.ticketPrice || 0;
  const totalPrice = selectedSeats.length * ticketPrice;

  // Handle proceed to checkout
  const handleProceed = () => {
    if (selectedSeats.length === 0) return;

    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    setShowBookingModal(true);
  };

  // Submit confirmed booking
  const handleConfirmBooking = async () => {
    setIsBooking(true);
    setBookingError('');

    try {
      const payload = {
        showtimeId,
        seatsBooked: selectedSeats
      };

      const res = await API.post('/bookings', payload);

      // Successfully booked! Close modal and navigate to my bookings page
      setShowBookingModal(false);
      navigate('/my-bookings', {
        state: { newBookingSuccess: true, bookingId: res.data.booking?._id }
      });
    } catch (err) {
      console.error('Booking collision or error:', err);
      const msg =
        err.response?.data?.message ||
        'Could not complete reservation. Some seats might have been booked concurrently.';
      setBookingError(msg);

      // Re-fetch seat matrix to show newly booked seats if collision happened
      fetchSeatMatrix();
    } finally {
      setIsBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center my-5">
        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}></div>
        <p className="mt-3 text-secondary">Loading theater layout & seat availability...</p>
      </div>
    );
  }

  if (error || !showtimeData) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger text-center p-5 rounded-4 shadow">
          <h4>{error || 'Showtime layout not found'}</h4>
          <Link to="/" className="btn btn-outline-danger mt-3 rounded-pill px-4">
            <i className="bi bi-arrow-left me-1"></i> Return Home
          </Link>
        </div>
      </div>
    );
  }

  const { movie, theaterName, showTime } = showtimeData;
  const formattedShowDate = new Date(showTime).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="container py-4">
      {/* Top Navigation & Info Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4 pb-3 border-bottom border-secondary border-opacity-25">
        <div className="d-flex align-items-center gap-3">
          <Link
            to={movie?._id ? `/movie/${movie._id}` : '/'}
            className="btn btn-outline-secondary btn-sm rounded-pill px-3"
          >
            <i className="bi bi-arrow-left me-1"></i> Back
          </Link>
          <div>
            <h4 className="fw-bold text-white mb-0">{movie?.title || 'Selected Movie'}</h4>
            <div className="text-secondary small d-flex align-items-center gap-2 flex-wrap">
              <span>
                <i className="bi bi-building text-info me-1"></i>
                {theaterName}
              </span>
              <span>•</span>
              <span className="text-light">
                <i className="bi bi-calendar-event text-primary me-1"></i>
                {formattedShowDate}
              </span>
            </div>
          </div>
        </div>

        <div className="text-end">
          <span className="text-secondary small d-block">Standard Price:</span>
          <span className="fs-5 fw-bold text-success">${Number(ticketPrice).toFixed(2)}</span>
        </div>
      </div>

      {/* Seat State Color Legend */}
      <div className="d-flex justify-content-center align-items-center gap-4 flex-wrap mb-4 py-2 px-3 bg-dark bg-opacity-75 rounded-pill border border-secondary border-opacity-25 mx-auto" style={{ maxWidth: '600px' }}>
        <div className="d-flex align-items-center text-secondary small">
          <span className="legend-pill" style={{ backgroundColor: 'var(--seat-available)', border: '1px solid var(--seat-available-border)' }}></span>
          <span>Available</span>
        </div>
        <div className="d-flex align-items-center text-secondary small">
          <span className="legend-pill" style={{ background: 'var(--seat-selected)', border: '1px solid var(--seat-selected-border)' }}></span>
          <span className="text-white fw-semibold">Selected</span>
        </div>
        <div className="d-flex align-items-center text-secondary small">
          <span className="legend-pill" style={{ backgroundColor: 'var(--seat-booked-bg)', border: '1px solid rgba(239, 68, 68, 0.4)' }}></span>
          <span>Booked</span>
        </div>
      </div>

      {/* Theater Auditorium Container */}
      <div className="cinema-card p-4 p-md-5 mb-5 shadow-lg border border-secondary border-opacity-25 text-center">
        {/* Curved Glowing Screen */}
        <div className="screen-container mx-auto" style={{ maxWidth: '550px' }}>
          <div className="cinema-screen"></div>
          <div className="screen-text">
            <i className="bi bi-display me-1"></i> AUDITORIUM SCREEN (ALL EYES THIS WAY)
          </div>
        </div>

        {/* 80-Seat Grid (8 Rows x 10 Columns) */}
        <div className="seat-matrix-wrapper d-flex justify-content-center">
          <div className="d-inline-flex flex-column gap-2">
            {ROWS.map((rowLetter) => (
              <div key={rowLetter} className="d-flex align-items-center gap-1 justify-content-center">
                {/* Left Row Indicator */}
                <div className="seat-row-label">{rowLetter}</div>

                {/* Left Block (Cols 1-5) */}
                <div className="d-flex gap-1.5">
                  {COLS.slice(0, 5).map((colNum) => {
                    const seatNum = `${rowLetter}${colNum}`;
                    const seat = seatMap.get(seatNum);
                    const isBooked = seat?.isBooked || false;
                    const isSelected = selectedSeats.includes(seatNum);

                    let seatClass = 'seat-available';
                    if (isBooked) seatClass = 'seat-booked';
                    else if (isSelected) seatClass = 'seat-selected';

                    return (
                      <div
                        key={seatNum}
                        onClick={() => handleSeatClick(seatNum)}
                        className={`seat ${seatClass}`}
                        title={
                          isBooked
                            ? `Seat ${seatNum} (Already Booked)`
                            : isSelected
                            ? `Seat ${seatNum} (Selected)`
                            : `Seat ${seatNum} ($${ticketPrice.toFixed(2)})`
                        }
                      >
                        {colNum}
                      </div>
                    );
                  })}
                </div>

                {/* Central Aisle Gap */}
                <div style={{ width: '28px' }} className="d-flex align-items-center justify-content-center text-secondary opacity-25">
                  •
                </div>

                {/* Right Block (Cols 6-10) */}
                <div className="d-flex gap-1.5">
                  {COLS.slice(5, 10).map((colNum) => {
                    const seatNum = `${rowLetter}${colNum}`;
                    const seat = seatMap.get(seatNum);
                    const isBooked = seat?.isBooked || false;
                    const isSelected = selectedSeats.includes(seatNum);

                    let seatClass = 'seat-available';
                    if (isBooked) seatClass = 'seat-booked';
                    else if (isSelected) seatClass = 'seat-selected';

                    return (
                      <div
                        key={seatNum}
                        onClick={() => handleSeatClick(seatNum)}
                        className={`seat ${seatClass}`}
                        title={
                          isBooked
                            ? `Seat ${seatNum} (Already Booked)`
                            : isSelected
                            ? `Seat ${seatNum} (Selected)`
                            : `Seat ${seatNum} ($${ticketPrice.toFixed(2)})`
                        }
                      >
                        {colNum}
                      </div>
                    );
                  })}
                </div>

                {/* Right Row Indicator */}
                <div className="seat-row-label">{rowLetter}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Dynamic Booking Summary Bar */}
      <div className="sticky-bottom pb-3">
        <div className="cinema-card p-3 p-md-4 shadow-2xl border border-secondary border-opacity-50 mx-auto" style={{ maxWidth: '850px', backdropFilter: 'blur(12px)', backgroundColor: 'rgba(19, 27, 46, 0.95)' }}>
          <div className="row align-items-center g-3">
            {/* Selected Seats Badges */}
            <div className="col-12 col-md-5">
              <span className="text-secondary small d-block mb-1">
                Selected Seats ({selectedSeats.length}):
              </span>
              {selectedSeats.length === 0 ? (
                <span className="text-white-50 fst-italic small">No seats selected yet</span>
              ) : (
                <div className="d-flex flex-wrap gap-1 align-items-center">
                  {selectedSeats.map((seat) => (
                    <span
                      key={seat}
                      className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1"
                    >
                      {seat}
                    </span>
                  ))}
                  <button
                    onClick={() => setSelectedSeats([])}
                    className="btn btn-link text-danger p-0 ms-2 small text-decoration-none"
                    title="Clear all"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>

            {/* Total Calculation */}
            <div className="col-6 col-md-3 text-md-center">
              <span className="text-secondary small d-block">Total Price:</span>
              <span className="fs-4 fw-extrabold text-success">${totalPrice.toFixed(2)}</span>
            </div>

            {/* Proceed Action Button */}
            <div className="col-6 col-md-4 text-end">
              <button
                onClick={handleProceed}
                disabled={selectedSeats.length === 0}
                className="btn btn-cinema-primary w-100 py-2.5 d-flex align-items-center justify-content-center gap-2 shadow"
              >
                <i className="bi bi-ticket-fill"></i>
                <span>{isAuthenticated ? 'Proceed to Book' : 'Sign In to Book'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Confirmation Modal */}
      <BookingModal
        show={showBookingModal}
        movie={movie}
        showtime={showtimeData}
        selectedSeats={selectedSeats}
        totalPrice={totalPrice}
        onClose={() => setShowBookingModal(false)}
        onConfirmBooking={handleConfirmBooking}
        isBooking={isBooking}
        errorMessage={bookingError}
      />

      {/* Auth Modal Trigger if user clicks proceed while unauthenticated */}
      <AuthModal
        show={showAuthModal}
        mode="login"
        onClose={() => setShowAuthModal(false)}
        onSwitchMode={() => {}}
      />
    </div>
  );
};

export default SeatMatrix;
