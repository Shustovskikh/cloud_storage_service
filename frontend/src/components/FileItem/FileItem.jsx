import React, { useState } from 'react';
import FileConfig from '../FileConfig/FileConfig';
import ConfirmationModal from '../ConfirmationModal/ConfirmationModal';
import { toast } from 'react-toastify';
import './FileItem.css';

const FileItem = ({ file, onCopyLink, downloadLink, onDelete, onFileUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDeleteClick = () => {
    setIsModalOpen(true);
  };

  const handleConfirmDelete = () => {
    onDelete(file.id);
    setIsModalOpen(false);
  };

  const handleCopyLink = () => {
    if (downloadLink) {
      navigator.clipboard.writeText(downloadLink)
        .then(() => toast.success('Link copied to clipboard!', {
          autoClose: 2000,
          hideProgressBar: true,
        }))
        .catch(() => toast.error('Error when copying the link', {
          autoClose: 2000,
          hideProgressBar: true,
        }));
    } else {
      toast.warning('The link has not been generated yet. First, click on "Get Link".', {
        autoClose: 3000,
        hideProgressBar: true,
      });
    }
  };

  return (
    <div className="file-item">
      <span className="file-item-name" title={file.name}>
        {file.name}
      </span>

      <p className="file-comment">Comment: {file.comment || 'No comment'}</p>

      <div className="file-item-actions">
        <button onClick={() => onCopyLink(file.id)} className="get-link-button">
          Get a link
        </button>

        <button onClick={handleCopyLink} className="copy-link-button">
          Copy the link
        </button>

        {downloadLink && (
          <a href={downloadLink} target="_blank" rel="noopener noreferrer" className="download-link">
            Download
          </a>
        )}

        <button onClick={() => setIsEditing(true)} className="config-button">
          Config
        </button>

        <button onClick={handleDeleteClick} className="delete-button">
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
        onConfirm={handleConfirmDelete}
        title="Confirm Deletion"
        message={`Are you sure you want to delete ${file.name}?`}
      />
    </div>
  );
};

export default FileItem;