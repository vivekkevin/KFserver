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
const hashedPassword = '$2a$10$1OLQ33Ot3.61JGVpSaLYV.V61EwLITy6wI6DAJc9f/jupJLui5D2G'; // Replace with your bcrypt hash
const plaintextPassword = 'Suresh@1234'; // Replace with the password you want to verify

verifyPassword(plaintextPassword, hashedPassword);
