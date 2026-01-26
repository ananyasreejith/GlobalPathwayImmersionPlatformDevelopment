const axios = require('axios');
const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const BASE_URL = 'http://localhost:3000/api';

async function verifyEmailFlow() {
    try {
        console.log('Connecting to DB to access tokens...');
        await mongoose.connect(process.env.MONGODB_URI);

        const testUser = {
            username: `verify_test_${Date.now()}`,
            email: `verify_test_${Date.now()}@example.com`,
            password: 'password123'
        };

        console.log('1. Registering User:', testUser.username);
        let registerRes;
        try {
            registerRes = await axios.post(`${BASE_URL}/register`, testUser);
            console.log('Response:', registerRes.data);
        } catch (err) {
            // It might fail/warn that email sending failed, but registration should succeed
            console.log('Registration response status:', err.response?.status);
            console.log('Registration response data:', err.response?.data);
        }

        // Wait a bit for DB to update
        await new Promise(resolve => setTimeout(resolve, 2000));

        console.log('2. Fetching User from DB to get Token...');
        const user = await User.findOne({ email: testUser.email });
        if (!user) throw new Error('User not found in DB');
        console.log('User found. Verified:', user.isVerified);
        console.log('Token:', user.verificationToken);

        if (user.isVerified) throw new Error('User should NOT be verified yet');
        if (!user.verificationToken) throw new Error('No verification token found');

        console.log('3. Attempting Login BEFORE Verification (Should Fail)...');
        try {
            await axios.post(`${BASE_URL}/login`, {
                username: testUser.username,
                password: testUser.password
            });
            throw new Error('Login succeeded but should have failed!');
        } catch (err) {
            if (err.response && err.response.status === 403) {
                console.log('✅ Login failed as expected (403 Forbidden)');
            } else {
                throw err;
            }
        }

        console.log('4. Verifying Email via Token...');
        const verifyRes = await axios.get(`${BASE_URL}/verify-email?token=${user.verificationToken}`);
        console.log('Verification Response:', verifyRes.data);

        console.log('5. Attempting Login AFTER Verification (Should Succeed)...');
        const loginRes = await axios.post(`${BASE_URL}/login`, {
            username: testUser.username,
            password: testUser.password
        });
        console.log('✅ Login successful!', loginRes.data.token ? 'Token received' : 'No token');

        console.log('🎉 Email Verification Flow Verified!');

    } catch (error) {
        console.error('❌ Verification Flow Failed:', error.message);
        if (error.response) console.error('API Response:', error.response.data);
    } finally {
        await mongoose.disconnect();
    }
}

verifyEmailFlow();
