const bcrypt = require('bcryptjs');

const testBcrypt = async () => {
    const password = 'Suresh@1234';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    console.log('Plaintext Password:', password);
    console.log('Hashed Password:', hashedPassword);

    const isMatch = await bcrypt.compare(password, hashedPassword);
    console.log('Password Match:', isMatch);
};

testBcrypt();
