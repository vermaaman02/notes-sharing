const express = require('express');
const User = require('../models/User');
const Note = require('../models/Note');
const { adminAuth } = require('../middleware/auth');
const azureStorage = require('../services/azureStorage');
const router = express.Router();

// Get all users (admin only)
router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find().select('-password').lean();
    // Sort manually after fetching (Azure Cosmos DB indexing issue)
    users.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all notes (admin only)
router.get('/notes', adminAuth, async (req, res) => {
  try {
    const notes = await Note.find()
      .populate('uploadedBy', 'name email')
      .lean();
    // Sort manually after fetching (Azure Cosmos DB indexing issue)
    notes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete note (admin only)
router.delete('/notes/:id', adminAuth, async (req, res) => {
  try {
    const note = await Note.findByIdAndDelete(req.params.id);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Delete file from Azure Blob Storage
    try {
      await azureStorage.deleteFile(note.blobName);
    } catch (deleteError) {
      console.error('Error deleting file from Azure Storage:', deleteError);
      // Continue even if file deletion fails
    }

    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Toggle note approval (admin only)
router.patch('/notes/:id/approve', adminAuth, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    note.isApproved = !note.isApproved;
    await note.save();

    res.json(note);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete user (admin only)
router.delete('/users/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get all notes uploaded by this user
    const userNotes = await Note.find({ uploadedBy: req.params.id });
    
    // Delete files from Azure Blob Storage
    for (const note of userNotes) {
      try {
        await azureStorage.deleteFile(note.blobName);
      } catch (deleteError) {
        console.error(`Error deleting file ${note.blobName} from Azure Storage:`, deleteError);
        // Continue even if file deletion fails
      }
    }

    // Delete all notes uploaded by this user
    await Note.deleteMany({ uploadedBy: req.params.id });

    res.json({ message: 'User and associated notes deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get dashboard stats (admin only)
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalNotes = await Note.countDocuments();
    const approvedNotes = await Note.countDocuments({ isApproved: true });
    const totalDownloads = await Note.aggregate([
      { $group: { _id: null, total: { $sum: '$downloads' } } }
    ]);

    res.json({
      totalUsers,
      totalNotes,
      approvedNotes,
      totalDownloads: totalDownloads[0]?.total || 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;