// Authentication middleware
exports.isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ error: 'You must be logged in to perform this action' });
};

// Role-based authorization middleware
exports.isModeratorOrAdmin = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'You must be logged in to perform this action' });
    }
    
    if (!['Administrator', 'Moderator'].includes(req.user.role)) {
        return res.status(403).json({ error: 'You do not have permission to perform this action' });
    }
    
    next();
};

exports.isAdmin = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'You must be logged in to perform this action' });
    }
    
    if (req.user.role !== 'Administrator') {
        return res.status(403).json({ error: 'You do not have permission to perform this action' });
    }
    
    next();
}; 