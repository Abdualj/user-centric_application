// User routes - Express router for user endpoints
const express = require('express');
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
router.post('/', authMiddleware, adminRequired, UserController.createUser);

// PUT /api/users/:id - Update user (owner or admin only)
router.put('/:id', authMiddleware, ownerOrAdmin, UserController.updateUser);

// DELETE /api/users/:id - Delete user (owner or admin only)
router.delete('/:id', authMiddleware, ownerOrAdmin, UserController.deleteUser);

module.exports = router;
