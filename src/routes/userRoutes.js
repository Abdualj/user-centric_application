// User routes - Express router for user endpoints
const express = require('express');
const { body } = require('express-validator');
const UserController = require('../controllers/UserController');
const { authMiddleware, adminRequired, ownerOrAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/users - List all users (public)
router.get('/', UserController.getAllUsers);

// GET /api/users/:id - Get user by ID (public)
router.get('/:id', UserController.getUserById);

// GET /api/users/:id/stats - Get user statistics (public)
router.get('/:id/stats', UserController.getUserStats);

// POST /api/users - Create new user (admin only)
router.post(
  '/',
  [
    body('username').trim().notEmpty().isLength({ max: 50 }),
    body('email').trim().isEmail().normalizeEmail(),
    body('password').trim().isLength({ min: 6 })
  ],
  authMiddleware,
  adminRequired,
  UserController.createUser
);

// PUT /api/users/:id - Update user (owner or admin only)
router.put(
  '/:id',
  [
    body('username').optional().trim().isLength({ max: 50 }),
    body('email').optional().trim().isEmail().normalizeEmail(),
    body('password').optional().trim().isLength({ min: 6 })
  ],
  authMiddleware,
  ownerOrAdmin,
  UserController.updateUser
);

// DELETE /api/users/:id - Delete user (owner or admin only)
router.delete('/:id', authMiddleware, ownerOrAdmin, UserController.deleteUser);

module.exports = router;
