// Media routes - Express router for media endpoints
const express = require('express');
const MediaController = require('../controllers/MediaController');

const router = express.Router();

// GET /api/media - List all media items
router.get('/', MediaController.getAllMedia);

// GET /api/media/:id - Get media item by ID
router.get('/:id', MediaController.getMediaById);

// POST /api/media - Upload new media file (with multer middleware)
router.post('/', MediaController.uploadMedia, MediaController.createMedia);

// PUT /api/media/:id - Update media item
router.put('/:id', MediaController.updateMedia);

// DELETE /api/media/:id - Delete media item
router.delete('/:id', MediaController.deleteMedia);

module.exports = router;
