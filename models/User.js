const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define regex patterns for validation
const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
const phoneRegex = /^\+?[\d\s-]{8,}$/;
const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
const aadharRegex = /^\d{12}$/;
const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;

const userSchema = new mongoose.Schema({
  // Personal Information
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    minlength: [2, 'Full name must be at least 2 characters long'],
    maxlength: [100, 'Full name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [emailRegex, 'Please provide a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false // Don't include password in queries by default
  },
  dateOfBirth: {
    type: Date,
    validate: {
      validator: function(value) {
        return value <= new Date();
      },
      message: 'Date of birth cannot be in the future'
    }
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other', 'Prefer not to say']
  },
  nationality: {
    type: String,
    trim: true
  },
  maritalStatus: {
    type: String,
    enum: ['Single', 'Married', 'Divorced', 'Widowed', 'Other']
  },

  // Contact Information
  permanentAddress: {
    type: String,
    trim: true,
    required: [true, 'Permanent address is required']
  },
  temporaryAddress: {
    type: String,
    trim: true
  },
  contactNumber: {
    type: String,
    required: [true, 'Contact number is required'],
    match: [phoneRegex, 'Please provide a valid phone number']
  },
  photo: {
    type: String,
    trim: true
  },

  // Educational Information
  education: {
    degree: {
      type: String,
      trim: true
    },
    university: {
      type: String,
      trim: true
    },
    yearOfGraduation: {
      type: String,
      validate: {
        validator: function(value) {
          const year = parseInt(value);
          return year >= 1950 && year <= new Date().getFullYear();
        },
        message: 'Please provide a valid graduation year'
      }
    }
  },

  // Employment Information
  employeeId: {
    type: String,
    required: [true, 'Employee ID is required'],
    unique: true,
    trim: true
  },
  designation: {
    type: String,
    required: [true, 'Designation is required'],
    trim: true
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true
  },
  dateOfJoining: {
    type: Date,
    required: [true, 'Date of joining is required']
  },
  employmentType: {
    type: String,
    required: [true, 'Employment type is required'],
    enum: ['Full-time', 'Part-time', 'Contract', 'Intern', 'Consultant']
  },
  reportingManager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  workLocation: {
    type: String,
    required: [true, 'Work location is required'],
    trim: true
  },

  // Identity Documents
  panNumber: {
    type: String,
    match: [panRegex, 'Please provide a valid PAN number'],
    uppercase: true,
    sparse: true,
    unique: true
  },
  aadharNumber: {
    type: String,
    match: [aadharRegex, 'Please provide a valid Aadhar number'],
    sparse: true,
    unique: true
  },
  passportNumber: {
    type: String,
    trim: true,
    sparse: true,
    unique: true
  },
  socialSecurityNumber: {
    type: String,
    trim: true,
    sparse: true,
    unique: true
  },
  drivingLicenseNumber: {
    type: String,
    trim: true,
    sparse: true,
    unique: true
  },

  // Banking Information
  bankDetails: {
    accountNumber: {
      type: String,
      required: [true, 'Bank account number is required'],
      trim: true
    },
    bankName: {
      type: String,
      required: [true, 'Bank name is required'],
      trim: true
    },
    bankBranch: {
      type: String,
      required: [true, 'Bank branch is required'],
      trim: true
    },
    ifscCode: {
      type: String,
      required: [true, 'IFSC code is required'],
      match: [ifscRegex, 'Please provide a valid IFSC code'],
      uppercase: true
    }
  },

  // Payroll Information
  payrollPreferences: {
    type: String,
    trim: true
  },
  salaryStructure: {
    type: mongoose.Schema.Types.Mixed,
    select: false // Sensitive information, only fetch when needed
  },

  // Emergency Contact
  emergencyContact: {
    name: {
      type: String,
      required: [true, 'Emergency contact name is required'],
      trim: true
    },
    relationship: {
      type: String,
      required: [true, 'Emergency contact relationship is required'],
      trim: true
    },
    phone: {
      type: String,
      required: [true, 'Emergency contact phone is required'],
      match: [phoneRegex, 'Please provide a valid emergency contact phone number']
    },
    address: {
      type: String,
      required: [true, 'Emergency contact address is required'],
      trim: true
    }
  },

  // System fields
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ employeeId: 1 });
userSchema.index({ department: 1, designation: 1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Virtual for full name
userSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  return Math.floor((new Date() - this.dateOfBirth) / (365.25 * 24 * 60 * 60 * 1000));
});

const User = mongoose.model('User', userSchema);
module.exports = User;