// Authentication Controller
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const UserModel = require('../models/UserModel');
require('dotenv').config();

class AuthController {
  // Login endpoint
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({
          error: 'Validation failed',
          message: 'Email and password are required'
        });
      }

      // Find user by email
      const user = await UserModel.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({
          error: 'Authentication failed',
          message: 'Invalid email or password'
        });
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        return res.status(401).json({
          error: 'Authentication failed',
          message: 'Invalid email or password'
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email, 
          username: user.username,
          role: user.role || 'user'
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      // Return token and user info (without password)
      const { password_hash, ...userWithoutPassword } = user;
      
      res.json({
        message: 'Login successful',
        token,
        user: userWithoutPassword
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        error: 'Server error',
        message: 'Login failed'
      });
    }
  }

  // Register endpoint (bonus)
  static async register(req, res) {
    try {
      const { username, email, password, first_name, last_name } = req.body;

      // Validate input
      if (!username || !email || !password) {
        return res.status(400).json({
          error: 'Validation failed',
          message: 'Username, email, and password are required'
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          error: 'Validation failed',
          message: 'Password must be at least 6 characters long'
        });
      }

      // Hash password
      const saltRounds = 10;
      const password_hash = await bcrypt.hash(password, saltRounds);

      // Create user
      const userData = {
        username,
        email,
        password_hash,
        first_name,
        last_name,
        role: 'user' // Default role
      };

      const newUser = await UserModel.createUser(userData);

      // Generate JWT token for new user
      const token = jwt.sign(
        { 
          id: newUser.id, 
          email: newUser.email, 
          username: newUser.username,
          role: newUser.role || 'user'
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: newUser
      });

    } catch (error) {
      if (error.message.includes('already exists')) {
        return res.status(409).json({
          error: 'Conflict',
          message: error.message
        });
      }

      console.error('Registration error:', error);
      res.status(500).json({
        error: 'Server error',
        message: 'Registration failed'
      });
    }
  }

  // Get current user profile
  static async getProfile(req, res) {
    try {
      const user = await UserModel.getUserById(req.user.id);
      
      if (!user) {
        return res.status(404).json({
          error: 'Not found',
          message: 'User not found'
        });
      }

      res.json({
        message: 'Profile retrieved successfully',
        user
      });

    } catch (error) {
      console.error('Profile fetch error:', error);
      res.status(500).json({
        error: 'Server error',
        message: 'Failed to fetch profile'
      });
    }
  }

  // Verify token endpoint
  static async verifyToken(req, res) {
    try {
      // If we reach here, token is valid (middleware passed)
      const user = await UserModel.getUserById(req.user.id);
      
      if (!user) {
        return res.status(404).json({
          error: 'Not found',
          message: 'User not found'
        });
      }

      res.json({
        valid: true,
        user
      });

    } catch (error) {
      console.error('Token verification error:', error);
      res.status(500).json({
        error: 'Server error',
        message: 'Token verification failed'
      });
    }
  }
}

module.exports = AuthController;
