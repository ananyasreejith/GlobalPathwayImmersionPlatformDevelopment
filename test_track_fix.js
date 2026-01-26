
// Using native fetch in Node.js 18+

const API_URL = 'http://localhost:5000/api';

async function testTracking() {
    console.log('--- Testing Tracking Fix ---');

    // 1. Register/Login a user
    const randomId = Math.floor(Math.random() * 10000);
    const user = {
        username: `tracker${randomId}`,
        email: `tracker${randomId}@example.com`,
        password: 'password123'
    };

    console.log('[1] Registering User...');
    try {
        const regRes = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        });

        if (!regRes.ok) throw new Error('Registration failed');

        console.log('[2] Logging in...');
        const loginRes = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: user.username, password: user.password })
        });
        const loginData = await loginRes.json();
        const token = loginData.token;
        if (!token) throw new Error('Login failed, no token');

        // 2. Create an Application
        console.log('[3] Creating Application...');
        const appRes = await fetch(`${API_URL}/apply/study`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                fullName: 'Track Test',
                contactNumber: '1234567890',
                email: 'test@example.com',
                countryInterested: 'Canada',
                courseInterested: 'Computer Science'
            })
        });
        const appData = await appRes.json();
        const appId = appData.applicationId;
        console.log(`    > Created Application ID: ${appId}`);

        // 3. Track with Clean ID
        console.log('[4] Tracking with Clean ID...');
        const track1 = await fetch(`${API_URL}/application/${appId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (track1.ok) console.log('    > PASS: Clean ID found.');
        else console.log('    > FAIL: Clean ID not found.');

        // 4. Track with Whitespace ID (Simulate copy-paste error)
        console.log('[5] Tracking with Whitespace ID...');
        const dirtyId = `  ${appId}  `;
        const track2 = await fetch(`${API_URL}/application/${dirtyId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (track2.ok) console.log('    > PASS: Whitespace ID found (Trim worked).');
        else console.log('    > FAIL: Whitespace ID not found.');

    } catch (err) {
        console.error('TEST FAILED:', err.message);
    }
}

testTracking();
