// app.js
require('dotenv').config();
const express = require('express');
const path = require('path');

// Initialize database
const { initializeDatabase } = require('./src/config/database');

// Import routes
const authRoutes = require('./src/routes/authRoutes');
const mediaRoutes = require('./src/routes/mediaRoutes');
const userRoutes = require('./src/routes/userRoutes');
const likeRoutes = require('./src/routes/likeRoutes');
const errorHandler = require('./src/middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// View engine
app.set('views', path.join(__dirname, 'src/views'));
app.set('view engine', 'pug');

// Static files
app.use('/media', express.static(path.join(__dirname, 'uploads')));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Landing page
app.get('/', (req, res) => {
  const apiInfo = {
    name: 'User-Centric Media API',
    version: '3.0',
    description: 'A REST API for managing media files, users, and social interactions with JWT authentication',
    endpoints: [
      // Authentication endpoints
      { method: 'POST', path: '/api/auth/login', description: 'User login' },
      { method: 'POST', path: '/api/auth/register', description: 'User registration' },
      { method: 'GET', path: '/api/auth/profile', description: 'Get current user profile (auth required)' },
      { method: 'GET', path: '/api/auth/verify', description: 'Verify token validity (auth required)' },
      
      // Media endpoints
      { method: 'GET', path: '/api/media', description: 'List all media items' },
      { method: 'GET', path: '/api/media/:id', description: 'Get media item by ID' },
      { method: 'POST', path: '/api/media', description: 'Upload new media file (auth required)' },
      { method: 'PUT', path: '/api/media/:id', description: 'Update media item (owner/admin only)' },
      { method: 'DELETE', path: '/api/media/:id', description: 'Delete media item (owner/admin only)' },
      
      // User endpoints
      { method: 'GET', path: '/api/users', description: 'List all users' },
      { method: 'GET', path: '/api/users/:id', description: 'Get user by ID' },
      { method: 'POST', path: '/api/users', description: 'Create new user (admin only)' },
      { method: 'PUT', path: '/api/users/:id', description: 'Update user (owner/admin only)' },
      { method: 'DELETE', path: '/api/users/:id', description: 'Delete user (owner/admin only)' },
      
      // Like endpoints
      { method: 'GET', path: '/api/likes/media/:id', description: 'Get likes for media item' },
      { method: 'GET', path: '/api/likes/user/:id', description: 'Get likes by user' },
      { method: 'POST', path: '/api/likes', description: 'Like/unlike media' },
      { method: 'DELETE', path: '/api/likes/:id', description: 'Remove like' }
    ]
  };

  res.render('index', { 
    apiInfo, 
    baseUrl: req.protocol + '://' + req.get('host') 
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/users', userRoutes);
app.use('/api/likes', likeRoutes);

// Error handling middleware
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found', 
    message: 'The requested resource does not exist.' 
  });
});

app.use(errorHandler);

// Initialize database and start server
async function startServer() {
  try {
    console.log('🔄 Initializing database...');
    await initializeDatabase();
    console.log('✅ Database initialized successfully');
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📚 API documentation available at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();
