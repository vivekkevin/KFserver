const bcrypt = require('bcryptjs');

const hashPassword = async (password) => {
    try {
        // Generate a salt
        const salt = await bcrypt.genSalt(10);

        // Hash the password with the salt
        const hashedPassword = await bcrypt.hash(password, salt);

        console.log('Original password:', password);
        console.log('Hashed password:', hashedPassword);

        return hashedPassword;
    } catch (error) {
        console.error('Error hashing password:', error);
        throw error;
    }
};

// Example usage
const plainPassword = 'mypassword123'; // Replace with your actual password
hashPassword(plainPassword);
