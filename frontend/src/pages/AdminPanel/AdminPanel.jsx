import React, { useEffect, useState } from 'react';
import { fetchAllUsers, deleteUser } from '../../api/user';
import { listFiles, getDownloadLink, deleteFile, updateFile } from '../../api/file';
import UserTable from '../../components/UserTable/UserTable';
import AllUserFiles from '../../components/FileList/AllUserFiles';
import UserConfig from '../../components/UserConfig/UserConfig';
import './AdminPanel.css';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(false);
  const [configUser, setConfigUser] = useState(null);

  const handleError = (err) => {
    if (err?.detail) {
      setError(err.detail);
    } else if (typeof err === 'string') {
      setError(err);
    } else {
      setError('An unexpected error occurred.');
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await fetchAllUsers();
      if (response.success) {
        setUsers(response.data);
      } else {
        handleError(response.message || 'Failed to load users');
      }
    } catch (error) {
      handleError('An error occurred while loading users.');
    } finally {
      setLoading(false);
    }
  };

  const loadFiles = async () => {
    setLoading(true);
    try {
      const response = await listFiles();
      if (response.success) {
        const filesWithUsernames = response.data.map(file => {
          const user = users.find(user => user.id === file.user);
          return { ...file, username: user ? user.username : 'Unknown' };
        });
        setFiles(filesWithUsernames);
      } else {
        handleError(response.message || 'Failed to load files');
      }
    } catch (error) {
      handleError('An error occurred while loading files.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [refresh]);

  useEffect(() => {
    if (activeTab === 'files') {
      loadFiles();
    }
  }, [activeTab, users, refresh]);

  const handleSelectUser = async (userId) => {
    setSelectedUser(userId);
    try {
      const response = await listFiles();
      if (response.success) {
        const userFiles = response.data.filter((file) => file.user === userId);
        setFiles(userFiles);
      } else {
        handleError(response.message || 'Failed to load files');
      }
    } catch (error) {
      handleError('An error occurred while loading files.');
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const response = await deleteUser(userId);
      if (response.success) {
        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
        setFiles((prevFiles) => prevFiles.filter((file) => file.user !== userId));
        setRefresh((prev) => !prev);
      } else {
        handleError(response.message || 'Failed to delete user');
      }
    } catch (error) {
      handleError('An error occurred while deleting user.');
    }
  };

  const handleConfigUser = (userId) => {
    setConfigUser(userId);
  };

  const handleCloseConfig = () => {
    setConfigUser(null);
  };

  const handleUserChange = () => {
    setRefresh((prev) => !prev);
    loadUsers();
  };

  const handleFileChange = () => {
    setRefresh((prev) => !prev);
  };

  return (
    <div className="admin-panel">
      <h1>Admin Panel</h1>
      <div className="tabs">
        <button
          onClick={() => setActiveTab('users')}
          className={activeTab === 'users' ? 'active' : ''}
        >
          All Users
        </button>
        <button
          onClick={() => setActiveTab('files')}
          className={activeTab === 'files' ? 'active' : ''}
        >
          All User Files
        </button>
      </div>

      <div className="tab-content">
        {error && <div className="error">{error}</div>}
        {loading ? (
          <div>Loading...</div>
        ) : activeTab === 'users' ? (
          <UserTable
            key={refresh}
            users={users}
            onDeleteUser={handleDeleteUser}
            onConfigUser={handleConfigUser}
            onUserChange={handleUserChange}
          />
        ) : (
          <AllUserFiles
            key={refresh}
            files={files}
            onDeleteFile={deleteFile}
            onGetDownloadLink={getDownloadLink}
            onFileChange={handleFileChange}
          />
        )}
      </div>

      {configUser && (
        <UserConfig userId={configUser} onClose={handleCloseConfig} onUserChange={handleUserChange} />
      )}
    </div>
  );
};

export default AdminPanel;
