// Like Model - handles all database operations for likes
const { pool } = require('../config/database');

class LikeModel {
  // Get all likes for a specific media item
  static async getLikesForMedia(mediaId) {
    const query = `
      SELECT 
        l.*,
        u.username,
        u.first_name,
        u.last_name,
        u.avatar_url
      FROM likes l
      JOIN users u ON l.user_id = u.id
      WHERE l.media_id = ?
      ORDER BY l.created_at DESC
    `;
    
    const [rows] = await pool.execute(query, [mediaId]);
    return rows;
  }

  // Get all likes by a specific user
  static async getLikesByUser(userId) {
    const query = `
      SELECT 
        l.*,
        m.title,
        m.filename,
        m.file_path
      FROM likes l
      JOIN media m ON l.media_id = m.id
      WHERE l.user_id = ?
      ORDER BY l.created_at DESC
    `;
    
    const [rows] = await pool.execute(query, [userId]);
    return rows;
  }

  // Check if user already liked media
  static async isLiked(userId, mediaId) {
    const query = 'SELECT id FROM likes WHERE user_id = ? AND media_id = ?';
    const [rows] = await pool.execute(query, [userId, mediaId]);
    return rows.length > 0;
  }

  // Add like (toggle functionality)
  static async toggleLike(userId, mediaId) {
    // Check if already liked
    const isAlreadyLiked = await this.isLiked(userId, mediaId);
    
    if (isAlreadyLiked) {
      // Remove like
      const deleteQuery = 'DELETE FROM likes WHERE user_id = ? AND media_id = ?';
      const [result] = await pool.execute(deleteQuery, [userId, mediaId]);
      return { action: 'unliked', success: result.affectedRows > 0 };
    } else {
      // Add like
      const insertQuery = 'INSERT INTO likes (user_id, media_id) VALUES (?, ?)';
      const [result] = await pool.execute(insertQuery, [userId, mediaId]);
      return { 
        action: 'liked', 
        success: result.affectedRows > 0,
        likeId: result.insertId
      };
    }
  }

  // Remove like by ID
  static async deleteLike(likeId) {
    const query = 'DELETE FROM likes WHERE id = ?';
    const [result] = await pool.execute(query, [likeId]);
    return result.affectedRows > 0;
  }

  // Get like count for media
  static async getLikeCount(mediaId) {
    const query = 'SELECT COUNT(*) as count FROM likes WHERE media_id = ?';
    const [rows] = await pool.execute(query, [mediaId]);
    return rows[0].count;
  }

  // Get most liked media
  static async getMostLikedMedia(limit = 10) {
    const query = `
      SELECT 
        m.*,
        u.username,
        COUNT(l.id) as like_count
      FROM media m
      LEFT JOIN users u ON m.user_id = u.id
      LEFT JOIN likes l ON m.id = l.media_id
      GROUP BY m.id
      ORDER BY like_count DESC, m.created_at DESC
      LIMIT ?
    `;
    
    const [rows] = await pool.execute(query, [limit]);
    return rows;
  }

  // Get user's recent activity
  static async getUserLikeActivity(userId, limit = 20) {
    const query = `
      SELECT 
        l.*,
        m.title as media_title,
        m.filename,
        m.file_path,
        owner.username as media_owner
      FROM likes l
      JOIN media m ON l.media_id = m.id
      JOIN users owner ON m.user_id = owner.id
      WHERE l.user_id = ?
      ORDER BY l.created_at DESC
      LIMIT ?
    `;
    
    const [rows] = await pool.execute(query, [userId, limit]);
    return rows;
  }
}

module.exports = LikeModel;
