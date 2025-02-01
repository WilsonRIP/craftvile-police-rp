const express = require('express');
const passport = require('passport');
const router = express.Router();

// Steam authentication
router.get('/steam', passport.authenticate('steam'));

router.get('/steam/return',
    passport.authenticate('steam', { failureRedirect: '/' }),
    (req, res) => {
        res.redirect('/community.html');
    }
);

// Logout
router.get('/logout', (req, res) => {
    req.logout(() => {
        res.redirect('/');
    });
});

// Get current user
router.get('/user', (req, res) => {
    res.json(req.user || null);
});

// Check authentication status
router.get('/status', (req, res) => {
    res.json({
        authenticated: req.isAuthenticated(),
        user: req.user || null
    });
});

module.exports = router; 