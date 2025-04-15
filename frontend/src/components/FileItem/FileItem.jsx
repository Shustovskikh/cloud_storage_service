import React, { useState } from 'react';
import FileConfig from '../FileConfig/FileConfig';
import ConfirmationModal from '../ConfirmationModal/ConfirmationModal';
import { toast } from 'react-toastify';
import './FileItem.css';

const FileItem = ({ file, onDelete, onFileUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fileUrl, setFileUrl] = useState(null);

  const handleDelete = async () => {
    try {
      await onDelete(file.id);
      toast.success('File deleted successfully', {
        autoClose: 2000,
        hideProgressBar: true,
      });
    } catch (error) {
      toast.error('Failed to delete file', {
        autoClose: 2000,
        hideProgressBar: true,
      });
    } finally {
      setIsModalOpen(false);
    }
  };

  const handleGetLink = () => {
    const url = `${window.location.origin}/files/${file.id}/view/`;
    setFileUrl(url);
    return url;
  };

  const handleCopyLink = () => {
    const urlToCopy = fileUrl || handleGetLink();
    navigator.clipboard.writeText(urlToCopy)
      .then(() => toast.success('Link copied to clipboard', {
        autoClose: 2000,
        hideProgressBar: true,
      }))
      .catch(() => toast.error('Failed to copy link', {
        autoClose: 2000,
        hideProgressBar: true,
      }));
  };

  const handleDownload = () => {
    window.open(`${window.location.origin}/files/${file.id}/download/`, '_blank');
  };

  return (
    <div className="file-item">
      <div className="file-info">
        <span className="file-name" title={file.name}>
          {file.name}
        </span>
        <p className="file-comment">Comment: {file.comment || 'No comment'}</p>
      </div>

      <div className="file-item-actions">
        <button onClick={handleGetLink} className="action-button">
          Get Link
        </button>
        <button onClick={handleCopyLink} className="action-button">
          Copy Link
        </button>
        <button onClick={handleDownload} className="action-button">
          Download
        </button>
        <button 
          onClick={() => setIsEditing(true)} 
          className="action-button"
        >
          Edit
        </button>
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="action-button delete-button"
        >
          Delete
        </button>
      </div>

      {isEditing && (
        <FileConfig 
          fileId={file.id} 
          onClose={() => setIsEditing(false)} 
          onFileChange={() => {
            onFileUpdate();
            setIsEditing(false);
          }} 
        />
      )}

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleDelete}
        title="Confirm Deletion"
        message={`Are you sure you want to delete ${file.name}?`}
      />
    </div>
  );
};

export default FileItem;