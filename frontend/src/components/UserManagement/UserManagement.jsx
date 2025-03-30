import React, { useState, useEffect } from 'react';
import UserTable from '../UserTable/UserTable';
import { fetchAllUsers, deleteUser } from '../../api/user';
import { toast } from 'react-toastify';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    setLoading(true);
    const result = await fetchAllUsers();
    if (result.success) {
      setUsers(result.data);
    } else {
      toast.error(result.message || 'Failed to load users', {
        autoClose: 3000,
        hideProgressBar: true,
      });
    }
    setLoading(false);
  };

  const handleDeleteUser = async (userId) => {
    try {
      const result = await deleteUser(userId);
      if (result.success) {
        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
        toast.success('User deleted successfully', {
          autoClose: 2000,
          hideProgressBar: true,
        });
      } else {
        toast.error(result.message || 'Failed to delete user', {
          autoClose: 3000,
          hideProgressBar: true,
        });
      }
    } catch (error) {
      toast.error('Error occurred while deleting user', {
        autoClose: 3000,
        hideProgressBar: true,
      });
      console.error(error);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <div>
      <h1>User Management</h1>
      {loading ? <p>Loading users...</p> : <UserTable users={users} onDeleteUser={handleDeleteUser} />}
    </div>
  );
};

export default UserManagement;