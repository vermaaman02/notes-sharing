import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import NoteCard from '../components/NoteCard';
import './MyNotes.css';

const MyNotes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyNotes();
  }, []);

  const fetchMyNotes = async () => {
    try {
      const response = await api.get('/notes/my-notes');
      setNotes(response.data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch your notes');
      setLoading(false);
    }
  };

  const handleDownload = async (noteId) => {
    try {
      const response = await api.get(`/notes/download/${noteId}`, {
        responseType: 'blob'
      });
      
      const note = notes.find(n => n._id === noteId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', note.fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Download started');
    } catch (error) {
      toast.error('Failed to download file');
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading your notes...</div>
      </div>
    );
  }

  return (
    <div className="my-notes-page">
      <div className="container">
        <div className="page-header">
          <h1>My Uploaded Notes</h1>
          <p>Manage and view your uploaded study materials</p>
        </div>

        {notes.length === 0 ? (
          <div className="no-notes">
            <h3>You haven't uploaded any notes yet</h3>
            <p>Start sharing your study materials with other students!</p>
            <a href="/upload" className="btn btn-primary">
              Upload Your First Notes
            </a>
          </div>
        ) : (
          <div className="notes-section">
            <div className="notes-stats">
              <div className="stat-card">
                <h3>{notes.length}</h3>
                <p>Total Notes</p>
              </div>
              <div className="stat-card">
                <h3>{notes.reduce((sum, note) => sum + note.downloads, 0)}</h3>
                <p>Total Downloads</p>
              </div>
              <div className="stat-card">
                <h3>{notes.filter(note => note.isApproved).length}</h3>
                <p>Approved Notes</p>
              </div>
            </div>

            <div className="notes-grid">
              {notes.map(note => (
                <div key={note._id} className="my-note-card">
                  <NoteCard
                    note={note}
                    onDownload={handleDownload}
                    showActions={false}
                  />
                  <div className="note-status">
                    <span className={`status-badge ${note.isApproved ? 'approved' : 'pending'}`}>
                      {note.isApproved ? '✅ Approved' : '⏳ Pending Approval'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyNotes;