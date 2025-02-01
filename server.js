require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const SteamStrategy = require('passport-steam').Strategy;
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const User = require('./models/User');
const Post = require('./models/Post');

const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(helmet());
app.use(morgan('dev'));
app.use(cors({
    origin: process.env.BASE_URL,
    credentials: true
}));
app.use(express.json());
app.use(express.static('public'));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Passport Steam authentication
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
    done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err);
    }
});

passport.use(new SteamStrategy({
    returnURL: `${process.env.BASE_URL}/auth/steam/return`,
    realm: process.env.BASE_URL,
    apiKey: process.env.STEAM_API_KEY
}, async (identifier, profile, done) => {
    try {
        let user = await User.findOne({ steamId: profile.id });
        
        if (!user) {
            user = await User.create({
                steamId: profile.id,
                name: profile.displayName,
                avatar: profile._json.avatarfull,
                profileUrl: profile._json.profileurl,
                permissions: ['create_posts', 'create_comments']
            });
        } else {
            user.lastLogin = new Date();
            user.avatar = profile._json.avatarfull;
            user.name = profile.displayName;
            await user.save();
        }
        
        return done(null, user);
    } catch (err) {
        return done(err);
    }
}));

// Auth routes
app.get('/auth/steam', passport.authenticate('steam'));

app.get('/auth/steam/return',
    passport.authenticate('steam', { failureRedirect: '/' }),
    (req, res) => {
        res.redirect('/community.html');
    }
);

app.get('/auth/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

// API Endpoints
// Get current user
app.get('/api/user', (req, res) => {
    res.json(req.user || null);
});

// Posts
app.get('/api/posts', async (req, res) => {
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

app.post('/api/posts', async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

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

// Post reactions
app.post('/api/posts/:postId/reactions', async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

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

// Comments
app.post('/api/posts/:postId/comments', async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

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

// Admin/Moderator actions
app.patch('/api/posts/:postId', async (req, res) => {
    if (!req.user || !['Administrator', 'Moderator'].includes(req.user.role)) {
        return res.status(403).json({ error: 'Forbidden' });
    }

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

app.delete('/api/posts/:postId', async (req, res) => {
    if (!req.user || !['Administrator', 'Moderator'].includes(req.user.role)) {
        return res.status(403).json({ error: 'Forbidden' });
    }

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

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 