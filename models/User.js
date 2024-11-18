const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Personal Information
  fullName: { type: String, required: true, trim: true },
  dateOfBirth: { type: Date, required: true },
  gender: { type: String, required: true, enum: ['Male', 'Female', 'Other'] },
  nationality: { type: String, required: true, trim: true },
  maritalStatus: { type: String, required: true, enum: ['Single', 'Married', 'Other'], default: 'Single' },
  permanentAddress: { type: String, required: true, trim: true },
  temporaryAddress: { type: String, trim: true },
  contactNumber: { type: String, required: true, match: /^\d{10}$/ },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },

  // Employment Details
  employeeId: { type: String, required: true, unique: true },
  designation: { type: String, required: true },
  department: { type: String, required: true },
  dateOfJoining: { type: Date, required: true },
  employmentType: { type: String, required: true, enum: ['Full-Time', 'Part-Time', 'Contract'] },
  reportingManager: { type: String, required: true },
  workLocation: { type: String, required: true },

  // Identification Documents
  panNumber: { type: String, required: true, unique: true },
  aadharNumber: { type: String, required: true, unique: true, match: /^\d{12}$/ },
  passportNumber: { type: String, unique: true },
  socialSecurityNumber: { type: String, unique: true },
  drivingLicenseNumber: { type: String, unique: true },

  // Banking and Payroll Information
  bankAccountNumber: { type: String, required: true, unique: true },
  bankName: { type: String, required: true },
  bankBranch: { type: String, required: true },
  ifscCode: { type: String, required: true },
  payrollPreferences: { type: String, required: true },
  salaryStructure: { type: String, required: true },

  // Emergency Contact Details
  emergencyContactName: { type: String, required: true },
  emergencyContactRelationship: { type: String, required: true },
  emergencyContactPhone: { type: String, required: true, match: /^\d{10}$/ },
  emergencyContactAddress: { type: String, required: true },

  // Educational Qualifications
  degree: { type: String, required: true },
  university: { type: String, required: true },
  yearOfGraduation: { type: Number, required: true, min: 1900, max: new Date().getFullYear() },
  departmentLogo: { type: String, required: true },
  photo: { type: String },
  specializations: { type: String, trim: true },

  // Previous Employment Details
  previousEmployers: [
    {
      employerName: { type: String, trim: true },
      designation: { type: String },
      duration: { type: String },
      reasonForLeaving: { type: String },
    },
  ],

  // Health and Insurance Information
  medicalHistory: { type: String, trim: true },
  healthInsurancePolicyNumber: { type: String, unique: true },
  healthInsuranceProvider: { type: String, trim: true },
  providentFundInfo: { type: String },

  // Tax and Legal Information
  taxDeclarationForm: { type: String },
  taxExemptionDetails: { type: String },
  legalComplianceDocs: { type: String },

  // Additional Information
  skillsCertifications: { type: String, trim: true },
  languageProficiency: { type: String, trim: true },
  professionalReferences: { type: String },

  // Password and Authentication
  password: { type: String, required: true },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
module.exports = User;

