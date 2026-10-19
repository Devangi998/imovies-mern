import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import MovieDetails from './pages/MovieDetails';
import SeatMatrix from './pages/SeatMatrix';
import MyBookings from './pages/MyBookings';
import AdminAddMovie from './pages/AdminAddMovie';

function App() {
  return (
    <div className="d-flex flex-column min-vh-100 bg-dark text-light">
      {/* Universal Navigation */}
      <Navbar />

      {/* Main Content Viewport */}
      <main className="flex-grow-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/movie/:id" element={<MovieDetails />} />
          <Route path="/showtime/:id/seats" element={<SeatMatrix />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/admin/add-movie" element={<AdminAddMovie />} />
          {/* Catch-all 404 Route */}
          <Route
            path="*"
            element={
              <div className="container py-5 text-center my-5">
                <h1 className="display-1 fw-bold text-secondary opacity-50">404</h1>
                <h3 className="text-white mb-3">Page Not Found</h3>
                <p className="text-secondary mb-4">The screen you are looking for has already played or does not exist.</p>
                <Link to="/" className="btn btn-cinema-primary rounded-pill px-4">
                  Back to Showtimes
                </Link>
              </div>
            }
          />
        </Routes>
      </main>

      {/* Cinema Footer */}
      <footer className="bg-dark border-top border-secondary border-opacity-25 py-4 mt-auto">
        <div className="container">
          <div className="row align-items-center justify-content-between gy-3">
            <div className="col-12 col-md-6 text-center text-md-start">
              <div className="d-flex align-items-center justify-content-center justify-content-md-start gap-2 mb-1">
                <span className="p-1 rounded bg-primary text-white d-inline-flex align-items-center justify-content-center" style={{ width: '24px', height: '24px', fontSize: '0.75rem' }}>
                  <i className="bi bi-film"></i>
                </span>
                <span className="fw-bold text-white fs-5">
                  I<span className="text-primary">Movies</span>
                </span>
              </div>
              <p className="text-secondary small mb-0">
                Movie ticket booking made simple. Complete MERN production-ready stack.
              </p>
            </div>

            <div className="col-12 col-md-6 text-center text-md-end text-secondary small">
              <div className="d-flex justify-content-center justify-content-md-end gap-3 mb-1">
                <span className="badge bg-secondary bg-opacity-25 text-light border border-secondary border-opacity-50">
                  <i className="bi bi-shield-check text-success me-1"></i> Atomic Seat Locks
                </span>
                <span className="badge bg-secondary bg-opacity-25 text-light border border-secondary border-opacity-50">
                  <i className="bi bi-lightning-charge-fill text-warning me-1"></i> JWT Authenticated
                </span>
              </div>
              <span>&copy; {new Date().getFullYear()} IMovies Entertainment Inc. All rights reserved.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
