const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();
const mkdir = promisify(fs.mkdir);

// Constants
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = /jpeg|jpg|png/;
const TOKEN_EXPIRY = '1d';
const UPLOAD_PATH = 'uploads/photos';

// Helper Functions
const createJwtToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );
};

const validateFileType = (file) => {
  const extname = ALLOWED_FILE_TYPES.test(path.extname(file.originalname).toLowerCase());
  const mimetype = ALLOWED_FILE_TYPES.test(file.mimetype);
  return mimetype && extname;
};

// Ensure upload directory exists
const ensureUploadDir = async () => {
  try {
    await mkdir(UPLOAD_PATH, { recursive: true });
  } catch (error) {
    console.error('Error creating upload directory:', error);
    throw new Error('Failed to create upload directory');
  }
};

// Multer Configuration
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    await ensureUploadDir();
    cb(null, UPLOAD_PATH);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1
  },
  fileFilter: (req, file, cb) => {
    if (validateFileType(file)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, JPG, and PNG files are allowed.'));
    }
  }
});

// Validation Middleware
const validateRegistration = async (req, res, next) => {
  try {
    const { email, password, fullName, contactNumber } = req.body;
    const errors = [];

    // Email validation
    if (!email || !email.match(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/)) {
      errors.push('Valid email address is required');
    }

    // Password validation
    if (!password || !password.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,})/)) {
      errors.push('Password must contain at least 8 characters, including uppercase, lowercase, number, and special character');
    }

    // Name validation
    if (!fullName || fullName.trim().length < 2) {
      errors.push('Full name must be at least 2 characters long');
    }

    // Phone validation
    if (!contactNumber || !contactNumber.match(/^\+?[\d\s-]{8,}$/)) {
      errors.push('Valid contact number is required');
    }

    // Check for existing user
    if (email) {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        errors.push('Email address is already registered');
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Route Handlers
const handleRegistration = async (req, res) => {
  try {
    const userData = { ...req.body };
    
    // Set photo path if file was uploaded
    if (req.file) {
      userData.photo = path.join(UPLOAD_PATH, req.file.filename);
    }

    // Create new user
    const user = new User(userData);
    await user.save();

    // Generate token
    const token = createJwtToken(user._id);

    // Send response
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        employeeId: user.employeeId
      }
    });
  } catch (error) {
    throw error;
  }
};

const handleLogin = async (req, res) => {
  const { email, password } = req.body;

  // Find user
  const user = await User.findOne({ email: email.toLowerCase() })
    .select('+password')
    .lean();

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  // Verify password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  // Generate token
  const token = createJwtToken(user._id);

  // Update last login
  await User.findByIdAndUpdate(user._id, {
    lastLogin: new Date()
  });

  // Send response
  delete user.password;
  res.json({
    success: true,
    message: 'Login successful',
    token,
    user
  });
};

// Routes
router.post(
  '/register',
  upload.single('photo'),
  validateRegistration,
  async (req, res, next) => {
    try {
      await handleRegistration(req, res);
    } catch (error) {
      next(error);
    }
  }
);

router.post('/login', async (req, res, next) => {
  try {
    await handleLogin(req, res);
  } catch (error) {
    next(error);
  }
});

router.get('/profile', auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId)
      .select('-password')
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
});

router.put(
  '/profile',
  auth,
  upload.single('photo'),
  async (req, res, next) => {
    try {
      const updates = { ...req.body };
      delete updates.password;

      if (req.file) {
        updates.photo = path.join(UPLOAD_PATH, req.file.filename);
      }

      const user = await User.findByIdAndUpdate(
        req.user.userId,
        { $set: updates },
        { new: true, runValidators: true }
      ).select('-password');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        message: 'Profile updated successfully',
        user
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post('/change-password', auth, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.userId).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
});

router.post('/logout', auth, (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: new Date(0)
  });

  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

module.exports = router;