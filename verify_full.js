const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';
const STUDENT_USER = `student_${Date.now()}`;
const ADMIN_USER = 'admin';

async function runTests() {
    console.log('--- STARTING VERIFICATION (New API) ---');

    try {
        // 1. Register Student
        console.log(`1. Registering ${STUDENT_USER}...`);
        await axios.post(`${BASE_URL}/register`, {
            username: STUDENT_USER,
            email: `${STUDENT_USER}@test.com`,
            password: 'password123',
            role: 'student'
        });
        console.log('✅ Registration Successful');

        // 2. Login Student
        console.log('2. Logging in Student...');
        const loginRes = await axios.post(`${BASE_URL}/login`, {
            username: STUDENT_USER,
            password: 'password123'
        });
        const studentToken = loginRes.data.token;
        console.log('✅ Student Login Successful');

        // 3. Submit Study Application
        console.log('3. Submitting Study Application...');
        const appRes = await axios.post(`${BASE_URL}/apply/study`, {
            fullName: 'John Doe',
            contactNumber: '1234567890',
            email: `${STUDENT_USER}@test.com`,
            countryInterested: 'UK',
            courseInterested: 'Computer Science'
        }, { headers: { Authorization: `Bearer ${studentToken}` } });

        const appId = appRes.data.applicationId;
        const appMongoId = appRes.data.application._id;
        console.log(`✅ Application Submitted. ID: ${appId}`);

        // 4. Verify My Applications
        console.log('4. Checking My Applications...');
        const myAppsRes = await axios.get(`${BASE_URL}/my-applications`, {
            headers: { Authorization: `Bearer ${studentToken}` }
        });
        if (myAppsRes.data.length > 0 && myAppsRes.data[0].applicationId === appId) {
            console.log('✅ Application found in list');
        } else {
            throw new Error('Application not found in My Applications');
        }

        // 5. Login Admin
        console.log('5. Logging in Admin...');
        // Note: Admin user must exist in DB. 
        // If connecting to empty Atlas DB for first time, admin might not exist until server restarts or seeded manually.
        const adminRes = await axios.post(`${BASE_URL}/login`, {
            username: ADMIN_USER,
            password: 'admin123'
        });
        const adminToken = adminRes.data.token;
        console.log('✅ Admin Login Successful');

        // 6. Admin: Get All Apps
        console.log('6. Admin: Fetching all applications...');
        const allAppsRes = await axios.get(`${BASE_URL}/admin/applications`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        // We look for applicationId (string) in response
        const targetApp = allAppsRes.data.find(a => a.applicationId === appId);
        if (targetApp) {
            console.log('✅ Application found in Admin list');
        } else {
            throw new Error('Application not found in Admin list');
        }

        // 7. Admin: Update Status
        console.log('7. Admin: Updating Status to Approved...');
        await axios.put(`${BASE_URL}/admin/application/${appId}/status`, {
            status: 'Approved'
        }, { headers: { Authorization: `Bearer ${adminToken}` } });
        console.log('✅ Status Updated');

        // 8. Student: Specific Track Verification
        console.log('8. Student: Tracking updated status...');
        const trackRes = await axios.get(`${BASE_URL}/application/${appId}`, {
            headers: { Authorization: `Bearer ${studentToken}` }
        });
        if (trackRes.data.status === 'Approved') {
            console.log('✅ Status Verification Passed: Approved');
        } else {
            throw new Error(`Status mismatch. Expected Approved, got ${trackRes.data.status}`);
        }

        console.log('--- ALL TESTS PASSED ---');
    } catch (err) {
        console.error('❌ TEST FAILED');
        if (err.response) {
            console.error(`Status: ${err.response.status}`);
            console.error('Data:', err.response.data);
        } else {
            console.error(err.message);
        }
        // Don't exit with error code if just connection failed due to missing password, helpful for user to know.
        // But for automation script, exit 1 represents failure.
        process.exit(1);
    }
}

runTests();
