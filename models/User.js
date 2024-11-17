const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  dateOfBirth: Date,
  gender: String,
  nationality: String,
  maritalStatus: String,
  permanentAddress: String,
  temporaryAddress: String,
  contactNumber: String,
  photo: String,
  degree: String,
  university: String,
  yearOfGraduation: String,
  employeeId: String,
  designation: String,
  department: String,
  dateOfJoining: Date,
  employmentType: String,
  reportingManager: String,
  workLocation: String,
  panNumber: String,
  aadharNumber: String,
  passportNumber: String,
  socialSecurityNumber: String,
  drivingLicenseNumber: String,
  bankAccountNumber: String,
  bankName: String,
  bankBranch: String,
  ifscCode: String,
  payrollPreferences: String,
  salaryStructure: String,
  emergencyContactName: String,
  emergencyContactRelationship: String,
  emergencyContactPhone: String,
  emergencyContactAddress: String
}, { timestamps: true });

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
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;