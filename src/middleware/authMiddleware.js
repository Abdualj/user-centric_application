// Authentication middleware to verify JWT tokens
const jwt = require('jsonwebtoken');
require('dotenv').config();

const authMiddleware = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'No token provided'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach decoded user to request object
    req.user = decoded;
    
    next();
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return res.status(403).json({
      error: 'Invalid token',
      message: 'Token verification failed'
    });
  }
};

// Optional middleware - allows requests with or without token
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    }
    
    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};

// Admin role checking middleware
const adminRequired = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Access denied',
      message: 'Authentication required'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Access denied',
      message: 'Admin privileges required'
    });
  }

  next();
};

// Check if user is owner or admin
const ownerOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Access denied',
      message: 'Authentication required'
    });
  }

  // Extract resource ID from params (works for /api/users/:id routes)
  const resourceUserId = req.params.id;
  
  if (req.user.role === 'admin' || req.user.id === parseInt(resourceUserId)) {
    next();
  } else {
    return res.status(403).json({
      error: 'Access denied',
      message: 'You can only access your own resources'
    });
  }
};

module.exports = {
  authMiddleware,
  optionalAuth,
  adminRequired,
  ownerOrAdmin
};
