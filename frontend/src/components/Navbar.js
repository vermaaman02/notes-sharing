import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          <Link to="/" className="navbar-brand">
            📚 Notes Sharing
          </Link>
          
          <div className="navbar-links">
            <Link to="/" className="nav-link">Home</Link>
            
            {user ? (
              <>
                <Link to="/upload" className="nav-link">Upload</Link>
                <Link to="/my-notes" className="nav-link">My Notes</Link>
                {user.isAdmin && (
                  <Link to="/admin" className="nav-link admin-link">🔧 Admin Panel</Link>
                )}
                <div className="user-info">
                  <span>Welcome, {user.name}!</span>
                  {user.isAdmin && <span className="admin-badge">Admin</span>}
                  <button onClick={handleLogout} className="btn btn-secondary">
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link">Login</Link>
                <Link to="/register" className="nav-link">Register</Link>
                <Link to="/admin-login" className="nav-link admin-login-btn">🔐 Admin</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;