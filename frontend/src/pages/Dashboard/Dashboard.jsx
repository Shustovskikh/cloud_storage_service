import React, { useState, useEffect, useRef } from 'react';
import { listFiles, getDownloadLink, deleteFile } from '../../api/file';
import FileList from '../../components/FileList/FileList';
import FileUploader from '../../components/FileUploader/FileUploader';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import './Dashboard.css';

const Dashboard = () => {
  const [userFiles, setUserFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const isAdmin = useSelector((state) => state.auth.isAdmin);
  const abortControllerRef = useRef(new AbortController());

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      toast.error('Authorization required. Redirecting to login...', {
        autoClose: 3000,
        hideProgressBar: true,
        toastId: 'auth-required'
      });
      const timer = setTimeout(() => navigate('/login'), 3000);
      return () => clearTimeout(timer);
    }
  }, [navigate]);

  const fetchFiles = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError('');

    try {
      const { success, data, message } = await listFiles({
        signal: abortControllerRef.current.signal
      });

      if (success) {
        const sortedFiles = [...data].sort((a, b) => 
          new Date(b.last_downloaded || 0) - new Date(a.last_downloaded || 0)
        );
        setUserFiles(isAdmin ? sortedFiles.filter(file => file.user === 1) : sortedFiles);
      } else {
        handleAuthError(message);
      }
    } catch (err) {
      if (err.name !== 'CanceledError') {
        setError('Error loading files');
        console.error('File loading error:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
    const interval = setInterval(fetchFiles, 30000);
    return () => {
      abortControllerRef.current.abort();
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  const handleAuthError = (message) => {
    if (message?.includes('token') || message?.includes('authorization')) {
      toast.error('Session expired. Redirecting...', {
        autoClose: 3000,
        hideProgressBar: true,
        toastId: 'session-expired'
      });
      const timer = setTimeout(() => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        navigate('/login');
      }, 3000);
      return () => clearTimeout(timer);
    }
    setError(message || 'An error occurred');
  };

  const handleGetDownloadLink = async (fileId) => {
    try {
      const response = await getDownloadLink(fileId);
      if (response.success && response.shared_link) {
        setTimeout(fetchFiles, 1000);
        return { shared_link: response.shared_link };
      }
      setError(response.message || 'Failed to get download link');
    } catch (err) {
      setError('Error getting download link');
      console.error('Download link error:', err);
    }
    return null;
  };

  const handleDeleteFile = async (fileId) => {
    try {
      const { success, message } = await deleteFile(fileId);
      if (success) {
        setUserFiles(prev => prev.filter(file => file.id !== fileId));
        toast.success('File deleted successfully', {
          autoClose: 2000,
          hideProgressBar: true
        });
      } else {
        setError(message || 'Failed to delete file');
      }
    } catch (err) {
      setError('Error deleting file');
      console.error('Delete error:', err);
    }
  };

  return (
    <div className="dashboard">
      <h1>Your Dashboard</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <FileUploader refreshFiles={fetchFiles} />
      
      {loading ? (
        <div className="loading-indicator">Loading...</div>
      ) : (
        <FileList
          files={userFiles}
          onGetDownloadLink={handleGetDownloadLink}
          onDeleteFile={handleDeleteFile}
          onFileChange={fetchFiles}
        />
      )}
    </div>
  );
};

export default Dashboard;