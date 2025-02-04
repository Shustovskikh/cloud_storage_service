import React, { useState, useEffect } from 'react';
import UserTable from '../UserTable/UserTable';
import { fetchAllUsers, deleteUser } from '../../api/user';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    const result = await fetchAllUsers();
    if (result.success) {
      setUsers(result.data);
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  const handleDeleteUser = async (userId) => {
    try {
      const result = await deleteUser(userId);
      if (result.success) {
        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
      } else {
        alert('Failed to delete user');
      }
    } catch (error) {
      console.error(error);
      alert('Error occurred while deleting user.');
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <div>
      <h1>User Management</h1>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {loading ? (
        <p>Loading users...</p>
      ) : (
        <UserTable users={users} onDeleteUser={handleDeleteUser} />
      )}
    </div>
  );
};

export default UserManagement;
