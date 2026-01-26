require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
    console.log(`[REQUEST] ${req.method} ${req.url}`);
    next();
});

// Health Check for Render
app.get('/health', (req, res) => res.status(200).send('OK'));

app.use(express.static(path.join(__dirname, 'public')));

const startServer = async () => {
    try {
        // Connect to MongoDB Atlas (with Fallback)
        // if (!process.env.MONGODB_URI) {
        //     throw new Error('MONGODB_URI is not defined in .env');
        // }

        try {
            console.log('Attempting to connect to MongoDB Atlas...');
            await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
            console.log('MongoDB Connected to Atlas');
        } catch (err) {
            console.error('⚠️  MongoDB Atlas Connection Failed:', err.message);
            console.log('⚠️  Possible causes: IP not whitelisted, DNS issue, or unstable internet.');
            console.log('🔄 Switching to In-Memory Database (changes will not be saved after restart)...');

            const { MongoMemoryServer } = require('mongodb-memory-server');
            const mongod = await MongoMemoryServer.create();
            await mongoose.connect(mongod.getUri());
            console.log('✅ MongoDB Connected (In-Memory Fallback)');
        }

        // Seed Admin if not exists
        const User = require('./models/User');
        const bcrypt = require('bcryptjs');
        if (!(await User.findOne({ username: 'admin' }))) {
            const hashed = await bcrypt.hash('admin123', 10);
            await User.create({ username: 'admin', email: 'admin@example.com', password: hashed, role: 'admin' });
            console.log('Default Admin Created: admin / admin123');
        }

        // Routes
        console.log('Mounting Routes...');
        // Mount Auth routes at /api so /register becomes /api/register
        app.use('/api', require('./routes/authRoutes'));

        // Mount Application routes at /api so we can define /apply/study inside
        app.use('/api', require('./routes/applicationRoutes'));

        // Serve frontend for any unknown routes (SPA fallback)
        app.get(/(.*)/, (req, res) => {
            res.sendFile(path.join(__dirname, 'public', 'index.html'));
        });

        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
            console.log('Routes mounted: /api/register, /api/login, /api/apply/study, etc.');
        });
    } catch (err) {
        console.error('Server Startup Error:', err);
        process.exit(1);
    }
};

startServer();
