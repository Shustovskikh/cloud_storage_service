import React from 'react';
import './FileItem.css';

const FileItem = ({ file, onCopyLink, downloadLink, onDelete }) => {
  const handleCopyLink = () => {
    if (downloadLink) {
      navigator.clipboard.writeText(downloadLink)
        .then(() => alert('The link has been copied to the clipboard!'))
        .catch(() => alert('Error when copying the link.'));
    } else {
      alert('The link has not been generated yet. First, click on "Get Link".');
    }
  };

  return (
    <div className="file-item">
      <span className="file-item-name" title={file.name}>
        {file.name}
      </span>

      <div className="file-item-actions">
        <button onClick={() => onCopyLink(file.id)} className="get-link-button">
          Get a link
        </button>

        <button onClick={handleCopyLink} className="copy-link-button">
          Copy the link
        </button>

        {downloadLink && (
          <a
            href={downloadLink}
            target="_blank"
            rel="noopener noreferrer"
            className="download-link"
          >
            Download
          </a>
        )}

        <button onClick={() => onDelete(file.id)} className="delete-button">
          Delete
        </button>
      </div>
    </div>
  );
};

export default FileItem;
