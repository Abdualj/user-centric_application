// User Controller - handles HTTP requests for user endpoints
const UserModel = require('../models/UserModel');
const { validationResult } = require('express-validator');

class UserController {
  // GET /api/users - List all users
  static async getAllUsers(req, res) {
    try {
      const users = await UserModel.getAllUsers();
      res.status(200).json({
        success: true,
        count: users.length,
        data: users
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch users',
        message: error.message
      });
    }
  }

  // GET /api/users/:id - Get user by ID
  static async getUserById(req, res) {
    try {
      const { id } = req.params;
      const user = await UserModel.getUserById(id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
          message: `User with ID ${id} not found`
        });
      }
      
      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch user',
        message: error.message
      });
    }
  }

  // POST /api/users - Create new user
  static async createUser(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next({ status: 400, message: 'Validation error', details: errors.array() });
      }
      const { username, email, password, first_name, last_name, bio } = req.body;
      
      // Basic validation
      if (!username || !email) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields',
          message: 'Username and email are required'
        });
      }
      
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid email format',
          message: 'Please provide a valid email address'
        });
      }
      
      const userData = {
        username,
        email,
        password_hash: password || 'temp_hash', // In real app, hash the password
        first_name,
        last_name,
        bio
      };
      
      const newUser = await UserModel.createUser(userData);
      
      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: newUser
      });
    } catch (error) {
      next({ status: 500, message: 'Failed to create user', details: error.message });
    }
  }

  // PUT /api/users/:id - Update user
  static async updateUser(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next({ status: 400, message: 'Validation error', details: errors.array() });
      }
      const { id } = req.params;
      const updates = req.body;
      const requestingUserId = req.user.id;
      const userRole = req.user.role;
      
      // Remove password and email from updates for security
      const { password, email, password_hash, ...allowedUpdates } = updates;
      // eslint-disable-next-line no-unused-vars
      const _removed = { password, email, password_hash }; // Mark as intentionally unused
      
      if (Object.keys(allowedUpdates).length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No valid fields to update',
          message: 'Please provide username, first_name, last_name, bio, or role to update'
        });
      }
      
      const updatedUser = await UserModel.updateUser(id, allowedUpdates, requestingUserId, userRole);
      
      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
          message: `User with ID ${id} not found`
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'User updated successfully',
        data: updatedUser
      });
    } catch (error) {
      next({ status: 500, message: 'Failed to update user', details: error.message });
    }
  }

  // DELETE /api/users/:id - Delete user
  static async deleteUser(req, res) {
    try {
      const { id } = req.params;
      const requestingUserId = req.user.id;
      const userRole = req.user.role;
      
      // Check if user exists before deletion
      const user = await UserModel.getUserById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
          message: `User with ID ${id} not found`
        });
      }
      
      const deleted = await UserModel.deleteUser(id, requestingUserId, userRole);
      
      if (deleted) {
        res.status(200).json({
          success: true,
          message: 'User deleted successfully'
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to delete user',
          message: 'Database operation failed'
        });
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      
      if (error.message.includes('You can only')) {
        return res.status(403).json({
          success: false,
          error: 'Access denied',
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        error: 'Failed to delete user',
        message: error.message
      });
    }
  }

  // GET /api/users/:id/stats - Get user statistics
  static async getUserStats(req, res) {
    try {
      const { id } = req.params;
      
      // Check if user exists
      const user = await UserModel.getUserById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
          message: `User with ID ${id} not found`
        });
      }
      
      const stats = await UserModel.getUserStats(id);
      
      res.status(200).json({
        success: true,
        data: {
          user_id: parseInt(id),
          username: user.username,
          ...stats
        }
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch user statistics',
        message: error.message
      });
    }
  }
}

module.exports = UserController;
