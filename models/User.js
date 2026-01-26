const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['student', 'counselor', 'admin'],
        default: 'student'
    },
    applications: [{
        university: String,
        program: String,
        country: String,
        status: {
            type: String,
            enum: ['Applied', 'Offer Received', 'Visa Process', 'Departed'],
            default: 'Applied'
        },
        updatedAt: {
            type: Date,
            default: Date.now
        }
    }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
