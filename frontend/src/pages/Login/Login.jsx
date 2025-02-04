import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff, FiX } from 'react-icons/fi';
import { login as loginAction } from '../../authSlice';
import { login } from '../../api/auth';
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const validate = () => {
    if (!username || username.length < 4) {
      setError('Username must be at least 4 characters long.');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return false;
    }
    return true;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (validate()) {
      setIsSubmitting(true);
      try {
        const data = await login(username, password);

        if (data.access && data.refresh) {
          dispatch(
            loginAction({
              user: { is_staff: data.is_staff },
              tokens: { access: data.access, refresh: data.refresh },
            })
          );
          navigate(data.is_staff ? '/admin' : '/dashboard');
        } else {
          setError('Invalid server response.');
        }
      } catch (err) {
        setError(err.response?.data?.detail || 'Login failed.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="loginContainer">
      <h1 className="title">Login</h1>
      <form onSubmit={handleLogin} className="form">
        <div className="inputGroup">
          <label htmlFor="username">Username</label>
          <div className="inputWrapper">
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              disabled={isSubmitting}
            />
            {username && (
              <span
                className="clearButton"
                onClick={() => setUsername('')}
                aria-label="Clear username"
              >
                <FiX />
              </span>
            )}
          </div>
        </div>
        <div className="inputGroup">
          <label htmlFor="password">Password</label>
          <div className="inputWrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              disabled={isSubmitting}
            />
            <span
              className="togglePasswordButton"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label="Toggle password visibility"
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </span>
          </div>
        </div>
        <button
          type="submit"
          className="submitButton"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Logging in...' : 'Login'}
        </button>
        {error && <div className="error">{error}</div>}
      </form>
    </div>
  );
};

export default Login;
