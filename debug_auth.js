const axios = require('axios');

async function debugRegister() {
    try {
        const response = await axios.post('http://localhost:3000/auth/register', {
            username: 'Ananya',
            password: 'password123',
            role: 'student'
        });
        console.log('Success:', response.data);
    } catch (error) {
        if (error.response) {
            console.log('Error Status:', error.response.status);
            console.log('Error Body:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.log('Error:', error.message);
        }
    }
}

debugRegister();
