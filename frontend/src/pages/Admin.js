import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Admin.css';

const Admin = () => {
    const { user, isAdmin } = useAuth();
    const [notes, setNotes] = useState([]);
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState({
        totalNotes: 0,
        totalUsers: 0,
        totalDownloads: 0
    });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('dashboard');

    useEffect(() => {
        if (isAdmin) {
            fetchAdminData();
        }
    }, [isAdmin]);

    const fetchAdminData = async () => {
        try {
            setLoading(true);
            
            // Fetch all notes
            const notesResponse = await api.get('/admin/notes');
            setNotes(notesResponse.data);
            
            // Fetch all users
            const usersResponse = await api.get('/admin/users');
            setUsers(usersResponse.data);
            
            // Calculate stats
            const totalDownloads = notesResponse.data.reduce((sum, note) => sum + (note.downloads || 0), 0);
            setStats({
                totalNotes: notesResponse.data.length,
                totalUsers: usersResponse.data.length,
                totalDownloads
            });
            
        } catch (error) {
            console.error('Error fetching admin data:', error);
        } finally {
            setLoading(false);
        }
    };

    const deleteNote = async (noteId) => {
        if (window.confirm('Are you sure you want to delete this note?')) {
            try {
                await api.delete(`/admin/notes/${noteId}`);
                setNotes(notes.filter(note => note._id !== noteId));
                setStats(prev => ({ ...prev, totalNotes: prev.totalNotes - 1 }));
            } catch (error) {
                console.error('Error deleting note:', error);
                alert('Error deleting note');
            }
        }
    };

    const deleteUser = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user? All their notes will also be deleted.')) {
            try {
                await api.delete(`/admin/users/${userId}`);
                setUsers(users.filter(user => user._id !== userId));
                setStats(prev => ({ ...prev, totalUsers: prev.totalUsers - 1 }));
                // Refresh notes to reflect any deleted user notes
                fetchAdminData();
            } catch (error) {
                console.error('Error deleting user:', error);
                alert('Error deleting user');
            }
        }
    };

    if (!user) {
        return (
            <div className="admin-page">
                <div className="container">
                    <div className="auth-required">
                        <h2>Authentication Required</h2>
                        <p>Please log in to access the admin panel.</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="admin-page">
                <div className="container">
                    <div className="access-denied">
                        <h2>Access Denied</h2>
                        <p>You don't have permission to access the admin panel.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-page">
            <div className="container">
                <div className="admin-header">
                    <h1>🛠️ Admin Panel</h1>
                    <p>Welcome, Admin! Manage the notes sharing platform.</p>
                </div>

                <div className="admin-tabs">
                    <button 
                        className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
                        onClick={() => setActiveTab('dashboard')}
                    >
                        Dashboard
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'notes' ? 'active' : ''}`}
                        onClick={() => setActiveTab('notes')}
                    >
                        Notes Management
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
                        onClick={() => setActiveTab('users')}
                    >
                        Users Management
                    </button>
                </div>

                {loading ? (
                    <div className="loading">Loading admin data...</div>
                ) : (
                    <div className="admin-content">
                        {activeTab === 'dashboard' && (
                            <div className="dashboard-tab">
                                <div className="stats-grid">
                                    <div className="stat-card">
                                        <h3>Total Notes</h3>
                                        <div className="stat-number">{stats.totalNotes}</div>
                                    </div>
                                    <div className="stat-card">
                                        <h3>Total Users</h3>
                                        <div className="stat-number">{stats.totalUsers}</div>
                                    </div>
                                    <div className="stat-card">
                                        <h3>Total Downloads</h3>
                                        <div className="stat-number">{stats.totalDownloads}</div>
                                    </div>
                                </div>
                                
                                <div className="recent-activity">
                                    <h3>Recent Notes</h3>
                                    <div className="activity-list">
                                        {notes.slice(0, 5).map(note => (
                                            <div key={note._id} className="activity-item">
                                                <strong>{note.title}</strong>
                                                <span>by {note.uploadedBy?.name || 'Unknown'}</span>
                                                <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'notes' && (
                            <div className="notes-tab">
                                <h3>All Notes ({notes.length})</h3>
                                <div className="notes-table">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Title</th>
                                                <th>Subject</th>
                                                <th>Uploaded By</th>
                                                <th>File Type</th>
                                                <th>Downloads</th>
                                                <th>Date</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {notes.map(note => (
                                                <tr key={note._id}>
                                                    <td>{note.title}</td>
                                                    <td>{note.subject}</td>
                                                    <td>{note.uploadedBy?.name || 'Unknown'}</td>
                                                    <td>{note.fileType}</td>
                                                    <td>{note.downloads || 0}</td>
                                                    <td>{new Date(note.createdAt).toLocaleDateString()}</td>
                                                    <td>
                                                        <button 
                                                            onClick={() => deleteNote(note._id)}
                                                            className="btn btn-danger btn-sm"
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'users' && (
                            <div className="users-tab">
                                <h3>All Users ({users.length})</h3>
                                <div className="users-table">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Email</th>
                                                <th>Admin</th>
                                                <th>Join Date</th>
                                                <th>Notes Count</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.map(user => (
                                                <tr key={user._id}>
                                                    <td>{user.name}</td>
                                                    <td>{user.email}</td>
                                                    <td>{user.adminId === '11663645' ? 'Yes' : 'No'}</td>
                                                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                                    <td>{notes.filter(note => note.uploadedBy?._id === user._id).length}</td>
                                                    <td>
                                                        {user.adminId !== '11663645' && (
                                                            <button 
                                                                onClick={() => deleteUser(user._id)}
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
                    </div>
                )}
            </div>
        </div>
    );
};

export default Admin;