const express = require('express');
const multer = require('multer');
const path = require('path');
const Note = require('../models/Note');
const { auth } = require('../middleware/auth');
const azureStorage = require('../services/azureStorage');
const router = express.Router();

// Configure multer for memory storage (since we're uploading to Azure)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
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
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('File type not supported! Supported types: PDF, Images (JPG, PNG, GIF), Word, PowerPoint, Text files'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024 // 25MB limit for all file types
  }
});

// Get all notes (public access)
router.get('/', async (req, res) => {
  try {
    const { subject, search } = req.query;
    let query = { isApproved: true };

    if (subject) {
      query.subject = { $regex: subject, $options: 'i' };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const notes = await Note.find(query)
      .populate('uploadedBy', 'name')
      .lean(); // Add lean() for better performance

    // Sort manually after fetching (Azure Cosmos DB indexing issue)
    notes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    console.log(`Found ${notes.length} notes`);
    res.json(notes);
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Upload note (authenticated users only)
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    const { title, description, subject } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    // Upload file to Azure Blob Storage
    const uploadResult = await azureStorage.uploadFile(
      req.file.buffer,
      req.file.originalname,
      req.file.originalname,
      req.file.mimetype
    );

    const note = new Note({
      title,
      description,
      subject,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      blobName: uploadResult.blobName,
      blobUrl: uploadResult.url,
      filePath: uploadResult.blobName, // Store blob name for backward compatibility
      fileSize: uploadResult.size,
      uploadedBy: req.user._id
    });

    await note.save();
    await note.populate('uploadedBy', 'name');

    res.status(201).json(note);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Download note
router.get('/download/:id', async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Increment download count
    note.downloads += 1;
    await note.save();

    // Download from Azure Blob Storage
    const downloadResponse = await azureStorage.downloadFile(note.blobName);
    
    // Set appropriate headers based on file type
    res.setHeader('Content-Type', note.fileType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${note.fileName}"`);
    
    // Stream the file
    downloadResponse.readableStreamBody.pipe(res);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's uploaded notes
router.get('/my-notes', auth, async (req, res) => {
  try {
    const notes = await Note.find({ uploadedBy: req.user._id }).lean();
    // Sort manually after fetching (Azure Cosmos DB indexing issue)
    notes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;