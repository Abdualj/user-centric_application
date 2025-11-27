// Media routes - Express router for media endpoints
const express = require('express');
const MediaController = require('../controllers/MediaController');
const { authMiddleware, optionalAuth } = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/media - List all media items (public)
router.get('/', MediaController.getAllMedia);

// GET /api/media/:id - Get media item by ID (public)
router.get('/:id', MediaController.getMediaById);

// POST /api/media - Upload new media file (authenticated users only)
router.post('/', authMiddleware, MediaController.uploadMedia, MediaController.createMedia);

// PUT /api/media/:id - Update media item (owner or admin only)
router.put('/:id', authMiddleware, MediaController.updateMedia);

// DELETE /api/media/:id - Delete media item (owner or admin only)
router.delete('/:id', authMiddleware, MediaController.deleteMedia);

module.exports = router;
