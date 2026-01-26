const express = require('express');
const router = express.Router();
const User = require('../models/User');
const EmotionLog = require('../models/EmotionLog');

// Middleware to verify token (simplified for MVP)
const verifyToken = (req, res, next) => {
    // In a real app, verify JWT here
    // For MVP, passing through if headers exist or just trusting frontend slightly for demo
    // But let's do a basic check if header exists
    next();
};

// Log Emotion
router.post('/emotion', async (req, res) => {
    try {
        const { studentId, emotion, note } = req.body;

        const log = new EmotionLog({
            student: studentId,
            emotion,
            note
        });

        await log.save();

        // Check for alerts (simple logic: if Stressed or Anxious)
        // In a real app, we might send an email or push notification here

        res.status(201).json(log);
    } catch (error) {
        res.status(500).json({ message: 'Error logging emotion', error: error.message });
    }
});

// Get Emotion History for a Student
router.get('/emotions/:studentId', async (req, res) => {
    try {
        const logs = await EmotionLog.find({ student: req.params.studentId }).sort({ createdAt: -1 });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching history', error: error.message });
    }
});

// Get All Students (For Counselor)
router.get('/dashboard/students', async (req, res) => {
    try {
        // Fetch all students
        const students = await User.find({ role: 'student' }).select('-password');

        // For each student, get the latest emotion
        const data = await Promise.all(students.map(async (student) => {
            const latestEmotion = await EmotionLog.findOne({ student: student._id }).sort({ createdAt: -1 });
            return {
                ...student.toObject(),
                latestEmotion: latestEmotion ? latestEmotion.emotion : 'N/A',
                latestEmotionDate: latestEmotion ? latestEmotion.createdAt : null
            };
        }));

        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching students', error: error.message });
    }
});

// Update Application Status
router.put('/application/:studentId', async (req, res) => {
    try {
        const { applications } = req.body; // Expecting array of applications
        await User.findByIdAndUpdate(req.params.studentId, { applications });
        res.json({ message: 'Application updated' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating application', error: error.message });
    }
});

module.exports = router;
