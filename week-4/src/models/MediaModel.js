// Media Model - handles all database operations for media
const { pool } = require('../config/database');
const MockDatabase = require('../config/mockDatabase');

class MediaModel {
  // Check if we should use mock database (dynamic check)
  static get USE_MOCK() {
    return process.env.USE_MOCK_DB === 'true';
  }

  // Get all media items with user info and like counts
  static async getAllMedia() {
    if (this.USE_MOCK) {
      return MockDatabase.media || [];
    }
    
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
    if (this.USE_MOCK) {
      return MockDatabase.media.find(media => media.id === parseInt(id)) || null;
    }
    
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
    if (this.USE_MOCK) {
      const newMedia = {
        id: MockDatabase.media.length + 1,
        ...mediaData,
        like_count: 0,
        created_at: new Date(),
        updated_at: new Date()
      };
      MockDatabase.media.push(newMedia);
      return newMedia;
    }
    
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

  // Update media item with authorization check
  static async updateMedia(id, updates, requestingUserId, userRole) {
    if (this.USE_MOCK) {
      // First check if media exists and get owner info
      const mediaIndex = MockDatabase.media.findIndex(media => media.id === parseInt(id));
      if (mediaIndex === -1) {
        throw new Error('Media not found');
      }

      const media = MockDatabase.media[mediaIndex];
      
      // Check authorization - only owner or admin can update
      if (userRole !== 'admin' && media.user_id !== requestingUserId) {
        throw new Error('You can only update your own media');
      }

      // Update the media
      MockDatabase.media[mediaIndex] = { 
        ...media, 
        ...updates, 
        updated_at: new Date() 
      };
      
      return MockDatabase.media[mediaIndex];
    }

    // Database version (original code)
    // First check if media exists and get owner info
    const media = await this.getMediaById(id);
    if (!media) {
      throw new Error('Media not found');
    }

    // Check authorization - only owner or admin can update
    if (userRole !== 'admin' && media.user_id !== requestingUserId) {
      throw new Error('You can only update your own media');
    }

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
    values.push(requestingUserId); // Add user_id check for extra security
    
    let query;
    if (userRole === 'admin') {
      // Admin can update any media
      query = `UPDATE media SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
      values.pop(); // Remove the extra user_id for admin
    } else {
      // Regular users can only update their own media
      query = `UPDATE media SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?`;
    }
    
    const [result] = await pool.execute(query, values);
    if (result.affectedRows === 0) {
      throw new Error('Update failed - media not found or access denied');
    }
    
    return this.getMediaById(id);
  }

  // Delete media item with authorization check
  static async deleteMedia(id, requestingUserId, userRole) {
    // First check if media exists and get owner info
    const media = await this.getMediaById(id);
    if (!media) {
      throw new Error('Media not found');
    }

    // Check authorization - only owner or admin can delete
    if (userRole !== 'admin' && media.user_id !== requestingUserId) {
      throw new Error('You can only delete your own media');
    }

    let query;
    let values;
    
    if (userRole === 'admin') {
      // Admin can delete any media
      query = 'DELETE FROM media WHERE id = ?';
      values = [id];
    } else {
      // Regular users can only delete their own media
      query = 'DELETE FROM media WHERE id = ? AND user_id = ?';
      values = [id, requestingUserId];
    }
    
    const [result] = await pool.execute(query, values);
    if (result.affectedRows === 0) {
      throw new Error('Delete failed - media not found or access denied');
    }
    
    return true;
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
