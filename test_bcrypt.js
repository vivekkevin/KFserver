const bcrypt = require('bcryptjs');

const testBcrypt = async () => {
    const password = 'Viveksam@1234'; // Plaintext password
    const salt = bcrypt.genSaltSync(10); // Generate salt
    const hashedPassword = bcrypt.hashSync(password, salt); // Hash password

    console.log('Plaintext Password:', password);
    console.log('Hashed Password:', hashedPassword);

    const isMatch = bcrypt.compareSync(password, hashedPassword); // Compare passwords
    console.log('Password Match:', isMatch);
};

$2a$10$pxoW/qSKbpcIuu5DI.Uqx.yvTlKZcNVs4eZTmia8NYTu7sKVKyRYu

testBcrypt();
