const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    steamId: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    avatar: String,
    role: {
        type: String,
        enum: ['Member', 'Moderator', 'Administrator'],
        default: 'Member'
    },
    permissions: [{
        type: String
    }],
    joinDate: {
        type: Date,
        default: Date.now
    },
    lastLogin: Date,
    profileUrl: String,
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    }],
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }],
    reactions: [{
        post: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post'
        },
        emoji: String
    }]
});

// Add indexes for better query performance
userSchema.index({ steamId: 1 });
userSchema.index({ role: 1 });

module.exports = mongoose.model('User', userSchema); 