import React, { useState, useEffect } from 'react';
import { updateUser } from '../../api/user';
import { toast } from 'react-toastify';
import './UserConfig.css';

const UserConfig = ({ userId, onClose, onUserChange }) => {
  const [user, setUser] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    // Uploading current user data
    // It is assumed that there is ALREADY a function for getting user data by user Id.
    // fetchUser(userId).then(data => setUser(data));
  }, [userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (user.password !== user.confirmPassword) {
      toast.error('Passwords do not match', {
        autoClose: 3000,
        hideProgressBar: true,
      });
      return;
    }
    try {
      const response = await updateUser(userId, user);
      if (response.success) {
        toast.success('User updated successfully!', {
          autoClose: 2000,
          hideProgressBar: true,
        });
        onUserChange();
        onClose();
      } else {
        toast.error(response.message || 'Failed to update user', {
          autoClose: 3000,
          hideProgressBar: true,
        });
      }
    } catch (err) {
      toast.error('An error occurred while updating the user', {
        autoClose: 3000,
        hideProgressBar: true,
      });
    }
  };

  return (
    <div className="user-config-overlay">
      <div className="user-config-content">
        <button className="close-button" onClick={onClose}>
          &times;
        </button>
        <h2>Configure User</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              name="username"
              value={user.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={user.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={user.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={user.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="save-button">Save Changes</button>
            <button type="button" className="cancel-button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserConfig;