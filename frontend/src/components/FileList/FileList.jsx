import React, { useState, useEffect } from 'react';
import './FileList.css';
import ConfirmationModal from '../ConfirmationModal/ConfirmationModal';
import FileConfig from '../FileConfig/FileConfig';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';

const FileList = ({ files, onDeleteFile, onFileChange = () => {} }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState(null);
  const [editingFileId, setEditingFileId] = useState(null);
  const [fileUrls, setFileUrls] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const ws = new WebSocket(`wss://${window.location.host}/ws/files/`);
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === 'FILE_UPDATE') {
        onFileChange();
      }
    };
    setSocket(ws);

    return () => {
      ws.close();
    };
  }, []);

  useEffect(() => {
    const urls = {};
    files.forEach(file => {
      urls[file.id] = `${window.location.origin}/files/${file.id}/view/`;
    });
    setFileUrls(urls);
  }, [files]);

  const filteredFiles = Array.isArray(files)
    ? files.filter((file) =>
        file.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const handleCopyLink = (fileId) => {
    const urlToCopy = fileUrls[fileId];
    if (urlToCopy) {
      navigator.clipboard.writeText(urlToCopy)
        .then(() => toast.success('Link copied to clipboard!', {
          autoClose: 2000,
          hideProgressBar: true,
        }))
        .catch(() => toast.error('Clipboard API not supported', {
          autoClose: 2000,
          hideProgressBar: true,
        }));
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
      onFileChange();
      toast.success('File deleted successfully', {
        autoClose: 2000,
        hideProgressBar: true,
      });
    } catch (err) {
      toast.error('Error deleting file', {
        autoClose: 2000,
        hideProgressBar: true,
      });
      console.error('Error deleting file:', err);
    } finally {
      setIsProcessing(false);
      setIsModalOpen(false);
    }
  };

  const handleDownload = (fileId) => {
    window.open(`${window.location.origin}/files/${fileId}/download/`, '_blank');
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

      {isProcessing && <div className="loading-overlay">Processing...</div>}

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
                    <div className="file-actions">
                      <button
                        onClick={() => handleDownload(file.id)}
                        className="action-button"
                        disabled={isProcessing}
                      >
                        Download
                      </button>
                      <button
                        onClick={() => handleCopyLink(file.id)}
                        className="action-button"
                        disabled={isProcessing}
                      >
                        Copy Link
                      </button>
                      <button
                        onClick={() => setEditingFileId(file.id)}
                        className="action-button"
                        disabled={isProcessing}
                      >
                        Edit
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

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => !isProcessing && setIsModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Deletion"
        message="Are you sure you want to delete this file?"
        isProcessing={isProcessing}
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
  onFileChange: PropTypes.func
};

export default FileList;