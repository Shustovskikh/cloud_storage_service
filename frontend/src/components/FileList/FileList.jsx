import React, { useState } from 'react';
import './FileList.css';
import ConfirmationModal from '../ConfirmationModal/ConfirmationModal';
import FileConfig from '../FileConfig/FileConfig';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';

const FileList = ({ files, onDeleteFile, onGetDownloadLink, onFileChange = () => {} }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState(null);
  const [editingFileId, setEditingFileId] = useState(null);

  const filteredFiles = Array.isArray(files)
    ? files.filter((file) =>
        file.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const handleCopyLink = async (fileId) => {
    try {
      const downloadLink = await onGetDownloadLink(fileId);
      
      if (downloadLink?.shared_link) {
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(downloadLink.shared_link);
          toast.success('Link copied to clipboard!', {
            autoClose: 2000,
            hideProgressBar: true,
          });
        } else {
          toast.error('Clipboard API not supported in this browser', {
            autoClose: 3000,
            hideProgressBar: true,
          });
        }
      } else {
        toast.error('Could not get the link', {
          autoClose: 3000,
          hideProgressBar: true,
        });
      }
    } catch (error) {
      toast.error('An error occurred when copying the link', {
        autoClose: 3000,
        hideProgressBar: true,
      });
      console.error('Error when copying the link:', error);
    }
  };

  const handleDeleteClick = (fileId) => {
    setSelectedFileId(fileId);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await onDeleteFile(selectedFileId);
      onFileChange();
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error deleting file:', err);
      setIsModalOpen(false);
    }
  };

  const handleDownload = async (fileId) => {
    try {
      const response = await onGetDownloadLink(fileId);
      
      if (response?.shared_link) {
        window.open(response.shared_link, '_blank');
        
        setTimeout(() => {
          onFileChange();
        }, 1000);
      }
    } catch (error) {
      console.error('Error during download:', error);
    }
  };

  const handleFileUpdated = () => {
    onFileChange();
    setEditingFileId(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString().slice(0, 5);
  };

  return (
    <div className="file-table">
      <h2>User Files</h2>
      <input
        type="text"
        placeholder="Search by file name"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />

      <table>
        <thead>
          <tr>
            <th style={{width: '25%'}}>Name</th>
            <th style={{width: '10%'}}>Size (KB)</th>
            <th style={{width: '15%'}}>Uploaded</th>
            <th style={{width: '15%'}}>Auto deleted at</th>
            <th style={{width: '15%'}}>Last Downloaded</th>
            <th style={{width: '10%'}}>Comment</th>
            <th style={{width: '10%'}}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredFiles.length === 0 ? (
            <tr>
              <td colSpan="7">No files available.</td>
            </tr>
          ) : (
            filteredFiles.map((file) => {
              const uploadedAt = new Date(file.uploaded_at);
              const autoDeletedAt = new Date(uploadedAt.getTime() + 30 * 24 * 60 * 60 * 1000);
              
              return (
                <tr key={file.id}>
                  <td>{file.name}</td>
                  <td>{(file.size / 1024).toFixed(2)}</td>
                  <td>{formatDate(file.uploaded_at)}</td>
                  <td>{formatDate(autoDeletedAt)}</td>
                  <td>{formatDate(file.last_downloaded)}</td>
                  <td>{file.comment || '-'}</td>
                  <td>
                    <div style={{display: 'flex', flexWrap: 'wrap', gap: '4px'}}>
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
                        onClick={() => setEditingFileId(file.id)}
                        className="action-button config-button"
                      >
                        Config
                      </button>
                      <button
                        onClick={() => handleDeleteClick(file.id)}
                        className="action-button delete-button"
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

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Deletion"
        message="Are you sure you want to delete this file?"
      />

      {editingFileId && (
        <FileConfig 
          fileId={editingFileId} 
          onClose={() => setEditingFileId(null)} 
          onFileChange={handleFileUpdated} 
        />
      )}
    </div>
  );
};

FileList.propTypes = {
  files: PropTypes.array.isRequired,
  onDeleteFile: PropTypes.func.isRequired,
  onGetDownloadLink: PropTypes.func.isRequired,
  onFileChange: PropTypes.func
};

export default FileList;