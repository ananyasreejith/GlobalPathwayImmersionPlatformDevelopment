const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    username: {
        type: String,
        required: true
    },
    applicationId: {
        type: String,
        required: true,
        unique: true
    },
    type: {
        type: String,
        enum: ['Study', 'Work'],
        required: true
    },
    fullName: {
        type: String,
        required: true
    },
    contactNumber: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    courseOrJob: {
        type: String,
        required: true // Handles both "Course Interested" and "Job Title"
    },
    status: {
        type: String,
        enum: ['Processing', 'Approved', 'Rejected'],
        default: 'Processing'
    }
}, { timestamps: true });

module.exports = mongoose.model('Application', applicationSchema);
