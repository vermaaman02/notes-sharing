import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './Home.css';

const Home = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await api.get('/notes/all');
      console.log('Fetched notes:', response.data);
      
      if (response.data && Array.isArray(response.data)) {
        setNotes(response.data);
        
        // Extract unique subjects safely
        const uniqueSubjects = [...new Set(response.data.map(note => note.subject).filter(Boolean))];
        setSubjects(uniqueSubjects);
      } else {
        setNotes([]);
        setSubjects([]);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch notes:', error);
      setNotes([]);
      setSubjects([]);
      setLoading(false);
      // Don't show alert immediately, just log for now
    }
  };

  const handleDownload = async (noteId) => {
    if (!noteId) {
      alert('Cannot download: Note ID is missing');
      return;
    }
    
    try {
      const response = await api.get(`/notes/download/${noteId}`, {
        responseType: 'blob'
      });
      
      if (!response || !response.data) {
        throw new Error('No data received from server');
      }
      
      const note = notes.find(n => n && n._id === noteId);
      if (!note) {
        throw new Error('Note information not found');
      }
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', note.fileName || `note-${noteId}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        link.remove();
      }, 100);
      
      // Update download count
      fetchNotes();
      alert('Download started');
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download file: ' + (error.message || 'Unknown error'));
    }
  };

  const filteredNotes = notes.filter(note => {
    // Only process notes with required fields
    if (!note || !note.title || !note.description) {
      return false;
    }
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = !subjectFilter || (note.subject && note.subject === subjectFilter);
    return matchesSearch && matchesSubject;
  });

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading notes...</div>
      </div>
    );
  }

  return (
    <div className="home-page">
      <div className="container">
        <div className="hero-section">
          <h1>📚 Welcome to Notes Sharing Platform</h1>
          <p>Share and discover study materials uploaded by students</p>
        </div>

        <div className="filters-section">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search notes by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-control"
            />
          </div>
          
          <div className="filter-dropdown">
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="form-control"
            >
              <option value="">All Subjects</option>
              {subjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="notes-section">
          <h2>Available Notes ({filteredNotes.length})</h2>
          
          {filteredNotes.length === 0 ? (
            <div className="no-notes">
              <p>No notes found. Be the first to upload some notes!</p>
            </div>
          ) : (
            <div className="notes-grid">
              {filteredNotes.map(note => (
                <div key={note._id || `note-${Math.random()}`} className="note-card">
                  <h3>{note.title || 'Untitled Note'}</h3>
                  <p><strong>Subject:</strong> {note.subject || 'N/A'}</p>
                  <p><strong>Description:</strong> {note.description || 'No description available'}</p>
                  <p><strong>Uploaded by:</strong> {(note.uploadedBy && note.uploadedBy.name) ? note.uploadedBy.name : 'Unknown'}</p>
                  <p><strong>Downloads:</strong> {note.downloads || 0}</p>
                  <button 
                    onClick={() => note._id && handleDownload(note._id)}
                    className="btn btn-primary"
                    disabled={!note._id}
                  >
                    Download
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;