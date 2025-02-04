import React, { useState } from 'react';
import './UserTable.css';

const UserTable = ({ users, onDeleteUser, onConfigUser, onUserChange }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await onDeleteUser(userId);
      onUserChange();
    } catch (err) {
      console.error('Error deleting user:', err);
    }
  };

  const handleConfig = (userId) => {
    onConfigUser(userId);
  };

  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="user-table">
      <h2>All Users</h2>
      <input
        type="text"
        placeholder="Search by username or email"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />
      <table>
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.length === 0 ? (
            <tr>
              <td colSpan="4">No users available.</td>
            </tr>
          ) : (
            filteredUsers.map((user) => (
              <tr key={user.id}>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.is_superuser ? 'Superuser' : user.is_staff ? 'Admin' : 'User'}</td>
                <td>
                  <button
                    onClick={() => handleConfig(user.id)}
                    className="config-button"
                  >
                    Config
                  </button>
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="delete-button"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;
