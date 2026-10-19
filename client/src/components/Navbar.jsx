import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const navigate = useNavigate();

  const handleOpenAuth = (mode) => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top border-bottom border-secondary border-opacity-25 py-3">
        <div className="container">
          {/* Brand Logo */}
          <Link to="/" className="navbar-brand d-flex align-items-center gap-2 fw-bold fs-4 text-white">
            <span className="p-2 rounded-3 bg-primary text-white d-inline-flex align-items-center justify-content-center shadow-sm" style={{ width: '38px', height: '38px' }}>
              <i className="bi bi-film"></i>
            </span>
            <span className="tracking-wide">
              I<span className="text-primary">Movies</span>
            </span>
          </Link>

          {/* Mobile Toggle Button */}
          <button
            className="navbar-toggler border-0"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarContent"
            aria-controls="navbarContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarContent">
            {/* Nav Links */}
            <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4 gap-lg-2">
              <li className="nav-item">
                <NavLink to="/" className={({ isActive }) => `nav-link px-3 ${isActive ? 'active text-primary fw-semibold' : 'text-light text-opacity-75'}`}>
                  <i className="bi bi-grid-fill me-1"></i> Movies
                </NavLink>
              </li>
              {isAuthenticated && (
                <li className="nav-item">
                  <NavLink to="/my-bookings" className={({ isActive }) => `nav-link px-3 ${isActive ? 'active text-primary fw-semibold' : 'text-light text-opacity-75'}`}>
                    <i className="bi bi-ticket-perforated-fill me-1"></i> My Bookings
                  </NavLink>
                </li>
              )}
              {isAdmin && (
                <li className="nav-item">
                  <NavLink to="/admin/add-movie" className={({ isActive }) => `nav-link px-3 ${isActive ? 'active text-warning fw-semibold' : 'text-warning text-opacity-75'}`}>
                    <i className="bi bi-plus-circle-fill me-1"></i> Add Movie (Admin)
                  </NavLink>
                </li>
              )}
            </ul>

            {/* User Account / Auth Actions */}
            <div className="d-flex align-items-center gap-3">
              {isAuthenticated ? (
                <div className="d-flex align-items-center gap-3">
                  <div className="d-flex align-items-center gap-2 bg-secondary bg-opacity-25 px-3 py-1.5 rounded-pill border border-secondary border-opacity-50">
                    <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold" style={{ width: '30px', height: '30px', fontSize: '0.85rem' }}>
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="d-flex flex-column text-start">
                      <span className="fw-semibold text-white small" style={{ lineHeight: '1.2' }}>{user?.name}</span>
                      <span className="badge bg-primary-subtle text-primary border border-primary-subtle" style={{ fontSize: '0.65rem' }}>
                        {user?.role === 'admin' ? 'ADMIN' : 'MEMBER'}
                      </span>
                    </div>
                  </div>
                  <button onClick={handleLogout} className="btn btn-outline-danger btn-sm rounded-pill px-3 py-1.5 d-flex align-items-center gap-1">
                    <i className="bi bi-box-arrow-right"></i>
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <div className="d-flex align-items-center gap-2">
                  <button
                    onClick={() => handleOpenAuth('login')}
                    className="btn btn-outline-light btn-sm rounded-pill px-3 py-1.5"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => handleOpenAuth('register')}
                    className="btn btn-cinema-primary btn-sm rounded-pill px-3 py-1.5"
                  >
                    Register
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Auth Modal Component */}
      <AuthModal
        show={showAuthModal}
        mode={authMode}
        onClose={() => setShowAuthModal(false)}
        onSwitchMode={(newMode) => setAuthMode(newMode)}
      />
    </>
  );
};

export default Navbar;
