const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const auth = require('../middleware/authMiddleware');

// Generate Unique Application ID
const generateAppId = () => {
    return 'APP-' + Math.floor(100000 + Math.random() * 900000);
};

// @route   POST /api/apply/study
// @desc    Submit study abroad application
router.post('/apply/study', auth, async (req, res) => {
    try {
        const { fullName, contactNumber, email, countryInterested, courseInterested } = req.body;

        const newApp = new Application({
            studentId: req.user.id,
            username: req.user.username || 'Student',
            applicationId: generateAppId(),
            type: 'Study',
            fullName,
            contactNumber,
            email,
            country: countryInterested,
            courseOrJob: courseInterested, // Mapping to existing schema field
            status: 'Processing'
        });

        if (req.body.username) newApp.username = req.body.username;

        await newApp.save();
        res.status(201).json({
            message: 'Application successfully submitted',
            applicationId: newApp.applicationId,
            application: newApp
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   POST /api/apply/work
// @desc    Submit work abroad application
router.post('/apply/work', auth, async (req, res) => {
    try {
        const { fullName, contactNumber, email, countryInterested, jobTitle } = req.body;

        const newApp = new Application({
            studentId: req.user.id,
            username: req.user.username || 'Student',
            applicationId: generateAppId(),
            type: 'Work',
            fullName,
            contactNumber,
            email,
            country: countryInterested,
            courseOrJob: jobTitle, // Mapping to existing schema field
            status: 'Processing'
        });

        if (req.body.username) newApp.username = req.body.username;

        await newApp.save();
        res.status(201).json({
            message: 'Application successfully submitted',
            applicationId: newApp.applicationId,
            application: newApp
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   GET /api/application/:applicationId
// @desc    Get application details
router.get('/application/:applicationId', auth, async (req, res) => {
    try {
        const appId = req.params.applicationId.trim();
        console.log(`[DEBUG] Lookup Application ID: '${req.params.applicationId}' -> '${appId}'`);

        const app = await Application.findOne({ applicationId: appId });
        if (!app) {
            console.log(`[DEBUG] Application not found: ${appId}`);
            return res.status(404).json({ message: 'Application not found' });
        }
        res.json(app);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   GET /api/my-applications
// @desc    Get all applications for logged in user (Added for dashboard list convenience)
router.get('/my-applications', auth, async (req, res) => {
    try {
        const apps = await Application.find({ studentId: req.user.id }).sort({ createdAt: -1 });
        res.json(apps);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   GET /api/admin/applications
// @desc    View all applications
router.get('/admin/applications', auth, async (req, res) => {
    if (req.user.role === 'student') {
        return res.status(403).json({ message: 'Access denied' });
    }
    try {
        const apps = await Application.find().sort({ createdAt: -1 });
        res.json(apps);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   PUT /api/admin/application/:applicationId/status
// @desc    Update status
router.put('/admin/application/:applicationId/status', auth, async (req, res) => {
    if (req.user.role === 'student') {
        return res.status(403).json({ message: 'Access denied' });
    }
    try {
        // Find by applicationId (string) not _id
        // NOTE: User prompt asked for /application/:applicationId.
        // Assuming we pass applicationId string (APP-XXX).

        const { status } = req.body;

        // We need to use findOneAndUpdate if searching by custom ID
        const app = await Application.findOneAndUpdate(
            { applicationId: req.params.applicationId },
            { status },
            { new: true }
        );

        if (!app) return res.status(404).json({ message: 'Application not found' });

        res.json(app);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
