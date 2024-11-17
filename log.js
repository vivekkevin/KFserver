const bcrypt = require('bcryptjs');

// Simulate Registration (Hashing)
const registerUser = async (password) => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log('Hashed Password (Registration):', hashedPassword);
    return hashedPassword;
};

// Simulate Login (Comparison)
const loginUser = async (plaintextPassword, hashedPassword) => {
    const isMatch = await bcrypt.compare(plaintextPassword, hashedPassword);
    console.log('Password Match:', isMatch);
    return isMatch;
};

// Test
const test = async () => {
    const password = 'Viveksam@1234';

    // Simulate registration
    const hashedPassword = await registerUser(password);

    // Simulate login (comparison with the correct hash)
    await loginUser(password, hashedPassword);

    // Simulate login (comparison with an incorrect hash)
    await loginUser(password, '$2a$10$kxji8gp3MueIUisNZ86nuusCUzAxm4vY1mL9mVrkSfCa5BnvQqVLq');
};

test();
