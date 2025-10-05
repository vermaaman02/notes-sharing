const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      isAdmin: email === process.env.ADMIN_EMAIL // Auto-admin for admin email
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create admin (one-time use - remove after creating admin)
router.post('/create-admin', async (req, res) => {
  try {
    const { name, email, password, adminKey } = req.body;
    
    // Simple admin key check (change this to something secure)
    if (adminKey !== 'create-admin-2025') {
      return res.status(403).json({ message: 'Invalid admin key' });
    }

    // Check if admin already exists
    const existingAdmin = await User.findOne({ isAdmin: true });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    // Create admin user
    const adminUser = new User({
      name,
      email,
      password,
      isAdmin: true
    });

    await adminUser.save();
    res.status(201).json({ message: 'Admin user created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin Login
router.post('/admin-login', async (req, res) => {
  try {
    const { adminId, password } = req.body;

    // Check admin credentials
    if (adminId !== process.env.ADMIN_ID || password !== process.env.ADMIN_PASSWORD) {
      return res.status(400).json({ message: 'Invalid admin credentials' });
    }

    // Find or create admin user
    let adminUser = await User.findOne({ adminId: adminId });
    
    if (!adminUser) {
      // Create admin user if doesn't exist
      adminUser = new User({
        name: 'Admin',
        email: `admin_${adminId}@system.local`,
        password: password,
        adminId: adminId,
        isAdmin: true
      });
      await adminUser.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: adminUser._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: adminUser._id,
        name: adminUser.name,
        email: adminUser.email,
        adminId: adminUser.adminId,
        isAdmin: true
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;