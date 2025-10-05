import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import NoteCard from '../components/NoteCard';
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
      setNotes(response.data);
      
      // Extract unique subjects
      const uniqueSubjects = [...new Set(response.data.map(note => note.subject))];
      setSubjects(uniqueSubjects);
      
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch notes');
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
      
      // Update download count
      fetchNotes();
      toast.success('Download started');
    } catch (error) {
      toast.error('Failed to download file');
    }
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = !subjectFilter || note.subject === subjectFilter;
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
                <NoteCard
                  key={note._id}
                  note={note}
                  onDownload={handleDownload}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;