require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmail() {
    console.log('--- Email Config Check ---');
    console.log('Host:', process.env.EMAIL_HOST);
    console.log('User:', process.env.EMAIL_USER);
    // Don't log password

    if (!process.env.EMAIL_USER || process.env.EMAIL_USER.includes('REPLACE')) {
        console.error('❌ EMAIL_USER is not set correctly in .env');
        return;
    }

    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    try {
        console.log(`\nAttempting to send test email to ${process.env.EMAIL_USER}...`);

        const info = await transporter.sendMail({
            from: `"Test Script" <${process.env.EMAIL_USER}>`,
            to: 'shivanandu2k3@gmail.com', // Explicitly send to new Gmail
            subject: 'Test Email from Your App',
            text: 'If you receive this, your email configuration is working perfectly!',
            html: '<b>If you receive this, your email configuration is working perfectly!</b>'
        });

        console.log('✅ Email sent successfully!');
        console.log('Message ID:', info.messageId);
        console.log('Check your inbox (and spam folder) for an email with subject "Test Email from Your App"');

    } catch (error) {
        console.error('❌ Failed to send email.');
        console.error('Error:', error.message);
        if (error.response) {
            console.error('SMTP Response:', error.response);
        }
    }
}

testEmail();
