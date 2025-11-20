// User Model - handles all database operations for users
const { pool } = require('../config/database');

class UserModel {
  // Get all users
  static async getAllUsers() {
    const query = `
      SELECT 
        u.*,
        COUNT(DISTINCT m.id) as media_count,
        COUNT(DISTINCT l.id) as likes_given
      FROM users u
      LEFT JOIN media m ON u.id = m.user_id
      LEFT JOIN likes l ON u.id = l.user_id
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `;
    
    const [rows] = await pool.execute(query);
    // Remove password_hash from response
    return rows.map(user => {
      const { password_hash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
  }

  // Get user by ID
  static async getUserById(id) {
    const query = `
      SELECT 
        u.*,
        COUNT(DISTINCT m.id) as media_count,
        COUNT(DISTINCT l.id) as likes_given
      FROM users u
      LEFT JOIN media m ON u.id = m.user_id
      LEFT JOIN likes l ON u.id = l.user_id
      WHERE u.id = ?
      GROUP BY u.id
    `;
    
    const [rows] = await pool.execute(query, [id]);
    if (rows.length === 0) return null;
    
    const { password_hash, ...userWithoutPassword } = rows[0];
    return userWithoutPassword;
  }

  // Get user by email
  static async getUserByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = ?';
    const [rows] = await pool.execute(query, [email]);
    return rows[0] || null;
  }

  // Get user by username
  static async getUserByUsername(username) {
    const query = 'SELECT * FROM users WHERE username = ?';
    const [rows] = await pool.execute(query, [username]);
    return rows[0] || null;
  }

  // Create new user
  static async createUser(userData) {
    // Check if username or email already exists
    const existingUser = await this.getUserByEmail(userData.email) || 
                        await this.getUserByUsername(userData.username);
    
    if (existingUser) {
      throw new Error('Username or email already exists');
    }

    const query = `
      INSERT INTO users (username, email, password_hash, first_name, last_name, avatar_url, bio)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const values = [
      userData.username,
      userData.email,
      userData.password_hash || 'temp_hash', // In real app, hash password here
      userData.first_name || null,
      userData.last_name || null,
      userData.avatar_url || null,
      userData.bio || null
    ];
    
    const [result] = await pool.execute(query, values);
    return this.getUserById(result.insertId);
  }

  // Update user
  static async updateUser(id, updates) {
    // Don't allow updating id, email, or password through this method
    const allowedFields = ['username', 'first_name', 'last_name', 'avatar_url', 'bio'];
    const fields = [];
    const values = [];
    
    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key) && updates[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(updates[key]);
      }
    });
    
    if (fields.length === 0) {
      throw new Error('No valid fields to update');
    }
    
    // Check for username conflicts if updating username
    if (updates.username) {
      const existingUser = await this.getUserByUsername(updates.username);
      if (existingUser && existingUser.id !== parseInt(id)) {
        throw new Error('Username already exists');
      }
    }
    
    values.push(id);
    const query = `UPDATE users SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    
    const [result] = await pool.execute(query, values);
    if (result.affectedRows === 0) {
      return null;
    }
    
    return this.getUserById(id);
  }

  // Delete user
  static async deleteUser(id) {
    const query = 'DELETE FROM users WHERE id = ?';
    const [result] = await pool.execute(query, [id]);
    return result.affectedRows > 0;
  }

  // Get user statistics
  static async getUserStats(id) {
    const query = `
      SELECT 
        COUNT(DISTINCT m.id) as media_count,
        COUNT(DISTINCT l.id) as likes_given,
        COUNT(DISTINCT ml.id) as likes_received
      FROM users u
      LEFT JOIN media m ON u.id = m.user_id
      LEFT JOIN likes l ON u.id = l.user_id
      LEFT JOIN likes ml ON ml.media_id = m.id
      WHERE u.id = ?
      GROUP BY u.id
    `;
    
    const [rows] = await pool.execute(query, [id]);
    return rows[0] || { media_count: 0, likes_given: 0, likes_received: 0 };
  }
}

module.exports = UserModel;
