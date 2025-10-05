import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import './AdminPanel.css';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, usersRes, notesRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/notes')
      ]);
      
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setNotes(notesRes.data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch admin data');
      setLoading(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await api.delete(`/admin/notes/${noteId}`);
        setNotes(notes.filter(note => note._id !== noteId));
        toast.success('Note deleted successfully');
        fetchDashboardData(); // Refresh stats
      } catch (error) {
        toast.error('Failed to delete note');
      }
    }
  };

  const handleToggleApproval = async (noteId) => {
    try {
      const response = await api.patch(`/admin/notes/${noteId}/approve`);
      setNotes(notes.map(note => 
        note._id === noteId ? response.data : note
      ));
      toast.success('Note status updated');
    } catch (error) {
      toast.error('Failed to update note status');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user and all their notes?')) {
      try {
        await api.delete(`/admin/users/${userId}`);
        setUsers(users.filter(user => user._id !== userId));
        toast.success('User deleted successfully');
        fetchDashboardData(); // Refresh data
      } catch (error) {
        toast.error('Failed to delete user');
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading admin panel...</div>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <div className="container">
        <div className="admin-header">
          <h1>🔧 Admin Panel</h1>
          <p>Manage users, notes, and platform statistics</p>
        </div>

        <div className="admin-tabs">
          <button
            className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button
            className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Users ({users.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'notes' ? 'active' : ''}`}
            onClick={() => setActiveTab('notes')}
          >
            Notes ({notes.length})
          </button>
        </div>

        <div className="admin-content">
          {activeTab === 'dashboard' && (
            <div className="dashboard-tab">
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>{stats.totalUsers}</h3>
                  <p>Total Users</p>
                </div>
                <div className="stat-card">
                  <h3>{stats.totalNotes}</h3>
                  <p>Total Notes</p>
                </div>
                <div className="stat-card">
                  <h3>{stats.approvedNotes}</h3>
                  <p>Approved Notes</p>
                </div>
                <div className="stat-card">
                  <h3>{stats.totalDownloads}</h3>
                  <p>Total Downloads</p>
                </div>
              </div>

              <div className="recent-activity">
                <h3>Recent Notes</h3>
                <div className="activity-list">
                  {notes.slice(0, 5).map(note => (
                    <div key={note._id} className="activity-item">
                      <div>
                        <strong>{note.title}</strong> by {note.uploadedBy.name}
                        <br />
                        <small>{formatDate(note.createdAt)}</small>
                      </div>
                      <span className={`status-badge ${note.isApproved ? 'approved' : 'pending'}`}>
                        {note.isApproved ? 'Approved' : 'Pending'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="users-tab">
              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user._id}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`role-badge ${user.isAdmin ? 'admin' : 'user'}`}>
                            {user.isAdmin ? 'Admin' : 'User'}
                          </span>
                        </td>
                        <td>{formatDate(user.createdAt)}</td>
                        <td>
                          {!user.isAdmin && (
                            <button
                              onClick={() => handleDeleteUser(user._id)}
                              className="btn btn-danger btn-sm"
                            >
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="notes-tab">
              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Subject</th>
                      <th>Uploaded By</th>
                      <th>Size</th>
                      <th>Downloads</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {notes.map(note => (
                      <tr key={note._id}>
                        <td>
                          <div className="note-title-cell">
                            <strong>{note.title}</strong>
                            <small>{note.description.substring(0, 50)}...</small>
                          </div>
                        </td>
                        <td>{note.subject}</td>
                        <td>{note.uploadedBy.name}</td>
                        <td>{formatFileSize(note.fileSize)}</td>
                        <td>{note.downloads}</td>
                        <td>
                          <span className={`status-badge ${note.isApproved ? 'approved' : 'pending'}`}>
                            {note.isApproved ? 'Approved' : 'Pending'}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              onClick={() => handleToggleApproval(note._id)}
                              className={`btn btn-sm ${note.isApproved ? 'btn-secondary' : 'btn-success'}`}
                            >
                              {note.isApproved ? 'Disapprove' : 'Approve'}
                            </button>
                            <button
                              onClick={() => handleDeleteNote(note._id)}
                              className="btn btn-danger btn-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;