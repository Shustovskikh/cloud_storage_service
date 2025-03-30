import React, { useState } from 'react';
import './FileList.css';
import FileConfig from '../FileConfig/FileConfig';
import ConfirmationModal from '../ConfirmationModal/ConfirmationModal';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';

const AllUserFiles = ({ files = [], onDeleteFile, onGetDownloadLink, onFileChange = () => {} }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [configFileId, setConfigFileId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastDownloadTimestamps, setLastDownloadTimestamps] = useState({});

  const filesArray = Array.isArray(files) ? files : [];

  const handleCopyLink = async (fileId) => {
    try {
      setIsProcessing(true);
      const downloadLink = await onGetDownloadLink(fileId);
      if (downloadLink?.shared_link) {
        await navigator.clipboard.writeText(downloadLink.shared_link);
        toast.success('Link copied to clipboard!', {
          autoClose: 2000,
          hideProgressBar: true,
        });
      }
    } catch (error) {
      toast.error('An error occurred when copying the link', {
        autoClose: 3000,
        hideProgressBar: true,
      });
      console.error('Copy error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteClick = (fileId) => {
    setSelectedFileId(fileId);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setIsProcessing(true);
      await onDeleteFile(selectedFileId);
      await onFileChange();
      toast.success('File deleted successfully', {
        autoClose: 2000,
        hideProgressBar: true,
      });
    } catch (error) {
      toast.error('Error deleting file', {
        autoClose: 3000,
        hideProgressBar: true,
      });
      console.error('Delete error:', error);
    } finally {
      setIsProcessing(false);
      setIsModalOpen(false);
    }
  };

  const handleDownload = async (fileId) => {
    try {
      setIsProcessing(true);
      const response = await onGetDownloadLink(fileId);
      if (response?.shared_link) {
        setLastDownloadTimestamps(prev => ({
          ...prev,
          [fileId]: new Date().toISOString()
        }));
        
        window.open(response.shared_link, '_blank');
        toast.success('File download started', {
          autoClose: 2000,
          hideProgressBar: true,
        });
        
        setTimeout(() => {
          onFileChange();
        }, 1000);
      }
    } catch (error) {
      toast.error('Error downloading file', {
        autoClose: 3000,
        hideProgressBar: true,
      });
      console.error('Download error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfig = (fileId) => {
    setConfigFileId(fileId);
  };

  const handleCloseConfig = () => {
    setConfigFileId(null);
  };

  const handleFileUpdated = async () => {
    await onFileChange();
    setConfigFileId(null);
  };

  const filteredFiles = filesArray.filter((file) =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString().slice(0, 5);
    } catch {
      return 'Invalid date';
    }
  };

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

      {isProcessing && <div className="loading-overlay">Processing...</div>}

      <table>
        <thead>
          <tr>
            <th style={{width: '20%'}}>Name</th>
            <th style={{width: '8%'}}>Size (KB)</th>
            <th style={{width: '15%'}}>Uploaded</th>
            <th style={{width: '15%'}}>Last Downloaded</th>
            <th style={{width: '15%'}}>Auto deleted at</th>
            <th style={{width: '10%'}}>User</th>
            <th style={{width: '12%'}}>Comment</th>
            <th style={{width: '15%'}}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredFiles.length === 0 ? (
            <tr>
              <td colSpan="8">No files available.</td>
            </tr>
          ) : (
            filteredFiles.map((file) => {
              const uploadedAt = new Date(file.uploaded_at);
              const autoDeletedAt = new Date(uploadedAt.getTime() + 30 * 24 * 60 * 60 * 1000);
              
              const lastDownloaded = lastDownloadTimestamps[file.id] || file.last_downloaded;
              
              return (
                <tr key={file.id}>
                  <td>{file.name}</td>
                  <td>{(file.size / 1024).toFixed(2)}</td>
                  <td>{formatDate(file.uploaded_at)}</td>
                  <td>{formatDate(lastDownloaded)}</td>
                  <td>{formatDate(autoDeletedAt)}</td>
                  <td>{file.username}</td>
                  <td>{file.comment || '-'}</td>
                  <td>
                    <div style={{display: 'flex', flexWrap: 'wrap', gap: '4px'}}>
                      <button
                        onClick={() => handleDownload(file.id)}
                        className="action-button download-button"
                        disabled={isProcessing}
                      >
                        Download
                      </button>
                      <button
                        onClick={() => handleCopyLink(file.id)}
                        className="action-button copy-link-button"
                        disabled={isProcessing}
                      >
                        Copy Link
                      </button>
                      <button
                        onClick={() => handleConfig(file.id)}
                        className="action-button config-button"
                        disabled={isProcessing}
                      >
                        Config
                      </button>
                      <button
                        onClick={() => handleDeleteClick(file.id)}
                        className="action-button delete-button"
                        disabled={isProcessing}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {configFileId && (
        <FileConfig 
          fileId={configFileId} 
          onClose={handleCloseConfig} 
          onFileChange={handleFileUpdated} 
        />
      )}

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => !isProcessing && setIsModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Deletion"
        message="Are you sure you want to delete this file?"
        isProcessing={isProcessing}
      />
    </div>
  );
};

AllUserFiles.propTypes = {
  files: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object
  ]),
  onDeleteFile: PropTypes.func.isRequired,
  onGetDownloadLink: PropTypes.func.isRequired,
  onFileChange: PropTypes.func
};

AllUserFiles.defaultProps = {
  files: []
};

export default AllUserFiles;