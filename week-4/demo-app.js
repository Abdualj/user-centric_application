// Demo app.js - Works without database for demonstration
const express = require('express');
const path = require('path');
const multer = require('multer');
const fs = require('fs').promises;

// Mock data for demonstration
const mockUsers = [
  {
    id: 1,
    username: 'john_doe',
    email: 'john@example.com',
    first_name: 'John',
    last_name: 'Doe',
    bio: 'Photography enthusiast',
    media_count: 2,
    likes_given: 5
  },
  {
    id: 2,
    username: 'jane_smith',
    email: 'jane@example.com',
    first_name: 'Jane',
    last_name: 'Smith',
    bio: 'Digital artist',
    media_count: 1,
    likes_given: 3
  }
];

const mockMedia = [
  {
    id: 1,
    title: 'Red Bicycle',
    description: 'A beautiful red bicycle for city riding',
    filename: 'redbike.jpg',
    username: 'john_doe',
    like_count: 5
  },
  {
    id: 2,
    title: 'Professional Skateboard',
    description: 'Professional skateboard for tricks',
    filename: 'skateboard.jpg',
    username: 'jane_smith',
    like_count: 3
  }
];

const mockLikes = [
  { id: 1, user_id: 1, media_id: 2 },
  { id: 2, user_id: 2, media_id: 1 }
];

const app = express();
const PORT = 3000;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'uploads/'))
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// View engine
app.set('views', path.join(__dirname, 'src/views'));
app.set('view engine', 'pug');

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Landing page
app.get('/', (req, res) => {
  const apiInfo = {
    name: 'User-Centric Media API',
    version: '2.0 (Demo)',
    description: 'A REST API demonstrating MVC architecture, file uploads, and social features',
    endpoints: [
      { method: 'GET', path: '/api/media', description: 'List all media items' },
      { method: 'GET', path: '/api/media/:id', description: 'Get media item by ID' },
      { method: 'POST', path: '/api/media', description: 'Upload new media file' },
      { method: 'PUT', path: '/api/media/:id', description: 'Update media item' },
      { method: 'DELETE', path: '/api/media/:id', description: 'Delete media item' },
      { method: 'GET', path: '/api/users', description: 'List all users' },
      { method: 'GET', path: '/api/users/:id', description: 'Get user by ID' },
      { method: 'POST', path: '/api/users', description: 'Create new user' },
      { method: 'PUT', path: '/api/users/:id', description: 'Update user' },
      { method: 'DELETE', path: '/api/users/:id', description: 'Delete user' },
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

// MEDIA ENDPOINTS
app.get('/api/media', (req, res) => {
  res.json({
    success: true,
    count: mockMedia.length,
    data: mockMedia
  });
});

app.get('/api/media/:id', (req, res) => {
  const media = mockMedia.find(m => m.id === parseInt(req.params.id));
  if (!media) {
    return res.status(404).json({
      success: false,
      error: 'Media not found'
    });
  }
  res.json({ success: true, data: media });
});

app.post('/api/media', upload.single('media'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const newMedia = {
      id: mockMedia.length + 1,
      title: req.body.title || 'Untitled',
      description: req.body.description || '',
      filename: req.file.filename,
      username: 'demo_user',
      like_count: 0
    };

    mockMedia.push(newMedia);

    res.status(201).json({
      success: true,
      message: 'Media uploaded successfully',
      data: newMedia
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Upload failed',
      message: error.message
    });
  }
});

app.put('/api/media/:id', (req, res) => {
  const mediaIndex = mockMedia.findIndex(m => m.id === parseInt(req.params.id));
  if (mediaIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'Media not found'
    });
  }

  const { title, description } = req.body;
  if (title) mockMedia[mediaIndex].title = title;
  if (description) mockMedia[mediaIndex].description = description;

  res.json({
    success: true,
    message: 'Media updated successfully',
    data: mockMedia[mediaIndex]
  });
});

app.delete('/api/media/:id', (req, res) => {
  const mediaIndex = mockMedia.findIndex(m => m.id === parseInt(req.params.id));
  if (mediaIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'Media not found'
    });
  }

  mockMedia.splice(mediaIndex, 1);
  res.json({
    success: true,
    message: 'Media deleted successfully'
  });
});

// USER ENDPOINTS
app.get('/api/users', (req, res) => {
  res.json({
    success: true,
    count: mockUsers.length,
    data: mockUsers
  });
});

