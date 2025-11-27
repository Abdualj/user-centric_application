// Like routes - Express router for like endpoints
const express = require('express');
const { body } = require('express-validator');
const LikeController = require('../controllers/LikeController');

const router = express.Router();

// GET /api/likes/media/:id - Get likes for specific media
router.get('/media/:id', LikeController.getLikesForMedia);

// GET /api/likes/user/:id - Get likes by specific user
router.get('/user/:id', LikeController.getLikesByUser);

// GET /api/likes/popular - Get most liked media
router.get('/popular', LikeController.getMostLikedMedia);

// GET /api/likes/activity/:userId - Get user's like activity
router.get('/activity/:userId', LikeController.getUserLikeActivity);

// GET /api/likes/check - Check if user liked specific media
router.get('/check', LikeController.checkLikeStatus);

// POST /api/likes - Toggle like (like/unlike)
router.post(
  '/',
  [
    body('media_id').isInt({ min: 1 }),
    body('user_id').isInt({ min: 1 })
  ],
  LikeController.toggleLike
);

// DELETE /api/likes/:id - Remove specific like
router.delete('/:id', LikeController.deleteLike);

module.exports = router;
