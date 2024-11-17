const bcrypt = require('bcryptjs');

const verifyPassword = async (plaintextPassword, hashedPassword) => {
    try {
        // Compare the plaintext password with the hashed password
        const isMatch = await bcrypt.compare(plaintextPassword, hashedPassword);
        console.log('Password Match:', isMatch);
        return isMatch;
    } catch (error) {
        console.error('Error verifying password:', error);
        return false;
    }
};

// Example usage
const hashedPassword = '$2a$12$kqIE0dPFGEg4s3OjJbJ2mePMmQCb4Zc1ERvCvJ9GT86fN.zockpcK'; // Replace with your bcrypt hash
const plaintextPassword = 'Viveksam@1234'; // Replace with the password you want to verify

verifyPassword(plaintextPassword, hashedPassword);
