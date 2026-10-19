import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const AuthModal = ({ show, mode, onClose, onSwitchMode }) => {
  const { login, register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user'
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!show) return null;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(formData.email, formData.password);
      } else {
        await register(formData.name, formData.email, formData.password, formData.role);
      }
      onClose();
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.response?.data?.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(5px)', zIndex: 1055 }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content dark-modal shadow-lg border border-secondary border-opacity-50">
          {/* Header */}
          <div className="modal-header border-bottom border-secondary border-opacity-25 pb-3">
            <h5 className="modal-title fw-bold text-white d-flex align-items-center gap-2">
              <i className="bi bi-shield-lock-fill text-primary"></i>
              {mode === 'login' ? 'Sign In to IMovies' : 'Create an Account'}
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>

          {/* Body */}
          <div className="modal-body p-4">
            {error && (
              <div className="alert alert-danger py-2 px-3 small border-0 rounded-3 mb-3 d-flex align-items-center gap-2">
                <i className="bi bi-exclamation-triangle-fill"></i>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {mode === 'register' && (
                <div className="mb-3">
                  <label className="form-label small text-secondary fw-semibold">Full Name</label>
                  <div className="input-group">
                    <span className="input-group-text bg-secondary bg-opacity-25 border-secondary text-secondary">
                      <i className="bi bi-person"></i>
                    </span>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="form-control bg-dark text-white border-secondary"
                      placeholder="e.g. John Doe"
                    />
                  </div>
                </div>
              )}

              <div className="mb-3">
                <label className="form-label small text-secondary fw-semibold">Email Address</label>
                <div className="input-group">
                  <span className="input-group-text bg-secondary bg-opacity-25 border-secondary text-secondary">
                    <i className="bi bi-envelope"></i>
                  </span>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="form-control bg-dark text-white border-secondary"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small text-secondary fw-semibold">Password</label>
                <div className="input-group">
                  <span className="input-group-text bg-secondary bg-opacity-25 border-secondary text-secondary">
                    <i className="bi bi-key"></i>
                  </span>
                  <input
                    type="password"
                    name="password"
                    required
                    minLength="6"
                    value={formData.password}
                    onChange={handleChange}
                    className="form-control bg-dark text-white border-secondary"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {mode === 'register' && (
                <div className="mb-3">
                  <label className="form-label small text-secondary fw-semibold">Account Role</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="form-select bg-dark text-white border-secondary"
                  >
                    <option value="user">Regular User (Book Tickets)</option>
                    <option value="admin">Administrator (Manage Movies)</option>
                  </select>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="btn btn-cinema-primary w-100 py-2.5 mt-2 d-flex align-items-center justify-content-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status"></span>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <i className={mode === 'login' ? 'bi bi-box-arrow-in-right' : 'bi bi-person-check-fill'}></i>
                    <span>{mode === 'login' ? 'Sign In' : 'Complete Registration'}</span>
                  </>
                )}
              </button>
            </form>

            {/* Switch Mode Footer */}
            <div className="text-center mt-3 pt-2">
              <span className="text-secondary small">
                {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              </span>
              <button
                type="button"
                onClick={() => onSwitchMode(mode === 'login' ? 'register' : 'login')}
                className="btn btn-link text-primary p-0 text-decoration-none small fw-semibold"
              >
                {mode === 'login' ? 'Register here' : 'Sign in here'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
