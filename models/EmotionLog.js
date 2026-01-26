const mongoose = require('mongoose');

const emotionLogSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    emotion: {
        type: String,
        required: true,
        enum: ['Happy', 'Confused', 'Stressed', 'Anxious', 'Confident']
    },
    note: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('EmotionLog', emotionLogSchema);
