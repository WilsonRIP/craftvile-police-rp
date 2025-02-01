const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    category: {
        type: String,
        enum: ['announcements', 'general', 'support'],
        required: true
    },
    pinned: {
        type: Boolean,
        default: false
    },
    views: {
        type: Number,
        default: 0
    },
    reactions: {
        type: Map,
        of: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],
        default: new Map()
    },
    comments: [{
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        content: {
            type: String,
            required: true
        },
        date: {
            type: Date,
            default: Date.now
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Add indexes for better query performance
postSchema.index({ category: 1 });
postSchema.index({ pinned: 1, createdAt: -1 });
postSchema.index({ author: 1 });

// Update the updatedAt timestamp on save
postSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

module.exports = mongoose.model('Post', postSchema); 