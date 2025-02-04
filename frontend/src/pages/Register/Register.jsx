import React, { useState } from 'react';
import { register } from '../../api/auth';
import { useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff, FiX } from 'react-icons/fi';
import './Register.css';

const Register = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const usernameRegex = /^[a-zA-Z0-9]{4,20}$/;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*.,\-])[A-Za-z\d!@#$%^&*.,\-]{6,}$/;

  const validate = () => {
    const errors = {};
    if (!usernameRegex.test(username)) {
      errors.username = 'Username must be 4-20 characters long and contain only letters and numbers.';
    }
    if (!emailRegex.test(email)) {
      errors.email = 'Please enter a valid email address.';
    }
    if (!passwordRegex.test(password)) {
      errors.password = 'Password must be at least 6 characters long, with at least one uppercase letter, one number, and one special character.';
    }
    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setValidationErrors({});
    if (validate()) {
      setIsSubmitting(true);
      try {
        const { success, message } = await register({ email, username, password });
        if (success) {
          alert('Registration successful! Redirecting to login page.');
          navigate('/login');
        } else {
          setError(message || 'Registration failed. Please try again.');
        }
      } catch (err) {
        setError('An error occurred. Please try again later.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="registerContainer">
      <h1 className="title">Register</h1>
      <form onSubmit={handleRegister} className="form">
        <div className="inputGroup">
          <label htmlFor="email">Email</label>
          <div className="inputWrapper">
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              disabled={isSubmitting}
            />
          </div>
          {validationErrors.email && <p className="error">{validationErrors.email}</p>}
        </div>
        <div className="inputGroup">
          <label htmlFor="username">Username</label>
          <div className="inputWrapper">
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
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
          {validationErrors.username && <p className="error">{validationErrors.username}</p>}
        </div>
        <div className="inputGroup">
          <label htmlFor="password">Password</label>
          <div className="inputWrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
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
          {validationErrors.password && <p className="error">{validationErrors.password}</p>}
        </div>
        <div className="inputGroup">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <div className="inputWrapper">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              disabled={isSubmitting}
            />
            <span
              className="togglePasswordButton"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              aria-label="Toggle confirm password visibility"
            >
              {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
            </span>
          </div>
          {validationErrors.confirmPassword && <p className="error">{validationErrors.confirmPassword}</p>}
        </div>
        <button
          type="submit"
          className="submitButton"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Registering...' : 'Register'}
        </button>
      </form>
      {error && <div className="error">{error}</div>}
    </div>
  );
};

export default Register;
