// User routes - Express router for user endpoints
const express = require('express');
const UserController = require('../controllers/UserController');

const router = express.Router();

// GET /api/users - List all users
router.get('/', UserController.getAllUsers);

// GET /api/users/:id - Get user by ID
router.get('/:id', UserController.getUserById);

// GET /api/users/:id/stats - Get user statistics
router.get('/:id/stats', UserController.getUserStats);

// POST /api/users - Create new user
router.post('/', UserController.createUser);

// PUT /api/users/:id - Update user
router.put('/:id', UserController.updateUser);

// DELETE /api/users/:id - Delete user
router.delete('/:id', UserController.deleteUser);

module.exports = router;
