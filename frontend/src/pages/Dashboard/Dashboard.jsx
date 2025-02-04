import React, { useState, useEffect } from 'react';
import { listFiles, listAdminFiles, getDownloadLink, deleteFile } from '../../api/file';
import FileList from '../../components/FileList/FileList';
import FileUploader from '../../components/FileUploader/FileUploader';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import './Dashboard.css';

const Dashboard = () => {
  const [userFiles, setUserFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloadLinks, setDownloadLinks] = useState({});
  const navigate = useNavigate();
  const isAdmin = useSelector((state) => state.auth.isAdmin);

  useEffect(() => {
    const loadFiles = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        navigate('/login');
        return;
      }

      setLoading(true);
      try {
        const { success, data, message } = await listFiles();
        if (success) {
          if (isAdmin) {
            const adminFiles = data.filter(file => file.user === 1);
            setUserFiles(adminFiles);
          } else {
            setUserFiles(data);
          }
        } else {
          handleAuthError(message);
        }
      } catch (err) {
        setError('An error occurred while loading files.');
      } finally {
        setLoading(false);
      }
    };

    loadFiles();
  }, [navigate, isAdmin]);

  const handleAuthError = (message) => {
    if (message === 'Token refresh failed' || message === 'No refresh token available') {
      setError('Your session has expired. Please log in again.');
      navigate('/login');
    } else {
      setError(message || 'An unexpected error occurred.');
    }
  };

  const handleGetDownloadLink = async (fileId) => {
    try {
      const response = await getDownloadLink(fileId);
      console.log('Get download link response:', response);
      if (response.success) {
        const sharedLink = response.shared_link;
        if (sharedLink) {
          setDownloadLinks((prev) => ({ ...prev, [fileId]: sharedLink }));
          setError('');
          return { shared_link: sharedLink };
        } else {
          setError('Could not get the link: the shared_link field is missing.');
        }
      } else {
        setError(response.message || 'Could not get the link.');
      }
    } catch (err) {
      console.error('Error when receiving the link:', err);
      setError('An error occurred while receiving the link.');
    }
    return null;
  };

  const handleDeleteFile = async (fileId) => {
    try {
      const { success, message } = await deleteFile(fileId);
      if (success) {
        setUserFiles((prev) => prev.filter((file) => file.id !== fileId));
      } else {
        setError(message || 'Failed to delete the file.');
      }
    } catch (err) {
      setError('An error occurred while deleting the file.');
    }
  };

  return (
    <div className="dashboard">
      <h1>Your Dashboard</h1>
      {error && <div className="error-message">{error}</div>}
      <FileUploader refreshFiles={setUserFiles} />
      <FileList
        files={userFiles}
        onGetDownloadLink={handleGetDownloadLink}
        onDeleteFile={handleDeleteFile}
        downloadLinks={downloadLinks}
      />
    </div>
  );
};

export default Dashboard;
