// Media Model - handles all database operations for media
const { pool } = require('../config/database');
const MockDatabase = require('../config/mockDatabase');

// Check if we should use mock database
const USE_MOCK = process.env.USE_MOCK_DB === 'true' || !pool;

class MediaModel {
  // Get all media items with user info and like counts
  static async getAllMedia() {
    const query = `
      SELECT 
        m.*,
        u.username,
        u.first_name,
        u.last_name,
        COUNT(l.id) as like_count
      FROM media m
      LEFT JOIN users u ON m.user_id = u.id
      LEFT JOIN likes l ON m.id = l.media_id
      GROUP BY m.id
      ORDER BY m.created_at DESC
    `;
    
    const [rows] = await pool.execute(query);
    return rows;
  }

  // Get media by ID
  static async getMediaById(id) {
    const query = `
      SELECT 
        m.*,
        u.username,
        u.first_name,
        u.last_name,
        COUNT(l.id) as like_count
      FROM media m
      LEFT JOIN users u ON m.user_id = u.id
      LEFT JOIN likes l ON m.id = l.media_id
      WHERE m.id = ?
      GROUP BY m.id
    `;
    
    const [rows] = await pool.execute(query, [id]);
    return rows[0] || null;
  }

  // Create new media item
  static async createMedia(mediaData) {
    const query = `
      INSERT INTO media (title, description, filename, original_name, file_type, file_size, file_path, mime_type, user_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const values = [
      mediaData.title,
      mediaData.description,
      mediaData.filename,
      mediaData.original_name,
      mediaData.file_type,
      mediaData.file_size,
      mediaData.file_path,
      mediaData.mime_type,
      mediaData.user_id
    ];
    
    const [result] = await pool.execute(query, values);
    return this.getMediaById(result.insertId);
  }

  // Update media item
  static async updateMedia(id, updates) {
    const fields = [];
    const values = [];
    
    // Build dynamic update query
    Object.keys(updates).forEach(key => {
      if (key !== 'id' && updates[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(updates[key]);
      }
    });
    
    if (fields.length === 0) {
      throw new Error('No valid fields to update');
    }
    
    values.push(id);
    const query = `UPDATE media SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    
    const [result] = await pool.execute(query, values);
    if (result.affectedRows === 0) {
      return null;
    }
    
    return this.getMediaById(id);
  }

  // Delete media item
  static async deleteMedia(id) {
    const query = 'DELETE FROM media WHERE id = ?';
    const [result] = await pool.execute(query, [id]);
    return result.affectedRows > 0;
  }

  // Get media by user ID
  static async getMediaByUserId(userId) {
    const query = `
      SELECT 
        m.*,
        COUNT(l.id) as like_count
      FROM media m
      LEFT JOIN likes l ON m.id = l.media_id
      WHERE m.user_id = ?
      GROUP BY m.id
      ORDER BY m.created_at DESC
    `;
    
    const [rows] = await pool.execute(query, [userId]);
    return rows;
  }
}

module.exports = MediaModel;
