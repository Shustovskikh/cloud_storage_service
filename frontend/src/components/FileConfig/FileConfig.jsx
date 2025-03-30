import React, { useState, useEffect } from 'react';
import { updateFile, fetchFile } from '../../api/file';
import './FileConfig.css';

const FileConfig = ({ fileId, onClose, onFileChange = () => {} }) => {
  const [file, setFile] = useState({ name: '', comment: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadFileData = async () => {
      setIsLoading(true);
      try {
        const response = await fetchFile(fileId);
        if (response.success) {
          setFile({ 
            name: response.data.name, 
            comment: response.data.comment || '' 
          });
          setError('');
        } else {
          setError(response.message);
        }
      } catch (err) {
        setError('Failed to load file data');
      } finally {
        setIsLoading(false);
      }
    };
    loadFileData();
  }, [fileId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await updateFile(fileId, file.name, file.comment);
      if (response.success) {
        setSuccess('File updated successfully!');
        if (typeof onFileChange === 'function') {
          onFileChange();
        }
        setTimeout(() => {
          onClose();
        }, 1000);
      } else {
        setError(response.message || 'Failed to update file');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while updating the file.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="file-config-overlay">
      <div className="file-config-content">
        <button className="close-button" onClick={onClose}>&times;</button>
        <h2>Configure File</h2>
        
        {isLoading && <div className="loading-indicator">Updating...</div>}
        {success && <p className="success-message">{success}</p>}
        {error && <p className="error-message">{error}</p>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={file.name}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>
          <div className="form-group">
            <label>Comment</label>
            <input
              type="text"
              name="comment"
              value={file.comment}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>
          <div className="form-actions">
            <button 
              type="submit" 
              className="save-button"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
            <button 
              type="button" 
              className="cancel-button" 
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FileConfig;