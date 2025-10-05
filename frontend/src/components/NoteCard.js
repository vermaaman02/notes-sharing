import React from 'react';
import './NoteCard.css';

const NoteCard = ({ note, onDownload, onDelete, showActions = false }) => {
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getFileTypeIcon = (fileType) => {
    if (!fileType) return '📄';
    if (fileType.includes('pdf')) return '📕';
    if (fileType.includes('image')) return '🖼️';
    if (fileType.includes('word') || fileType.includes('document')) return '📝';
    if (fileType.includes('powerpoint') || fileType.includes('presentation')) return '📊';
    if (fileType.includes('text')) return '📄';
    return '📁';
  };

  const getFileTypeLabel = (fileType) => {
    if (!fileType) return 'File';
    if (fileType.includes('pdf')) return 'PDF';
    if (fileType.includes('image')) return 'Image';
    if (fileType.includes('word') || fileType.includes('document')) return 'Word';
    if (fileType.includes('powerpoint') || fileType.includes('presentation')) return 'PowerPoint';
    if (fileType.includes('text')) return 'Text';
    return 'File';
  };

  return (
    <div className="note-card">
      <div className="note-header">
        <h3 className="note-title">{note.title}</h3>
        <span className="note-subject">{note.subject}</span>
      </div>
      
      <p className="note-description">{note.description}</p>
      
      <div className="note-info">
        <div className="note-meta">
          <span>📁 {note.fileName}</span>
          <span>� {getFileTypeIcon(note.fileType)} {getFileTypeLabel(note.fileType)}</span>
          <span>�📏 {formatFileSize(note.fileSize)}</span>
          <span>👤 {note.uploadedBy?.name || 'Unknown'}</span>
          <span>📅 {formatDate(note.createdAt)}</span>
          <span>⬇️ {note.downloads} downloads</span>
        </div>
      </div>
      
      <div className="note-actions">
        <button 
          onClick={() => onDownload(note._id)} 
          className="btn btn-primary"
        >
          Download File
        </button>
        
        {showActions && onDelete && (
          <button 
            onClick={() => onDelete(note._id)} 
            className="btn btn-danger"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
};

export default NoteCard;