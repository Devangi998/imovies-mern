import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

const MyBookings = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const location = useLocation();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    if (location.state?.newBookingSuccess) {
      setActionSuccess('🎉 Congratulations! Your tickets have been confirmed.');
    }
  }, [location.state]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchBookings();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [isAuthenticated, authLoading]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await API.get('/bookings');
      setBookings(res.data);
      setError('');
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Could not retrieve your bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking? The seats will be released.')) {
      return;
    }

    setCancellingId(bookingId);
    try {
      await API.put(`/bookings/${bookingId}/cancel`);
      setActionSuccess('Booking cancelled successfully and seats released.');
      // Refresh list
      fetchBookings();
    } catch (err) {
      console.error('Error cancelling booking:', err);
      alert(err.response?.data?.message || 'Could not cancel booking.');
    } finally {
      setCancellingId(null);
    }
  };

  if (authLoading || (loading && isAuthenticated)) {
    return (
      <div className="container py-5 text-center my-5">
        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}></div>
        <p className="mt-3 text-secondary">Loading your booking history...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container py-5">
        <div className="cinema-card p-5 text-center mx-auto" style={{ maxWidth: '500px' }}>
          <i className="bi bi-person-lock text-warning display-3 mb-3 d-block"></i>
          <h4 className="fw-bold text-white mb-2">Authentication Required</h4>
          <p className="text-secondary mb-4">Please log in to view your confirmed movie reservations and ticket history.</p>
          <Link to="/" className="btn btn-cinema-primary rounded-pill px-4">
            Go to Home & Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom border-secondary border-opacity-25">
        <div>
          <h2 className="fw-bold text-white mb-1 d-flex align-items-center gap-2">
            <i className="bi bi-ticket-perforated-fill text-primary"></i>
            My Bookings
          </h2>
          <p className="text-secondary small mb-0">Manage your upcoming and past cinema reservations.</p>
        </div>
        <span className="badge bg-secondary bg-opacity-25 text-light border border-secondary border-opacity-50 px-3 py-2 rounded-pill">
          {bookings.length} Total Bookings
        </span>
      </div>

      {/* Success Notification Alert */}
      {actionSuccess && (
        <div className="alert alert-success alert-dismissible fade show rounded-3 border-0 py-3 px-4 mb-4 shadow" role="alert">
          <div className="d-flex align-items-center gap-2">
            <i className="bi bi-check-circle-fill fs-5"></i>
            <span>{actionSuccess}</span>
          </div>
          <button type="button" className="btn-close" onClick={() => setActionSuccess('')} aria-label="Close"></button>
        </div>
      )}

      {error && (
        <div className="alert alert-danger py-3 px-4 rounded-3 border-0 mb-4">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="cinema-card text-center p-5 my-4">
          <div className="display-1 text-secondary opacity-25 mb-3">
            <i className="bi bi-ticket-detailed"></i>
          </div>
          <h4 className="fw-bold text-white mb-2">No Bookings Yet</h4>
          <p className="text-secondary mb-4">You have not booked any movie tickets yet. Pick a movie and secure your seat!</p>
          <Link to="/" className="btn btn-cinema-primary rounded-pill px-4">
            <i className="bi bi-film me-1"></i> Browse Trending Movies
          </Link>
        </div>
      ) : (
        <div className="row g-4">
          {bookings.map((booking) => {
            const showtime = booking.showtimeId;
            const movie = showtime?.movieId;

            const showDateTime = showtime?.showTime
              ? new Date(showtime.showTime).toLocaleString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })
              : 'N/A';

            const bookingPlacedDate = new Date(booking.bookingDate || booking.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            });

            const isConfirmed = booking.status === 'confirmed';

            return (
              <div key={booking._id} className="col-12 col-lg-6">
                <div className={`cinema-card p-4 h-100 position-relative ${!isConfirmed ? 'opacity-75' : ''}`}>
                  <div className="row g-3 align-items-center">
                    {/* Movie Poster */}
                    <div className="col-4 col-sm-3 text-center">
                      <img
                        src={movie?.posterUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=400&q=80'}
                        alt={movie?.title || 'Movie'}
                        className="rounded-3 shadow w-100"
                        style={{ height: '140px', objectFit: 'cover' }}
                      />
                    </div>

                    {/* Booking Details */}
                    <div className="col-8 col-sm-9">
                      <div className="d-flex justify-content-between align-items-start mb-1">
                        <h5 className="fw-bold text-white mb-0 text-truncate" title={movie?.title}>
                          {movie?.title || 'Movie Title'}
                        </h5>
                        <span
                          className={`badge rounded-pill px-2.5 py-1 small ${
                            isConfirmed
                              ? 'bg-success bg-opacity-25 text-success border border-success border-opacity-50'
                              : 'bg-secondary bg-opacity-25 text-secondary border border-secondary border-opacity-50'
                          }`}
                        >
                          {booking.status.toUpperCase()}
                        </span>
                      </div>

                      <div className="small text-secondary mb-1">
                        <i className="bi bi-geo-alt-fill text-danger me-1"></i>
                        {showtime?.theaterName || 'Theater'}
                      </div>

                      <div className="small text-light mb-2">
                        <i className="bi bi-calendar-event text-primary me-1"></i>
                        {showDateTime}
                      </div>

                      {/* Seats & Price Breakdown */}
                      <div className="bg-dark bg-opacity-60 p-2.5 rounded-3 border border-secondary border-opacity-25 mb-2">
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="small">
                            <span className="text-secondary me-1">Seats:</span>
                            <span className="text-white fw-bold">
                              {booking.seatsBooked?.join(', ')}
                            </span>
                          </div>
                          <div className="small">
                            <span className="text-secondary me-1">Total:</span>
                            <span className="text-success fw-bold fs-6">
                              ${Number(booking.totalAmount).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Ticket Footer Meta & Actions */}
                      <div className="d-flex justify-content-between align-items-center pt-2 border-top border-secondary border-opacity-25">
                        <span className="text-secondary" style={{ fontSize: '0.72rem' }}>
                          Ref: #{booking._id.slice(-6).toUpperCase()} • Booked: {bookingPlacedDate}
                        </span>

                        {isConfirmed && (
                          <button
                            onClick={() => handleCancelBooking(booking._id)}
                            disabled={cancellingId === booking._id}
                            className="btn btn-outline-danger btn-sm py-1 px-2.5 rounded-pill"
                            style={{ fontSize: '0.75rem' }}
                          >
                            {cancellingId === booking._id ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                                Cancelling...
                              </>
                            ) : (
                              <>
                                <i className="bi bi-x-circle me-1"></i>
                                Cancel
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
