import React, { useState } from 'react';
import './UserTable.css';
import ConfirmationModal from '../ConfirmationModal/ConfirmationModal';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';

const UserTable = ({ users = [], onDeleteUser, onConfigUser, onUserChange = () => {} }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDeleteClick = (userId) => {
    setSelectedUserId(userId);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    setIsProcessing(true);
    try {
      await onDeleteUser(selectedUserId);
      await onUserChange();
      toast.success('User deleted successfully', {
        autoClose: 2000,
        hideProgressBar: true,
      });
    } catch (err) {
      toast.error('Error deleting user', {
        autoClose: 3000,
        hideProgressBar: true,
      });
      console.error('Error deleting user:', err);
    } finally {
      setIsProcessing(false);
      setIsModalOpen(false);
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
      
      {isProcessing && <div className="loading-overlay">Processing...</div>}
      
      <table>
        <thead>
          <tr>
            <th style={{width: '25%'}}>Username</th>
            <th style={{width: '35%'}}>Email</th>
            <th style={{width: '20%'}}>Role</th>
            <th style={{width: '20%'}}>Actions</th>
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
                  <div style={{display: 'flex', flexWrap: 'wrap', gap: '4px'}}>
                    <button
                      onClick={() => handleConfig(user.id)}
                      className="action-button config-button"
                      disabled={isProcessing}
                    >
                      Config
                    </button>
                    <button
                      onClick={() => handleDeleteClick(user.id)}
                      className="action-button delete-button"
                      disabled={isProcessing}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => !isProcessing && setIsModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Deletion"
        message="Are you sure you want to delete this user?"
        isProcessing={isProcessing}
      />
    </div>
  );
};

UserTable.propTypes = {
  users: PropTypes.array,
  onDeleteUser: PropTypes.func.isRequired,
  onConfigUser: PropTypes.func.isRequired,
  onUserChange: PropTypes.func
};

UserTable.defaultProps = {
  users: []
};

export default UserTable;