app.get('/api/users/:id', (req, res) => {
  const user = mockUsers.find(u => u.id === parseInt(req.params.id));
  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }
  res.json({ success: true, data: user });
});

app.post('/api/users', (req, res) => {
  const { username, email, first_name, last_name, bio } = req.body;
  
  if (!username || !email) {
    return res.status(400).json({
      success: false,
      error: 'Username and email required'
    });
  }

  const newUser = {
    id: mockUsers.length + 1,
    username,
    email,
    first_name: first_name || '',
    last_name: last_name || '',
    bio: bio || '',
    media_count: 0,
    likes_given: 0
  };

  mockUsers.push(newUser);

  res.status(201).json({
    success: true,
    message: 'User created successfully',
    data: newUser
  });
});

app.put('/api/users/:id', (req, res) => {
  const userIndex = mockUsers.findIndex(u => u.id === parseInt(req.params.id));
  if (userIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }

  const { username, first_name, last_name, bio } = req.body;
  if (username) mockUsers[userIndex].username = username;
  if (first_name) mockUsers[userIndex].first_name = first_name;
  if (last_name) mockUsers[userIndex].last_name = last_name;
  if (bio) mockUsers[userIndex].bio = bio;

  res.json({
    success: true,
    message: 'User updated successfully',
    data: mockUsers[userIndex]
  });
});

app.delete('/api/users/:id', (req, res) => {
  const userIndex = mockUsers.findIndex(u => u.id === parseInt(req.params.id));
  if (userIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }

  mockUsers.splice(userIndex, 1);
  res.json({
    success: true,
    message: 'User deleted successfully'
  });
});

// LIKE ENDPOINTS
app.get('/api/likes/media/:id', (req, res) => {
  const mediaId = parseInt(req.params.id);
  const likes = mockLikes.filter(l => l.media_id === mediaId);
  const likeCount = likes.length;
  
  res.json({
    success: true,
    data: {
      media_id: mediaId,
      like_count: likeCount,
      likes: likes
    }
  });
});

app.get('/api/likes/user/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  const likes = mockLikes.filter(l => l.user_id === userId);
  
  res.json({
    success: true,
    data: {
      user_id: userId,
      like_count: likes.length,
      liked_media: likes
    }
  });
});

app.post('/api/likes', (req, res) => {
  const { user_id, media_id } = req.body;
  
  if (!user_id || !media_id) {
    return res.status(400).json({
      success: false,
      error: 'user_id and media_id required'
    });
  }

  const existingLike = mockLikes.find(l => 
    l.user_id === parseInt(user_id) && l.media_id === parseInt(media_id)
  );

  if (existingLike) {
    // Unlike
    const likeIndex = mockLikes.indexOf(existingLike);
    mockLikes.splice(likeIndex, 1);
    res.json({
      success: true,
      action: 'unliked',
      message: 'Media unliked successfully'
    });
  } else {
    // Like
    const newLike = {
      id: mockLikes.length + 1,
      user_id: parseInt(user_id),
      media_id: parseInt(media_id)
    };
    mockLikes.push(newLike);
    res.status(201).json({
      success: true,
      action: 'liked',
      message: 'Media liked successfully',
      data: newLike
    });
  }
});

app.delete('/api/likes/:id', (req, res) => {
  const likeIndex = mockLikes.findIndex(l => l.id === parseInt(req.params.id));
  if (likeIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'Like not found'
    });
  }

  mockLikes.splice(likeIndex, 1);
  res.json({
    success: true,
    message: 'Like removed successfully'
  });
});

// Popular media endpoint
app.get('/api/likes/popular', (req, res) => {
  const mediaWithLikes = mockMedia.map(media => ({
    ...media,
    like_count: mockLikes.filter(l => l.media_id === media.id).length
  })).sort((a, b) => b.like_count - a.like_count);

  res.json({
    success: true,
    data: mediaWithLikes
  });
});

// Error handling
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    error: 'Not Found', 
    message: 'The requested resource does not exist.' 
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false,
    error: 'Server Error', 
    message: err.message 
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Demo Server running on http://localhost:${PORT}`);
  console.log(`📚 API documentation available at http://localhost:${PORT}`);
  console.log(`\n💡 This is a demo version using mock data.`);
  console.log(`   For full database version, see the complete MVC implementation.`);
});

module.exports = app;
