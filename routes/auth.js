const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Define regex patterns
const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
const passwordStrengthRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,})/;
const phoneRegex = /^\+?[\d\s-]{8,}$/;

// Ensure uploads directory exists
const ensureDirectoryExistence = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/photos/';
    ensureDirectoryExistence(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const fileName = Date.now() + '-' + file.originalname.replace(/\s+/g, '-');
    cb(null, fileName);
  },
});

// File upload configuration
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files (JPEG, JPG, PNG) are allowed'));
  },
});

// Validation middleware
const validateRegistrationInput = (req, res, next) => {
  const errors = [];
  const { email, password, fullName, contactNumber } = req.body;

  if (!email || !emailRegex.test(email)) {
    errors.push('Invalid email format');
  }

  if (!password || !passwordStrengthRegex.test(password)) {
    errors.push('Password must be at least 8 characters long and include at least one number, uppercase letter, lowercase letter, and special character');
  }

  if (!fullName || fullName.trim().length < 2) {
    errors.push('Full name is required and must be at least 2 characters');
  }

  if (!contactNumber || !phoneRegex.test(contactNumber)) {
    errors.push('Valid contact number is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

// Register route
router.post('/register', upload.single('photo'), validateRegistrationInput, async (req, res) => {
  try {
    console.log('Registration request body:', JSON.stringify(req.body, null, 2));
    console.log('Registration attempt for email:', req.body.email);
    
    const {
      fullName,
      dateOfBirth,
      gender,
      nationality,
      maritalStatus,
      permanentAddress,
      temporaryAddress,
      contactNumber,
      email,
      password,
      degree,
      university,
      yearOfGraduation,
      employeeId,
      designation,
      department,
      dateOfJoining,
      employmentType,
      reportingManager,
      workLocation,
      panNumber,
      aadharNumber,
      passportNumber,
      socialSecurityNumber,
      drivingLicenseNumber,
      bankAccountNumber,
      bankName,
      bankBranch,
      ifscCode,
      payrollPreferences,
      salaryStructure,
      emergencyContactName,
      emergencyContactRelationship,
      emergencyContactPhone,
      emergencyContactAddress,
    } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = new User({
      fullName,
      dateOfBirth,
      gender,
      nationality,
      maritalStatus,
      permanentAddress,
      temporaryAddress,
      contactNumber,
      email: email.toLowerCase(),
      password: hashedPassword,
      photo: req.file ? `uploads/photos/${req.file.filename}` : '',
      degree,
      university,
      yearOfGraduation,
      employeeId,
      designation,
      department,
      dateOfJoining,
      employmentType,
      reportingManager,
      workLocation,
      panNumber,
      aadharNumber,
      passportNumber,
      socialSecurityNumber,
      drivingLicenseNumber,
      bankAccountNumber,
      bankName,
      bankBranch,
      ifscCode,
      payrollPreferences,
      salaryStructure,
      emergencyContactName,
      emergencyContactRelationship,
      emergencyContactPhone,
      emergencyContactAddress,
    });

    await user.save();
    console.log('User saved successfully:', user._id);

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token
    });

  } catch (error) {
      console.error('Detailed registration error:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    console.error('Registration error:', error);
    
    if (error instanceof multer.MulterError) {
      return res.status(400).json({
        success: false,
        message: `File upload error: ${error.message}`
      });
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'This email is already registered'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        type: error.name,
        details: error.stack
      } : 'Internal server error'
    });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
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

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Set token in cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        employeeId: user.employeeId,
        designation: user.designation,
        department: user.department
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// Get current user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
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
    console.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile'
    });
  }
});

// Update user profile
router.put('/profile', auth, upload.single('photo'), async (req, res) => {
  try {
    const updates = req.body;
    delete updates.password; // Prevent password update through this route

    if (req.file) {
      updates.photo = `uploads/photos/${req.file.filename}`;
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
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile'
    });
  }
});

// Change password
router.post('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    // Get user
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while changing password'
    });
  }
});

// Logout route
router.post('/logout', (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0)
  });
  
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

module.exports = router;