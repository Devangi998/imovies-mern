import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMovieAndShowtimes = async () => {
      try {
        setLoading(true);
        // Fetch movie details and showtimes concurrently
        const [movieRes, showtimesRes] = await Promise.all([
          API.get(`/movies/${id}`),
          API.get(`/showtimes/movie/${id}`)
        ]);

        setMovie(movieRes.data);
        setShowtimes(showtimesRes.data);
      } catch (err) {
        console.error('Error fetching movie details:', err);
        setError('Could not load movie information or showtimes.');
      } finally {
        setLoading(false);
      }
    };

    fetchMovieAndShowtimes();
  }, [id]);

  if (loading) {
    return (
      <div className="container py-5 text-center my-5">
        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}></div>
        <p className="mt-3 text-secondary">Loading movie & showtime schedule...</p>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger text-center p-5 rounded-4 shadow">
          <h4>{error || 'Movie not found'}</h4>
          <Link to="/" className="btn btn-outline-danger mt-3 rounded-pill px-4">
            <i className="bi bi-arrow-left me-1"></i> Back to Movie Catalog
          </Link>
        </div>
      </div>
    );
  }

  const formattedRelease = new Date(movie.releaseDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="container py-4">
      {/* Back button */}
      <div className="mb-4">
        <Link to="/" className="btn btn-outline-secondary btn-sm rounded-pill px-3 d-inline-flex align-items-center gap-1">
          <i className="bi bi-arrow-left"></i>
          <span>Back to Catalog</span>
        </Link>
      </div>

      {/* Movie Synopsis & Metadata Banner */}
      <div className="cinema-card p-4 p-md-5 mb-5 border-0 shadow-lg position-relative overflow-hidden">
        <div className="row g-4 align-items-center">
          {/* Poster */}
          <div className="col-12 col-md-4 col-lg-3 text-center">
            <img
              src={movie.posterUrl}
              alt={movie.title}
              className="img-fluid rounded-4 shadow-lg border border-secondary border-opacity-25"
              style={{ maxHeight: '420px', width: '100%', objectFit: 'cover' }}
            />
          </div>

          {/* Details */}
          <div className="col-12 col-md-8 col-lg-9">
            <div className="d-flex align-items-center gap-3 flex-wrap mb-2">
              <span className="badge-rating d-inline-flex align-items-center gap-1 fs-6">
                <i className="bi bi-star-fill text-dark"></i>
                <span>{movie.rating ? movie.rating.toFixed(1) : '7.5'} / 10</span>
              </span>
              <span className="text-secondary small">
                <i className="bi bi-clock me-1 text-primary"></i>
                {movie.duration} minutes
              </span>
              <span className="text-secondary small">
                <i className="bi bi-calendar3 me-1 text-primary"></i>
                Released {formattedRelease}
              </span>
            </div>

            <h1 className="display-5 fw-extrabold text-white mb-3">{movie.title}</h1>

            {/* Genres */}
            <div className="d-flex flex-wrap gap-2 mb-4">
              {Array.isArray(movie.genre) &&
                movie.genre.map((g, idx) => (
                  <span key={idx} className="badge-genre px-3 py-1.5 fs-6">
                    {g}
                  </span>
                ))}
            </div>

            {/* Synopsis */}
            <div className="mb-4">
              <h5 className="text-white-50 text-uppercase tracking-wider small fw-bold mb-2">
                Synopsis
              </h5>
              <p className="lead text-light text-opacity-90 fs-6" style={{ lineHeight: '1.7' }}>
                {movie.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Showtime Selector Section */}
      <div className="mb-5">
        <div className="d-flex align-items-center justify-content-between mb-4 border-bottom border-secondary border-opacity-25 pb-3">
          <div>
            <h3 className="fw-bold text-white mb-1 d-flex align-items-center gap-2">
              <i className="bi bi-clock-history text-primary"></i>
              Available Theaters & Showtimes
            </h3>
            <p className="text-secondary small mb-0">Select an auditorium and time slot to pick your seats.</p>
          </div>
          <span className="badge bg-primary bg-opacity-25 text-primary border border-primary border-opacity-50 px-3 py-2 rounded-pill">
            {showtimes.length} Screenings Active
          </span>
        </div>

        {showtimes.length === 0 ? (
          <div className="alert alert-secondary text-center p-5 rounded-4 bg-dark border-secondary">
            <i className="bi bi-calendar-x fs-1 text-secondary mb-2 d-block"></i>
            <h5 className="text-white">No active showtimes found for this title</h5>
            <p className="text-secondary small">Please check back soon or browse other available movies.</p>
            <Link to="/" className="btn btn-cinema-primary btn-sm rounded-pill px-4 mt-2">
              Explore Other Movies
            </Link>
          </div>
        ) : (
          <div className="row g-3">
            {showtimes.map((st) => {
              const showDate = new Date(st.showTime);
              const formattedDateStr = showDate.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
              });
              const formattedTimeStr = showDate.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
              });

              // Available seats calculation
              const totalSeats = st.seats?.length || 80;
              const bookedSeatsCount = st.seats?.filter((s) => s.isBooked)?.length || 0;
              const availableSeatsCount = totalSeats - bookedSeatsCount;

              return (
                <div key={st._id} className="col-12 col-lg-6">
                  <div className="cinema-card p-4 h-100 d-flex flex-column justify-content-between">
                    <div>
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h5 className="fw-bold text-white mb-0 d-flex align-items-center gap-2">
                          <i className="bi bi-building text-info"></i>
                          {st.theaterName}
                        </h5>
                        <span className="badge bg-success bg-opacity-25 text-success border border-success border-opacity-50 px-2.5 py-1.5 rounded-pill fw-bold">
                          ${Number(st.ticketPrice).toFixed(2)}
                        </span>
                      </div>

                      <div className="d-flex align-items-center gap-3 text-secondary small mb-3">
                        <span className="d-flex align-items-center gap-1 text-light">
                          <i className="bi bi-calendar-date text-primary"></i>
                          {formattedDateStr}
                        </span>
                        <span className="d-flex align-items-center gap-1 text-warning fw-semibold">
                          <i className="bi bi-clock-fill"></i>
                          {formattedTimeStr}
                        </span>
                      </div>

                      <div className="d-flex align-items-center justify-content-between bg-dark bg-opacity-50 p-2.5 rounded-3 border border-secondary border-opacity-25 mb-3">
                        <span className="small text-secondary">
                          Auditorium Capacity: <strong className="text-white">{totalSeats} seats</strong>
                        </span>
                        <span className="badge bg-info bg-opacity-25 text-info border border-info border-opacity-50">
                          {availableSeatsCount} Available
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => navigate(`/showtime/${st._id}/seats`)}
                      className="btn btn-cinema-primary w-100 d-flex align-items-center justify-content-center gap-2"
                    >
                      <i className="bi bi-grid-3x3-gap-fill"></i>
                      <span>Select Seats for this Show</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieDetails;
