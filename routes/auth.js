const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const fs = require('fs'); 
const path = require('path'); 
const User = require('../models/User');

const router = express.Router();

// Ensure the uploads/photos directory exists
const ensureDirectoryExistence = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Set up multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/photos/';
    ensureDirectoryExistence(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const fileName = Date.now() + '-' + file.originalname;
    cb(null, fileName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images are allowed'));
    }
  },
});

// Register Route
router.post('/register', upload.single('photo'), async (req, res) => {
  try {
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
      departmentLogo,
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

    // Check if the user already exists by email
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create a new user object with all the employee details
    const user = new User({
      fullName,
      dateOfBirth,
      gender,
      nationality,
      maritalStatus,
      permanentAddress,
      temporaryAddress,
      contactNumber,
      email,
      password: hashedPassword,
      departmentLogo,
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

    // Save the user to the database
    await user.save();

    // Respond with success message
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    if (error instanceof multer.MulterError) {
      return res.status(400).json({ message: error.message });
    }
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Attempting login for:', email);

    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found');
      return res.status(404).json({ message: 'User not found' });
    }

    console.log(`Entered password: "${password}"`);
    console.log(`Stored password hash: "${user.password}"`);

    // Use bcryptjs to compare the entered password with the stored hash
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('Password validation result:', isPasswordValid);

    if (!isPasswordValid) {
      console.log('Invalid password');
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check for JWT secret
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not defined');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    // Generate the token and return the user info
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user: { id: user._id, fullName: user.fullName, email: user.email } });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;
