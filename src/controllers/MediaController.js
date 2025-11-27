// Media Controller - handles HTTP requests for media endpoints
const MediaModel = require('../models/MediaModel');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { validationResult } = require('express-validator');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve('./uploads/'))
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept images only
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image and video files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

class MediaController {
  // GET /api/media - List all media items
  static async getAllMedia(req, res, next) {
    try {
      const media = await MediaModel.getAllMedia();
      res.status(200).json({
        success: true,
        count: media.length,
        data: media
      });
    } catch (error) {
      next({ status: 500, message: 'Failed to fetch media items', details: error.message });
    }
  }

  // GET /api/media/:id - Get media item by ID
  static async getMediaById(req, res, next) {
    try {
      const { id } = req.params;
      const media = await MediaModel.getMediaById(id);
      
      if (!media) {
        return next({ status: 404, message: `Media item with ID ${id} not found` });
      }
      
      res.status(200).json({
        success: true,
        data: media
      });
    } catch (error) {
      next({ status: 500, message: 'Failed to fetch media item', details: error.message });
    }
  }

  // POST /api/media - Upload new media file
  static uploadMedia = upload.single('media');
  
  static async createMedia(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next({ status: 400, message: 'Validation error', details: errors.array() });
      }
      if (!req.file) {
        return next({ status: 400, message: 'No file uploaded' });
      }
      
      const { title, description } = req.body;
      const user_id = req.user.id; // Get user ID from authenticated user
      
      if (!title) {
        return next({ status: 400, message: 'Title is required' });
      }
      
      const mediaData = {
        title,
        description: description || '',
        filename: req.file.filename,
        original_name: req.file.originalname,
        file_type: req.file.mimetype.startsWith('image/') ? 'image' : 'video',
        file_size: req.file.size,
        file_path: `/uploads/${req.file.filename}`,
        mime_type: req.file.mimetype,
        user_id: user_id
      };
      
      const newMedia = await MediaModel.createMedia(mediaData);
      
      res.status(201).json({
        success: true,
        message: 'Media uploaded successfully',
        data: newMedia
      });
    } catch (error) {
      console.error('Error uploading media:', error);
      
      // Clean up uploaded file if database operation failed
      if (req.file) {
        try {
          await fs.unlink(req.file.path);
        } catch (unlinkError) {
          console.error('Error deleting file:', unlinkError);
        }
      }
      
      next({ status: 500, message: 'Failed to create media', details: error.message });
    }
  }

  // PUT /api/media/:id - Update media item
  static async updateMedia(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next({ status: 400, message: 'Validation error', details: errors.array() });
      }
      const { id } = req.params;
      const { title, description } = req.body;
      const requestingUserId = req.user.id;
      const userRole = req.user.role;
      
      if (!title) {
        return next({ status: 400, message: 'Title is required' });
      }
      
      // Remove sensitive fields that shouldn't be updated via this endpoint
      const allowedUpdates = ['title', 'description'];
      const filteredUpdates = {};
      
      allowedUpdates.forEach(field => {
        if (updates[field] !== undefined) {
          filteredUpdates[field] = updates[field];
        }
      });
      
      if (Object.keys(filteredUpdates).length === 0) {
        return next({ status: 400, message: 'Please provide title or description to update' });
      }
      
      const updatedMedia = await MediaModel.updateMedia(id, filteredUpdates, requestingUserId, userRole);
      
      res.status(200).json({
        success: true,
        message: 'Media updated successfully',
        data: updatedMedia
      });
    } catch (error) {
      console.error('Error updating media:', error);
      
      if (error.message.includes('You can only') || error.message.includes('access denied')) {
        return next({ status: 403, message: error.message });
      }
      
      if (error.message.includes('not found')) {
        return next({ status: 404, message: error.message });
      }
      
      next({ status: 500, message: 'Failed to update media', details: error.message });
    }
  }

  // DELETE /api/media/:id - Delete media item
  static async deleteMedia(req, res, next) {
    try {
      const { id } = req.params;
      const requestingUserId = req.user.id;
      const userRole = req.user.role;
      
      // Get media info before deletion to clean up file
      const media = await MediaModel.getMediaById(id);
      if (!media) {
        return next({ status: 404, message: `Media item with ID ${id} not found` });
      }
      
      const deleted = await MediaModel.deleteMedia(id, requestingUserId, userRole);
      
      if (deleted) {
        // Try to delete the physical file
        try {
          const filePath = path.resolve('./uploads', path.basename(media.file_path));
          await fs.unlink(filePath);
        } catch (fileError) {
          console.warn('Could not delete physical file:', fileError.message);
        }
        
        res.status(200).json({
          success: true,
          message: 'Media deleted successfully'
        });
      } else {
        next({ status: 500, message: 'Database operation failed' });
      }
    } catch (error) {
      console.error('Error deleting media:', error);
      
      if (error.message.includes('You can only') || error.message.includes('access denied')) {
        return next({ status: 403, message: error.message });
      }
      
      if (error.message.includes('not found')) {
        return next({ status: 404, message: error.message });
      }
      
      next({ status: 500, message: 'Failed to delete media', details: error.message });
    }
  }
}

// Export the controller
module.exports = MediaController;
