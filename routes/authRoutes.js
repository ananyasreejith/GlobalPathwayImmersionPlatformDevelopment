const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const crypto = require('crypto');
const nodemailer = require('nodemailer');

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_123';

// Email Transporter Setup
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
    port: process.env.EMAIL_PORT || 587,
    secure: Number(process.env.EMAIL_PORT) === 465, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER || 'ethereal_user',
        pass: process.env.EMAIL_PASS || 'ethereal_pass'
    }
});


// Register - mounted at /api/register
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, role, adminSecret } = req.body;

        // Security Check for Privileged Roles
        if (role === 'counselor' || role === 'admin') {
            const SECRET_CODE = process.env.ADMIN_SECRET || 'bluebird2024';
            if (adminSecret !== SECRET_CODE) {
                return res.status(403).json({ message: 'Invalid Admin Secret Code. Registration denied.' });
            }
        }

        // Check if user exists
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const verificationToken = crypto.randomBytes(32).toString('hex');

        const user = new User({
            username,
            email,
            password: hashedPassword,
            role: role || 'student',
            verificationToken,
            isVerified: false
        });

        await user.save();

        // Send Verification Email
        const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
        const verificationUrl = `${baseUrl}/api/verify-email?token=${verificationToken}`;

        console.log(`[DEV] Verification Link: ${verificationUrl}`); // Log always for dev

        const mailOptions = {
            from: '"Global Pathway Platform" <no-reply@globalpathway.com>',
            to: email,
            subject: 'Verify Your Email',
            html: `<p>Please verify your email by clicking the link below:</p>
                   <a href="${verificationUrl}">${verificationUrl}</a>`
        };

        // Send Verification Email (Non-blocking)
        transporter.sendMail(mailOptions)
            .then(() => console.log(`Verification email sent to ${email}`))
            .catch(err => console.error('Error sending email:', err.message));

        res.status(201).json({ message: 'User registered. Please check your email to verify your account.' });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ message: 'User not registered. Please register first.' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        if (!user.isVerified) {
            return res.status(403).json({ message: 'Email not verified. Please checking your inbox.' });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });

        res.json({ token, user: { id: user._id, username: user.username, role: user.role } });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Verify Email Route
router.get('/verify-email', async (req, res) => {
    try {
        const { token } = req.query;
        if (!token) return res.status(400).send('Invalid token');

        const user = await User.findOne({ verificationToken: token });
        if (!user) return res.status(400).send('Invalid or expired token');

        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();

        res.send('<h1>Email Verified!</h1><p>You can now <a href="/">login</a>.</p>');
    } catch (error) {
        res.status(500).send('Server error');
    }
});

module.exports = router;
