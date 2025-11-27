// Media Controller - handles HTTP requests for media endpoints
const MediaModel = require('../models/MediaModel');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads/'))
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
  static async getAllMedia(req, res) {
    try {
      const media = await MediaModel.getAllMedia();
      res.status(200).json({
        success: true,
        count: media.length,
        data: media
      });
    } catch (error) {
      console.error('Error fetching media:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch media items',
        message: error.message
      });
    }
  }

  // GET /api/media/:id - Get media item by ID
  static async getMediaById(req, res) {
    try {
      const { id } = req.params;
      const media = await MediaModel.getMediaById(id);
      
      if (!media) {
        return res.status(404).json({
          success: false,
          error: 'Media not found',
          message: `Media item with ID ${id} not found`
        });
      }
      
      res.status(200).json({
        success: true,
        data: media
      });
    } catch (error) {
      console.error('Error fetching media:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch media item',
        message: error.message
      });
    }
  }

  // POST /api/media - Upload new media file
  static uploadMedia = upload.single('media');
  
  static async createMedia(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No file uploaded',
          message: 'Please provide a media file'
        });
      }
      
      const { title, description, user_id = 1 } = req.body; // Default user_id for demo
      
      if (!title) {
        return res.status(400).json({
          success: false,
          error: 'Title required',
          message: 'Please provide a title for the media'
        });
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
        user_id: parseInt(user_id)
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
      
      res.status(500).json({
        success: false,
        error: 'Failed to upload media',
        message: error.message
      });
    }
  }

  // PUT /api/media/:id - Update media item
  static async updateMedia(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      // Remove sensitive fields that shouldn't be updated via this endpoint
      const allowedUpdates = ['title', 'description'];
      const filteredUpdates = {};
      
      allowedUpdates.forEach(field => {
        if (updates[field] !== undefined) {
          filteredUpdates[field] = updates[field];
        }
      });
      
      if (Object.keys(filteredUpdates).length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No valid fields to update',
          message: 'Please provide title or description to update'
        });
      }
      
      const updatedMedia = await MediaModel.updateMedia(id, filteredUpdates);
      
      if (!updatedMedia) {
        return res.status(404).json({
          success: false,
          error: 'Media not found',
          message: `Media item with ID ${id} not found`
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Media updated successfully',
        data: updatedMedia
      });
    } catch (error) {
      console.error('Error updating media:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update media',
        message: error.message
      });
    }
  }

  // DELETE /api/media/:id - Delete media item
  static async deleteMedia(req, res) {
    try {
      const { id } = req.params;
      
      // Get media info before deletion to clean up file
      const media = await MediaModel.getMediaById(id);
      if (!media) {
        return res.status(404).json({
          success: false,
          error: 'Media not found',
          message: `Media item with ID ${id} not found`
        });
      }
      
      const deleted = await MediaModel.deleteMedia(id);
      
      if (deleted) {
        // Try to delete the physical file
        try {
          const filePath = path.join(__dirname, '../../', media.file_path);
          await fs.unlink(filePath);
        } catch (fileError) {
          console.warn('Could not delete physical file:', fileError.message);
        }
        
        res.status(200).json({
          success: true,
          message: 'Media deleted successfully'
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to delete media',
          message: 'Database operation failed'
        });
      }
    } catch (error) {
      console.error('Error deleting media:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete media',
        message: error.message
      });
    }
  }
}

module.exports = MediaController;
