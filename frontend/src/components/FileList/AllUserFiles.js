import React, { useState } from 'react';
import './FileList.css';
import FileConfig from '../FileConfig/FileConfig';

const AllUserFiles = ({ files, onDeleteFile, onGetDownloadLink, onFileChange }) => {
  const [copySuccess, setCopySuccess] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [configFileId, setConfigFileId] = useState(null);

  const handleCopyLink = async (fileId) => {
    try {
      const downloadLink = await onGetDownloadLink(fileId);
      if (downloadLink && downloadLink.shared_link) {
        setCopySuccess('The link has been copied to the clipboard!😊');
        setErrorMessage('');
        await navigator.clipboard.writeText(downloadLink.shared_link);
        setTimeout(() => setCopySuccess(''), 3000);
      } else {
        setErrorMessage('Could not get the link.');
      }
    } catch (error) {
      console.error('Error when copying the link:', error);
      setErrorMessage('An error occurred when copying the link.');
    }
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;
    try {
      await onDeleteFile(fileId);
      onFileChange();
    } catch (err) {
      console.error('Error deleting file:', err);
    }
  };

  const handleDownload = async (fileId) => {
    try {
      const response = await onGetDownloadLink(fileId);
      if (response && response.shared_link) {
        const link = document.createElement('a');
        link.href = response.shared_link;
        link.setAttribute('download', '');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        console.error('Download link not found');
      }
    } catch (error) {
      console.error('Error during download:', error);
    }
  };

  const handleConfig = (fileId) => {
    setConfigFileId(fileId);
  };

  const handleCloseConfig = () => {
    setConfigFileId(null);
  };

  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="file-table">
      <h2>All User Files</h2>
      <input
        type="text"
        placeholder="Search by file name"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />

      {copySuccess && <p className="copy-success">{copySuccess}</p>}
      {errorMessage && <p className="error-message">{errorMessage}</p>}

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Size (KB)</th>
            <th>Uploaded At</th>
            <th>Auto deleted at</th>
            <th>Username</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredFiles.length === 0 ? (
            <tr>
              <td colSpan="6">No files available.</td>
            </tr>
          ) : (
            filteredFiles.map((file) => {
              const uploadedAt = new Date(file.uploaded_at);
              const autoDeletedAt = new Date(uploadedAt.getTime() + 30 * 24 * 60 * 60 * 1000);
              return (
                <tr key={file.id}>
                  <td>{file.name}</td>
                  <td>{(file.size / 1024).toFixed(2)}</td>
                  <td>{uploadedAt.toLocaleString()}</td>
                  <td>{autoDeletedAt.toLocaleString()}</td>
                  <td>{file.username}</td>
                  <td>
                    <button
                      onClick={() => handleDownload(file.id)}
                      className="action-button download-button"
                    >
                      Download
                    </button>
                    <button
                      onClick={() => handleCopyLink(file.id)}
                      className="action-button copy-link-button"
                    >
                      Copy Link
                    </button>
                    <button
                      onClick={() => handleConfig(file.id)}
                      className="action-button config-button"
                    >
                      Config
                    </button>
                    <button
                      onClick={() => handleDelete(file.id)}
                      className="action-button delete-button"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {configFileId && <FileConfig fileId={configFileId} onClose={handleCloseConfig} onFileChange={onFileChange} />}
    </div>
  );
};

export default AllUserFiles;
