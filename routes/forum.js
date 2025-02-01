const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const { isAuthenticated, isModeratorOrAdmin } = require('../middleware/auth');

// Get all posts
router.get('/posts', async (req, res) => {
    try {
        const posts = await Post.find()
            .sort({ pinned: -1, createdAt: -1 })
            .populate('author', 'name avatar role')
            .populate('comments.author', 'name avatar role');
        res.json(posts);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
});

// Create new post
router.post('/posts', isAuthenticated, async (req, res) => {
    try {
        const post = await Post.create({
            ...req.body,
            author: req.user._id
        });
        await post.populate('author', 'name avatar role');
        res.status(201).json(post);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Add reaction to post
router.post('/posts/:postId/reactions', isAuthenticated, async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        const { emoji } = req.body;
        const users = post.reactions.get(emoji) || [];
        const userIndex = users.indexOf(req.user._id);

        if (userIndex === -1) {
            users.push(req.user._id);
        } else {
            users.splice(userIndex, 1);
        }

        post.reactions.set(emoji, users);
        await post.save();
        res.json(post);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add comment to post
router.post('/posts/:postId/comments', isAuthenticated, async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        post.comments.push({
            author: req.user._id,
            content: req.body.content
        });

        await post.save();
        await post.populate('comments.author', 'name avatar role');
        res.status(201).json(post);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Update post (moderators/admins only)
router.patch('/posts/:postId', isModeratorOrAdmin, async (req, res) => {
    try {
        const post = await Post.findByIdAndUpdate(
            req.params.postId,
            { $set: req.body },
            { new: true }
        ).populate('author', 'name avatar role');
        
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        
        res.json(post);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete post (moderators/admins only)
router.delete('/posts/:postId', isModeratorOrAdmin, async (req, res) => {
    try {
        const post = await Post.findByIdAndDelete(req.params.postId);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        res.status(204).end();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router; 