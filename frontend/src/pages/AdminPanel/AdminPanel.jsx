import React, { useEffect, useState } from 'react';
import { fetchAllUsers, deleteUser } from '../../api/user';
import { listFiles, getDownloadLink, deleteFile } from '../../api/file';
import UserTable from '../../components/UserTable/UserTable';
import AllUserFiles from '../../components/FileList/AllUserFiles';
import UserConfig from '../../components/UserConfig/UserConfig';
import { toast } from 'react-toastify';
import './AdminPanel.css';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [configUser, setConfigUser] = useState(null);

  const handleError = (err) => {
    let errorMessage = 'An unexpected error occurred.';
    
    if (err?.detail) {
      errorMessage = err.detail;
    } else if (typeof err === 'string') {
      errorMessage = err;
    }

    toast.error(errorMessage, {
      autoClose: 5000,
      hideProgressBar: true,
    });
  };

  const loadUsers = async () => {
    if (loading) return;
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
    if (loading) return;
    setLoading(true);
    try {
      const response = await listFiles();
      if (response.success) {
        const sortedFiles = response.data.sort((a, b) => 
          new Date(b.last_downloaded || 0) - new Date(a.last_downloaded || 0)
        );
        
        const filesWithUsernames = sortedFiles.map(file => {
          const user = users.find(user => user.id === file.user);
          return { 
            ...file, 
            username: user ? user.username : 'Unknown',
            formatted_uploaded_at: new Date(file.uploaded_at).toLocaleString(),
            formatted_last_downloaded: file.last_downloaded 
              ? new Date(file.last_downloaded).toLocaleString() 
              : 'Never'
          };
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
    const interval = setInterval(() => {
      if (activeTab === 'users') {
        loadUsers();
      } else {
        loadFiles();
      }
    }, 30000);
    
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeTab === 'files' && users.length > 0) {
      loadFiles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, users]);

  const handleDeleteUser = async (userId) => {
    try {
      const response = await deleteUser(userId);
      if (response.success) {
        await loadUsers();
        if (activeTab === 'files') {
          await loadFiles();
        }
      } else {
        handleError(response.message || 'Failed to delete user');
      }
    } catch (error) {
      handleError('An error occurred while deleting user.');
    }
  };

  const handleDeleteFile = async (fileId) => {
    try {
      const response = await deleteFile(fileId);
      if (response.success) {
        await loadFiles();
      } else {
        handleError(response.message || 'Failed to delete file');
      }
    } catch (error) {
      handleError('An error occurred while deleting file.');
    }
  };

  const handleGetDownloadLink = async (fileId) => {
    try {
      const response = await getDownloadLink(fileId);
      if (response.success) {
        setTimeout(loadFiles, 1000);
        return response;
      } else {
        handleError(response.message || 'Failed to get download link');
        return null;
      }
    } catch (error) {
      handleError('An error occurred while getting download link.');
      return null;
    }
  };

  const handleConfigUser = (userId) => {
    setConfigUser(userId);
  };

  const handleCloseConfig = () => {
    setConfigUser(null);
  };

  const handleUserUpdated = async () => {
    await loadUsers();
    if (activeTab === 'files') {
      await loadFiles();
    }
  };

  const handleFilesUpdated = async () => {
    await loadFiles();
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
        {loading ? (
          <div className="loading-indicator">Loading...</div>
        ) : activeTab === 'users' ? (
          <UserTable
            users={users}
            onDeleteUser={handleDeleteUser}
            onConfigUser={handleConfigUser}
            onUserChange={handleUserUpdated}
          />
        ) : (
          <AllUserFiles
            files={files}
            onDeleteFile={handleDeleteFile}
            onGetDownloadLink={handleGetDownloadLink}
            onFileChange={handleFilesUpdated}
          />
        )}
      </div>

      {configUser && (
        <UserConfig 
          userId={configUser} 
          onClose={handleCloseConfig} 
          onUserChange={handleUserUpdated} 
        />
      )}
    </div>
  );
};

export default AdminPanel;