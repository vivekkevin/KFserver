const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    // Personal Information
    fullName: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, required: true },
    nationality: { type: String, required: true },
    maritalStatus: { type: String, required: true, default: "single" },
    permanentAddress: { type: String, required: true },
    temporaryAddress: { type: String },
    contactNumber: { type: String, required: true },
    email: { type: String, required: true, unique: true },

    // Employment Details
    employeeId: { type: String, required: true, unique: true },
    designation: { type: String, required: true },
    department: { type: String, required: true },
    dateOfJoining: { type: Date, required: true },
    employmentType: { type: String, required: true },
    reportingManager: { type: String, required: true },
    workLocation: { type: String, required: true },

    // Identification Documents
    panNumber: { type: String, required: true },
    aadharNumber: { type: String, required: true },
    passportNumber: { type: String },
    socialSecurityNumber: { type: String },
    drivingLicenseNumber: { type: String },

    // Banking and Payroll Information
    bankAccountNumber: { type: String, required: true },
    bankName: { type: String, required: true },
    bankBranch: { type: String, required: true },
    ifscCode: { type: String, required: true },
    payrollPreferences: { type: String, required: true },
    salaryStructure: { type: String, required: true },

    // Emergency Contact Details
    emergencyContactName: { type: String, required: true },
    emergencyContactRelationship: { type: String, required: true },
    emergencyContactPhone: { type: String, required: true },
    emergencyContactAddress: { type: String, required: true },

    // Educational Qualifications
    degree: { type: String, required: true },
    university: { type: String, required: true },
    yearOfGraduation: { type: String, required: true },
    departmentLogo: { type: String, required: true },
    photo: { type: String },
    specializations: { type: String },

    // Previous Employment Details
    previousEmployers: [
        {
            employerName: { type: String },
            designation: { type: String },
            duration: { type: String },
            reasonForLeaving: { type: String },
        },
    ],

    // Health and Insurance Information
    medicalHistory: { type: String },
    healthInsurancePolicyNumber: { type: String },
    healthInsuranceProvider: { type: String },
    providentFundInfo: { type: String },

    // Tax and Legal Information
    taxDeclarationForm: { type: String },
    taxExemptionDetails: { type: String },
    legalComplianceDocs: { type: String },

    // Additional Information
    skillsCertifications: { type: String },
    languageProficiency: { type: String },
    professionalReferences: { type: String },

    // Password and Authentication
    password: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);
module.exports = User;
