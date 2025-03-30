import React, { useState } from 'react';
import { uploadFile } from '../../api/file';
import { toast } from 'react-toastify';
import './FileUploader.css';

const FileUploader = ({ refreshFiles }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [comment, setComment] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    setFileName(file ? file.name : '');
  };

  const isFileTypeAllowed = (file) => {
    const allowedExtensions = ['jpg', 'png', 'pdf', 'mp4', 'docx'];
    const fileExtension = file.name.split('.').pop().toLowerCase();
    return allowedExtensions.includes(fileExtension);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file to upload.', {
        autoClose: 3000,
        hideProgressBar: true,
      });
      return;
    }

    if (!isFileTypeAllowed(selectedFile)) {
      toast.error('Unsupported file type. Allowed: jpg, png, pdf, mp4, docx.', {
        autoClose: 3000,
        hideProgressBar: true,
      });
      return;
    }

    setUploading(true);
    try {
      const { success, data, message } = await uploadFile(selectedFile, fileName, comment);
      if (success) {
        toast.success('File uploaded successfully.', {
          autoClose: 2000,
          hideProgressBar: true,
        });
        refreshFiles((prevFiles) => [...prevFiles, data]);
        setSelectedFile(null);
        setFileName('');
        setComment('');
      } else {
        toast.error(message || 'File upload failed.', {
          autoClose: 3000,
          hideProgressBar: true,
        });
      }
    } catch (err) {
      toast.error('An error occurred during file upload.', {
        autoClose: 3000,
        hideProgressBar: true,
      });
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
          placeholder="File name (optional)"
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          disabled={uploading}
          className="text-input"
        />

        <input
          type="text"
          placeholder="Comment (optional)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          disabled={uploading}
          className="text-input"
        />

        <button onClick={handleUpload} disabled={uploading} className="upload-button">
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </div>
    </div>
  );
};

export default FileUploader;