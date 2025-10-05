import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import './Upload.css';

const Upload = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: ''
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const subjects = [
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'Computer Science',
    'Engineering',
    'Business',
    'Economics',
    'History',
    'Literature',
    'Psychology',
    'Other'
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain'
    ];
    
    if (selectedFile && allowedTypes.includes(selectedFile.type)) {
      setFile(selectedFile);
    } else {
      toast.error('Please select a supported file type (PDF, Images, Word, PowerPoint, or Text files)');
      e.target.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    setLoading(true);

    const uploadData = new FormData();
    uploadData.append('title', formData.title);
    uploadData.append('description', formData.description);
    uploadData.append('subject', formData.subject);
    uploadData.append('file', file);

    try {
      await api.post('/notes/upload', uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      toast.success('Notes uploaded successfully!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-page">
      <div className="container">
        <div className="upload-form-container">
          <div className="upload-form">
            <h2>Upload Notes</h2>
            <p>Share your study materials with other students</p>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="title">Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="e.g., Calculus Chapter 1 Notes"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="subject">Subject *</label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="form-control"
                  required
                >
                  <option value="">Select a subject</option>
                  {subjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="description">Description *</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="form-control"
                  rows="4"
                  placeholder="Describe what these notes cover..."
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="file">File *</label>
                <input
                  type="file"
                  id="file"
                  accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx,.ppt,.pptx,.txt"
                  onChange={handleFileChange}
                  className="form-control"
                  required
                />
                <small className="file-info">
                  Supported files: PDF, Images (JPG, PNG, GIF), Word, PowerPoint, Text files. Maximum file size: 25MB
                </small>
              </div>

              {file && (
                <div className="file-preview">
                  <p><strong>Selected file:</strong> {file.name}</p>
                  <p><strong>Size:</strong> {(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              )}

              <button 
                type="submit" 
                className="btn btn-primary upload-btn"
                disabled={loading}
              >
                {loading ? 'Uploading...' : 'Upload Notes'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upload;