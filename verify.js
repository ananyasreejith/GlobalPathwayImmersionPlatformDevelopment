const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
let token = '';
let studentId = '';

async function runVerification() {
    try {
        console.log('1. Testing Root (Static Files)...');
        await axios.get(BASE_URL);
        console.log('✅ Root accessible');

        console.log('2. Registering Student...');
        const uniqueUser = `student_${Date.now()}`;
        await axios.post(`${BASE_URL}/auth/register`, {
            username: uniqueUser,
            password: 'password123',
            role: 'student'
        });
        console.log(`✅ Registered ${uniqueUser}`);

        console.log('3. Logging In...');
        const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
            username: uniqueUser,
            password: 'password123'
        });
        token = loginRes.data.token;
        studentId = loginRes.data.user.id;
        console.log('✅ Login successful, token received');

        console.log('4. Logging Emotion (Stressed)...');
        await axios.post(`${BASE_URL}/api/emotion`, {
            studentId,
            emotion: 'Stressed',
            note: 'Feeling overwhelmed with visa process'
        }, {
            headers: { Authorization: token }
        });
        console.log('✅ Emotion logged');

        console.log('5. Fetching History...');
        const historyRes = await axios.get(`${BASE_URL}/api/emotions/${studentId}`, {
            headers: { Authorization: token }
        });
        if (historyRes.data.length > 0 && historyRes.data[0].emotion === 'Stressed') {
            console.log('✅ History verification successful');
        } else {
            console.error('❌ History verification failed', historyRes.data);
            process.exit(1);
        }

        console.log('ALL TESTS PASSED!');
    } catch (error) {
        console.error('❌ Verification Failed:', error.message);
        if (error.response) console.error('Response:', error.response.data);
    }
}

runVerification();
