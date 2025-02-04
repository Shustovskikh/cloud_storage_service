import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../authSlice';
import './Header.css';

const Header = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const isAdmin = useSelector((state) => state.auth.isAdmin);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <header className="header">
      <Link to="/" className="title-link">
        <h1 className="title">Cloud Storage Service</h1>
      </Link>
      <nav aria-label="Main navigation">
        <ul>
          <li>
            <Link
              to="/"
              className={location.pathname === '/' ? 'active' : ''}
              aria-label="Home"
            >
              Home
            </Link>
          </li>

          {user ? (
            <>
              <li>
                <Link
                  to="/dashboard"
                  className={location.pathname === '/dashboard' ? 'active' : ''}
                  aria-label="Dashboard"
                >
                  Dashboard
                </Link>
              </li>

              {isAdmin && (
                <li>
                  <Link
                    to="/admin"
                    className={location.pathname === '/admin' ? 'active' : ''}
                    aria-label="Admin Panel"
                  >
                    Admin Panel
                  </Link>
                </li>
              )}

              <li>
                <button
                  onClick={handleLogout}
                  className="logout-button"
                  aria-label="Logout"
                >
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link
                  to="/login"
                  className={location.pathname === '/login' ? 'active' : ''}
                  aria-label="Login"
                >
                  Login
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className={location.pathname === '/register' ? 'active' : ''}
                  aria-label="Register"
                >
                  Register
                </Link>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;
