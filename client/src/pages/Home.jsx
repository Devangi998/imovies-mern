import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';

const GENRES = [
  'All',
  'Action',
  'Sci-Fi',
  'Adventure',
  'Drama',
  'Biography',
  'Animation',
  'Crime',
  'Thriller'
];

const Home = () => {
  const [movies, setMovies] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMovies();
  }, [selectedGenre]);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedGenre !== 'All') {
        params.genre = selectedGenre;
      }
      const res = await API.get('/movies', { params });
      setMovies(res.data);
      setError('');
    } catch (err) {
      console.error('Error fetching movies:', err);
      setError('Unable to load movies. Please ensure the backend server and MongoDB are running.');
    } finally {
      setLoading(false);
    }
  };

  const filteredMovies = movies.filter((movie) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      movie.title.toLowerCase().includes(query) ||
      movie.description.toLowerCase().includes(query) ||
      movie.genre.some((g) => g.toLowerCase().includes(query))
    );
  });

  return (
    <div className="pb-5">
      {/* Hero Banner */}
      <section className="hero-banner text-center mb-5">
        <div className="container py-3">
          <span className="badge bg-primary bg-opacity-25 text-primary border border-primary border-opacity-50 px-3 py-2 rounded-pill mb-3 fw-semibold">
            <i className="bi bi-stars me-1"></i> NEXT-GEN MOVIE RESERVATION
          </span>
          <h1 className="display-4 fw-extrabold text-white mb-2 tracking-tight">
            Movie Ticket Booking <span className="text-primary">Made Simple</span>
          </h1>
          <p className="lead text-secondary mx-auto mb-4" style={{ maxWidth: '650px' }}>
            Browse trending blockbusters, pick the perfect seats in real time, and confirm your cinema experience in seconds.
          </p>

          {/* Search Bar */}
          <div className="row justify-content-center">
            <div className="col-12 col-md-8 col-lg-6">
              <div className="input-group shadow-lg">
                <span className="input-group-text bg-dark text-secondary border-secondary border-opacity-50 ps-3">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control form-control-lg bg-dark text-white border-secondary border-opacity-50"
                  placeholder="Search by title, genre, or keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    className="btn btn-dark border-secondary border-opacity-50 text-secondary"
                    type="button"
                    onClick={() => setSearchQuery('')}
                  >
                    <i className="bi bi-x-lg"></i>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Catalog Container */}
      <div className="container">
        {/* Genre Filter Pills */}
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-4 pb-2 border-bottom border-secondary border-opacity-25">
          <div className="d-flex align-items-center gap-2 overflow-x-auto py-1">
            <span className="text-secondary small fw-bold text-uppercase me-2">Genre:</span>
            {GENRES.map((genre) => (
              <button
                key={genre}
                type="button"
                onClick={() => setSelectedGenre(genre)}
                className={`btn btn-sm rounded-pill px-3 py-1.5 transition-all ${
                  selectedGenre === genre
                    ? 'btn-cinema-primary shadow-sm'
                    : 'btn-outline-secondary text-light text-opacity-75'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>

          <div className="text-secondary small">
            Showing <span className="text-white fw-bold">{filteredMovies.length}</span> movies
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="alert alert-danger shadow-sm border-0 rounded-4 p-4 text-center my-4">
            <i className="bi bi-exclamation-octagon-fill fs-2 mb-2 d-block text-danger"></i>
            <h5 className="fw-bold">{error}</h5>
            <p className="small mb-3 text-white-50">Make sure your backend API is running on port 5000 and seed script was executed.</p>
            <button onClick={fetchMovies} className="btn btn-outline-danger btn-sm rounded-pill px-4">
              <i className="bi bi-arrow-clockwise me-1"></i> Retry
            </button>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && (
          <div className="row g-4 justify-content-center">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="col-12 col-sm-6 col-md-4 col-lg-4">
                <div className="cinema-card p-3 h-100 placeholder-glow">
                  <div className="placeholder col-12 rounded-3 mb-3" style={{ height: '340px' }}></div>
                  <div className="placeholder col-8 mb-2"></div>
                  <div className="placeholder col-4 mb-3"></div>
                  <div className="placeholder col-12"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Movie Grid */}
        {!loading && !error && (
          <>
            {filteredMovies.length === 0 ? (
              <div className="text-center py-5 my-4">
                <div className="display-1 text-secondary opacity-25 mb-3">
                  <i className="bi bi-camera-reels"></i>
                </div>
                <h4 className="fw-bold text-white">No Movies Found</h4>
                <p className="text-secondary">Try adjusting your search query or selecting a different genre.</p>
                <button
                  onClick={() => {
                    setSelectedGenre('All');
                    setSearchQuery('');
                  }}
                  className="btn btn-cinema-accent btn-sm rounded-pill px-4 mt-2"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="row g-4">
                {filteredMovies.map((movie) => (
                  <div key={movie._id} className="col-12 col-sm-6 col-md-4 col-lg-4 d-flex">
                    <div className="cinema-card d-flex flex-column w-100">
                      {/* Movie Poster & Rating Badge */}
                      <div className="position-relative overflow-hidden">
                        <img
                          src={movie.posterUrl}
                          alt={movie.title}
                          className="cinema-poster"
                          loading="lazy"
                        />
                        <div className="position-absolute top-0 end-0 m-3">
                          <span className="badge-rating shadow d-flex align-items-center gap-1">
                            <i className="bi bi-star-fill text-dark small"></i>
                            <span>{movie.rating ? movie.rating.toFixed(1) : '7.5'}</span>
                          </span>
                        </div>
                        <div className="position-absolute bottom-0 start-0 m-3">
                          <span className="badge bg-dark bg-opacity-75 text-light border border-secondary border-opacity-50 rounded-pill px-2.5 py-1 small">
                            <i className="bi bi-clock me-1"></i>
                            {movie.duration} mins
                          </span>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-3 d-flex flex-column flex-grow-1 justify-content-between">
                        <div>
                          <h5 className="fw-bold text-white mb-2 text-truncate" title={movie.title}>
                            {movie.title}
                          </h5>

                          {/* Genre Tags */}
                          <div className="d-flex flex-wrap gap-1 mb-2">
                            {Array.isArray(movie.genre) &&
                              movie.genre.slice(0, 3).map((g, idx) => (
                                <span key={idx} className="badge-genre">
                                  {g}
                                </span>
                              ))}
                          </div>

                          <p className="text-secondary small mb-3 line-clamp-2" style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}>
                            {movie.description}
                          </p>
                        </div>

                        {/* Card Action */}
                        <div className="pt-2 border-top border-secondary border-opacity-25 mt-2">
                          <Link
                            to={`/movie/${movie._id}`}
                            className="btn btn-cinema-primary w-100 d-flex align-items-center justify-content-center gap-2"
                          >
                            <i className="bi bi-ticket-perforated"></i>
                            <span>Book Tickets</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
