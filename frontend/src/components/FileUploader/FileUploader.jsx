import React, { useState } from 'react';
import { uploadFile } from '../../api/file';
import './FileUploader.css';

const FileUploader = ({ refreshFiles }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    setFileName(file ? file.name : '');
    setError('');
  };

  const isFileTypeAllowed = (file) => {
    const allowedExtensions = ['jpg', 'png', 'pdf', 'mp4', 'docx'];
    const fileExtension = file.name.split('.').pop().toLowerCase();
    return allowedExtensions.includes(fileExtension);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file to upload.');
      return;
    }

    if (!isFileTypeAllowed(selectedFile)) {
      setError('Unsupported file type. Allowed: jpg, png, pdf, mp4, docx.');
      return;
    }

    setUploading(true);
    try {
      const { success, data, message } = await uploadFile(selectedFile, fileName);
      if (success) {
        setError('');
        refreshFiles((prevFiles) => [...prevFiles, data]);
        alert('File uploaded successfully.');
        setSelectedFile(null);
        setFileName('');
      } else {
        setError(message || 'File upload failed.');
      }
    } catch (err) {
      setError('An error occurred during file upload.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="file-uploader">
      <h2>Upload a File</h2>
      
      <div className="upload-row">
        <label htmlFor="file-input" className="file-label">
          {selectedFile ? selectedFile.name : 'Choose a file...'}
        </label>
        <input
          id="file-input"
          type="file"
          onChange={handleFileChange}
          disabled={uploading}
          accept=".jpg,.png,.pdf,.mp4,.docx"
          className="file-input"
        />
        
        <input
          type="text"
          placeholder="Enter a custom file name (optional)"
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          disabled={uploading}
          className="file-name-input"
        />
        
        <button onClick={handleUpload} disabled={uploading} className="upload-button">
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </div>

      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default FileUploader;
