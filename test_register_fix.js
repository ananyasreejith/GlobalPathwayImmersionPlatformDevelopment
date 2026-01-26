// Using native fetch in Node.js 18+


async function testRegistration() {
    console.log('Testing Registration Endpoint...');
    const url = 'http://localhost:5000/api/register';

    // Random user to avoid collision
    const randomId = Math.floor(Math.random() * 10000);
    const user = {
        username: `testuser${randomId}`,
        email: `test${randomId}@example.com`,
        password: 'password123',
        role: 'student'
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        });

        console.log('Status Code:', response.status);
        const data = await response.json();
        console.log('Response Body:', data);

        if (response.ok) {
            console.log('TEST PASSED: Registration successful.');
        } else {
            console.log('TEST FAILED: Registration failed.');
            if (response.status === 404) {
                console.log('ERROR: 404 Not Found - Route missing or wrong port.');
            }
        }
    } catch (error) {
        console.error('TEST FAILED: Network Error', error.message);
        console.log('Ensure the backend is running on port 5000.');
    }
}

testRegistration();
