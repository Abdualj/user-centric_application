// Authentication routes
const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Public routes
router.post('/login', AuthController.login);
router.post('/register', AuthController.register);

// Protected routes
router.get('/profile', authMiddleware, AuthController.getProfile);
router.get('/verify', authMiddleware, AuthController.verifyToken);

module.exports = router;
