const nodemailer = require('nodemailer');

async function createTestAccount() {
    try {
        const testAccount = await nodemailer.createTestAccount();
        console.log('EMAIL_HOST=smtp.ethereal.email');
        console.log('EMAIL_PORT=587');
        console.log(`EMAIL_USER=${testAccount.user}`);
        console.log(`EMAIL_PASS=${testAccount.pass}`);
    } catch (err) {
        console.error('Failed to create test account:', err);
    }
}

createTestAccount();
