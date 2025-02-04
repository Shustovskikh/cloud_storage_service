import React, { useState, useEffect } from 'react';
import { updateFile } from '../../api/file';
import './FileConfig.css';

const FileConfig = ({ fileId, onClose, onFileChange }) => {
  const [file, setFile] = useState({
    name: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Uploading the current file data
    // It is assumed that there is ALREADY a function for getting file data by FileID.
    // fetchFile(fileId).then(data => setFile(data));
  }, [fileId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await updateFile(fileId, { name: file.name });
      if (response.success) {
        setSuccess('File updated successfully!');
        setError('');
        onFileChange();
        onClose();
      } else {
        setError(response.message || 'Failed to update file');
      }
    } catch (err) {
      setError('An error occurred while updating the file.');
    }
  };

  return (
    <div className="file-config">
      <button className="close-button" onClick={onClose}>
        &times;
      </button>
      <h2>Configure File</h2>
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
          />
        </div>
        <div className="form-actions">
          <button type="submit" className="save-button">Save Changes</button>
          <button type="button" className="cancel-button" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default FileConfig;
