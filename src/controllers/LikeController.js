// Like Controller - handles HTTP requests for like endpoints
const LikeModel = require('../models/LikeModel');

class LikeController {
  // GET /api/likes/media/:id - Get likes for a specific media item
  static async getLikesForMedia(req, res) {
    try {
      const { id } = req.params;
      const likes = await LikeModel.getLikesForMedia(id);
      const likeCount = await LikeModel.getLikeCount(id);
      
      res.status(200).json({
        success: true,
        data: {
          media_id: parseInt(id),
          like_count: likeCount,
          likes: likes
        }
      });
    } catch (error) {
      console.error('Error fetching media likes:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch likes for media',
        message: error.message
      });
    }
  }

  // GET /api/likes/user/:id - Get likes by a specific user
  static async getLikesByUser(req, res) {
    try {
      const { id } = req.params;
      const likes = await LikeModel.getLikesByUser(id);
      
      res.status(200).json({
        success: true,
        data: {
          user_id: parseInt(id),
          like_count: likes.length,
          liked_media: likes
        }
      });
    } catch (error) {
      console.error('Error fetching user likes:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch user likes',
        message: error.message
      });
    }
  }

  // POST /api/likes - Toggle like on media (like/unlike)
  static async toggleLike(req, res) {
    try {
      const { user_id, media_id } = req.body;
      
      if (!user_id || !media_id) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields',
          message: 'user_id and media_id are required'
        });
      }
      
      const result = await LikeModel.toggleLike(user_id, media_id);
      
      if (result.success) {
        const statusCode = result.action === 'liked' ? 201 : 200;
        res.status(statusCode).json({
          success: true,
          action: result.action,
          message: `Media ${result.action} successfully`,
          data: {
            user_id: parseInt(user_id),
            media_id: parseInt(media_id),
            like_id: result.likeId || null
          }
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to toggle like',
          message: 'Database operation failed'
        });
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to toggle like',
        message: error.message
      });
    }
  }

  // DELETE /api/likes/:id - Remove specific like by ID
  static async deleteLike(req, res) {
    try {
      const { id } = req.params;
      const deleted = await LikeModel.deleteLike(id);
      
      if (deleted) {
        res.status(200).json({
          success: true,
          message: 'Like removed successfully'
        });
      } else {
        res.status(404).json({
          success: false,
          error: 'Like not found',
          message: `Like with ID ${id} not found`
        });
      }
    } catch (error) {
      console.error('Error deleting like:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete like',
        message: error.message
      });
    }
  }

  // GET /api/likes/popular - Get most liked media
  static async getMostLikedMedia(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const popularMedia = await LikeModel.getMostLikedMedia(limit);
      
      res.status(200).json({
        success: true,
        count: popularMedia.length,
        data: popularMedia
      });
    } catch (error) {
      console.error('Error fetching popular media:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch popular media',
        message: error.message
      });
    }
  }

  // GET /api/likes/activity/:userId - Get user's like activity
  static async getUserLikeActivity(req, res) {
    try {
      const { userId } = req.params;
      const limit = parseInt(req.query.limit) || 20;
      const activity = await LikeModel.getUserLikeActivity(userId, limit);
      
      res.status(200).json({
        success: true,
        data: {
          user_id: parseInt(userId),
          activity_count: activity.length,
          recent_likes: activity
        }
      });
    } catch (error) {
      console.error('Error fetching user activity:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch user activity',
        message: error.message
      });
    }
  }

  // GET /api/likes/check - Check if user liked specific media
  static async checkLikeStatus(req, res) {
    try {
      const { user_id, media_id } = req.query;
      
      if (!user_id || !media_id) {
        return res.status(400).json({
          success: false,
          error: 'Missing required parameters',
          message: 'user_id and media_id query parameters are required'
        });
      }
      
      const isLiked = await LikeModel.isLiked(user_id, media_id);
      
      res.status(200).json({
        success: true,
        data: {
          user_id: parseInt(user_id),
          media_id: parseInt(media_id),
          is_liked: isLiked
        }
      });
    } catch (error) {
      console.error('Error checking like status:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to check like status',
        message: error.message
      });
    }
  }
}

module.exports = LikeController;
