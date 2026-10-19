import React from 'react';

const BookingModal = ({
  show,
  movie,
  showtime,
  selectedSeats,
  totalPrice,
  onClose,
  onConfirmBooking,
  isBooking,
  errorMessage
}) => {
  if (!show) return null;

  const formattedDate = showtime?.showTime
    ? new Date(showtime.showTime).toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : '';

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(6px)', zIndex: 1055 }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content dark-modal shadow-lg border border-secondary border-opacity-50">
          {/* Header */}
          <div className="modal-header border-bottom border-secondary border-opacity-25 pb-3">
            <h5 className="modal-title fw-bold text-white d-flex align-items-center gap-2">
              <i className="bi bi-ticket-perforated-fill text-success"></i>
              Confirm Ticket Reservation
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              disabled={isBooking}
              aria-label="Close"
            ></button>
          </div>

          {/* Body */}
          <div className="modal-body p-4">
            {errorMessage && (
              <div className="alert alert-danger py-2 px-3 small border-0 rounded-3 mb-3 d-flex align-items-center gap-2">
                <i className="bi bi-exclamation-triangle-fill"></i>
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Movie & Theater Quick Summary */}
            <div className="d-flex gap-3 align-items-center bg-secondary bg-opacity-10 p-3 rounded-3 border border-secondary border-opacity-25 mb-3">
              {movie?.posterUrl && (
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="rounded-2 shadow-sm"
                  style={{ width: '60px', height: '80px', objectFit: 'cover' }}
                />
              )}
              <div className="flex-grow-1">
                <h6 className="fw-bold text-white mb-1">{movie?.title}</h6>
                <div className="small text-secondary mb-1">
                  <i className="bi bi-geo-alt-fill text-danger me-1"></i>
                  {showtime?.theaterName}
                </div>
                <div className="small text-info">
                  <i className="bi bi-calendar-event me-1"></i>
                  {formattedDate}
                </div>
              </div>
            </div>

            {/* Seats Chosen */}
            <div className="mb-3">
              <label className="text-secondary small fw-semibold text-uppercase tracking-wider">
                Selected Seats ({selectedSeats.length})
              </label>
              <div className="d-flex flex-wrap gap-1 mt-1">
                {selectedSeats.map((seat) => (
                  <span
                    key={seat}
                    className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1 fs-6"
                  >
                    {seat}
                  </span>
                ))}
              </div>
            </div>

            {/* Pricing Summary Breakdown */}
            <div className="border-top border-secondary border-opacity-25 pt-3 mt-3">
              <div className="d-flex justify-content-between text-secondary small mb-1">
                <span>Standard Ticket Price:</span>
                <span>${Number(showtime?.ticketPrice || 0).toFixed(2)} / seat</span>
              </div>
              <div className="d-flex justify-content-between text-secondary small mb-2">
                <span>Quantity:</span>
                <span>{selectedSeats.length} seats</span>
              </div>
              <div className="d-flex justify-content-between text-white fw-bold fs-5 pt-2 border-top border-secondary border-opacity-25">
                <span>Total Amount:</span>
                <span className="text-success">${Number(totalPrice || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="modal-footer border-top border-secondary border-opacity-25">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm px-3"
              onClick={onClose}
              disabled={isBooking}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-cinema-primary btn-sm px-4 d-flex align-items-center gap-2"
              onClick={onConfirmBooking}
              disabled={isBooking || selectedSeats.length === 0}
            >
              {isBooking ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status"></span>
                  <span>Confirming Reservation...</span>
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle-fill"></i>
                  <span>Confirm & Book Now</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
