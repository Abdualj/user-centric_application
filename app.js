// app.js
const express = require('express');
const path = require('path');

// Initialize database
const { initializeDatabase } = require('./src/config/database');

// Import routes
const mediaRoutes = require('./src/routes/mediaRoutes');
const userRoutes = require('./src/routes/userRoutes');
const likeRoutes = require('./src/routes/likeRoutes');

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
    version: '2.0',
    description: 'A REST API for managing media files, users, and social interactions',
    endpoints: [
      // Media endpoints
      { method: 'GET', path: '/api/media', description: 'List all media items' },
      { method: 'GET', path: '/api/media/:id', description: 'Get media item by ID' },
      { method: 'POST', path: '/api/media', description: 'Upload new media file' },
      { method: 'PUT', path: '/api/media/:id', description: 'Update media item' },
      { method: 'DELETE', path: '/api/media/:id', description: 'Delete media item' },
      
      // User endpoints
      { method: 'GET', path: '/api/users', description: 'List all users' },
      { method: 'GET', path: '/api/users/:id', description: 'Get user by ID' },
      { method: 'POST', path: '/api/users', description: 'Create new user' },
      { method: 'PUT', path: '/api/users/:id', description: 'Update user' },
      { method: 'DELETE', path: '/api/users/:id', description: 'Delete user' },
      
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

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ 
    error: 'Server Error', 
    message: 'Something went wrong!'
  });
});

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
