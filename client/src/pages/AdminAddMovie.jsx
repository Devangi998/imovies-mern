import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

const AdminAddMovie = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    genre: 'Action, Sci-Fi',
    duration: 150,
    releaseDate: new Date().toISOString().split('T')[0],
    posterUrl: '',
    rating: 8.5
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isAdmin) {
    return (
      <div className="container py-5 text-center">
        <div className="cinema-card p-5 mx-auto" style={{ maxWidth: '500px' }}>
          <i className="bi bi-shield-x text-danger display-3 mb-3 d-block"></i>
          <h3 className="fw-bold text-white mb-2">Access Denied</h3>
          <p className="text-secondary mb-4">You need Administrator privileges to add new movies to the catalog.</p>
          <Link to="/" className="btn btn-cinema-primary rounded-pill px-4">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        ...formData,
        duration: Number(formData.duration),
        rating: Number(formData.rating)
      };

      const res = await API.post('/movies', payload);
      setSuccess('Movie added successfully! Redirecting...');
      setTimeout(() => {
        navigate(`/movie/${res.data.movie?._id || ''}`);
      }, 1200);
    } catch (err) {
      console.error('Error adding movie:', err);
      setError(err.response?.data?.message || 'Failed to create movie.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="mb-4">
        <Link to="/" className="btn btn-outline-secondary btn-sm rounded-pill px-3">
          <i className="bi bi-arrow-left me-1"></i> Back to Home
        </Link>
      </div>

      <div className="cinema-card p-4 p-md-5 mx-auto shadow-lg border border-secondary border-opacity-25" style={{ maxWidth: '750px' }}>
        <div className="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom border-secondary border-opacity-25">
          <div>
            <h3 className="fw-bold text-white mb-1 d-flex align-items-center gap-2">
              <i className="bi bi-film text-warning"></i>
              Add New Movie (Admin)
            </h3>
            <p className="text-secondary small mb-0">Publish a new film title to the IMovies catalog.</p>
          </div>
          <span className="badge bg-warning bg-opacity-25 text-warning border border-warning border-opacity-50 px-3 py-1.5 rounded-pill">
            Admin Mode
          </span>
        </div>

        {error && (
          <div className="alert alert-danger py-2 px-3 small rounded-3 mb-3">
            <i className="bi bi-exclamation-triangle-fill me-1"></i> {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success py-2 px-3 small rounded-3 mb-3">
            <i className="bi bi-check-circle-fill me-1"></i> {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-12">
              <label className="form-label text-secondary small fw-semibold">Movie Title</label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Gladiator II"
                className="form-control bg-dark text-white border-secondary"
              />
            </div>

            <div className="col-12">
              <label className="form-label text-secondary small fw-semibold">Poster Image URL</label>
              <input
                type="url"
                name="posterUrl"
                required
                value={formData.posterUrl}
                onChange={handleChange}
                placeholder="https://images.unsplash.com/..."
                className="form-control bg-dark text-white border-secondary"
              />
              <div className="form-text text-secondary" style={{ fontSize: '0.75rem' }}>
                Paste a direct image link (e.g. Unsplash or TMDB image)
              </div>
            </div>

            <div className="col-12">
              <label className="form-label text-secondary small fw-semibold">Synopsis / Description</label>
              <textarea
                name="description"
                rows="4"
                required
                value={formData.description}
                onChange={handleChange}
                placeholder="Detailed movie summary..."
                className="form-control bg-dark text-white border-secondary"
              ></textarea>
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label text-secondary small fw-semibold">Genres (Comma separated)</label>
              <input
                type="text"
                name="genre"
                required
                value={formData.genre}
                onChange={handleChange}
                placeholder="Action, Sci-Fi, Drama"
                className="form-control bg-dark text-white border-secondary"
              />
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label text-secondary small fw-semibold">Duration (Minutes)</label>
              <input
                type="number"
                name="duration"
                min="30"
                max="360"
                required
                value={formData.duration}
                onChange={handleChange}
                className="form-control bg-dark text-white border-secondary"
              />
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label text-secondary small fw-semibold">Release Date</label>
              <input
                type="date"
                name="releaseDate"
                required
                value={formData.releaseDate}
                onChange={handleChange}
                className="form-control bg-dark text-white border-secondary"
              />
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label text-secondary small fw-semibold">Rating (0 - 10)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                name="rating"
                required
                value={formData.rating}
                onChange={handleChange}
                className="form-control bg-dark text-white border-secondary"
              />
            </div>
          </div>

          <div className="mt-4 pt-3 border-top border-secondary border-opacity-25 text-end">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-cinema-primary px-4 py-2 d-inline-flex align-items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status"></span>
                  <span>Saving Movie...</span>
                </>
              ) : (
                <>
                  <i className="bi bi-plus-lg"></i>
                  <span>Add Movie to Catalog</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminAddMovie;
