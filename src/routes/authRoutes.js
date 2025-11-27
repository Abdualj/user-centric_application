// Authentication routes
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Public routes
router.post(
  '/login',
  [
    body('email').trim().isEmail().normalizeEmail(),
    body('password').trim().isLength({ min: 6 })
  ],
  AuthController.login
);

router.post(
  '/register',
  [
    body('username').trim().notEmpty().isLength({ max: 50 }),
    body('email').trim().isEmail().normalizeEmail(),
    body('password').trim().isLength({ min: 6 })
  ],
  AuthController.register
);

// Protected routes
router.get('/profile', authMiddleware, AuthController.getProfile);
router.get('/verify', authMiddleware, AuthController.verifyToken);

module.exports = router;
