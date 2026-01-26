
require('dotenv').config();
const mongoose = require('mongoose');

async function testConnection() {
    console.log('Attempting to connect to Atlas...');
    console.log('URI:', process.env.MONGODB_URI.replace(/:([^:@]+)@/, ':****@')); // Hide password

    try {
        await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
        console.log('SUCCESS: Connected to MongoDB Atlas!');
        await mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error('CONNECTION FAILED:', err.message);
        if (err.message.includes('bad auth')) {
            console.log('-> Hint: Check your username and password in .env');
        } else if (err.message.includes('queryTxt ETIMEOUT') || err.message.includes('connections to the servers')) {
            console.log('-> Hint: Check if your IP/Network is whitelisted in Atlas Network Access');
        }
        process.exit(1);
    }
}

testConnection();
