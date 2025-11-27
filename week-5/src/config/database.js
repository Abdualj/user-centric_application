// Database configuration and connection
const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root', 
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'user_centric_app',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Database initialization
async function initializeDatabase() {
  try {
    console.log('🔄 Attempting database connection...');
    const connection = await pool.getConnection();
    
    // Create database if it doesn't exist
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
    await connection.execute(`USE ${dbConfig.database}`);
    
    // Create users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(50),
        last_name VARCHAR(50),
        avatar_url VARCHAR(255),
        bio TEXT,
        role ENUM('user', 'admin') DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    // Add role column if it doesn't exist (for existing databases)
    await connection.execute(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS role ENUM('user', 'admin') DEFAULT 'user'
    `);
    
    // Create media table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS media (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        filename VARCHAR(255) NOT NULL,
        original_name VARCHAR(255) NOT NULL,
        file_type VARCHAR(50) NOT NULL,
        file_size INT NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        mime_type VARCHAR(100) NOT NULL,
        user_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    
    // Create likes table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS likes (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        media_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (media_id) REFERENCES media(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_media_like (user_id, media_id)
      )
    `);
    
    // Create comments table (bonus feature)
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS comments (
        id INT PRIMARY KEY AUTO_INCREMENT,
        content TEXT NOT NULL,
        user_id INT NOT NULL,
        media_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (media_id) REFERENCES media(id) ON DELETE CASCADE
      )
    `);
    
    // Insert sample data if tables are empty
    await seedData(connection);
    
    connection.release();
    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('🔄 Switching to mock data mode for testing...');
    
    // Set environment variable to use mock data
    process.env.USE_MOCK_DB = 'true';
    
    // Initialize mock database with authentication-ready data
    const bcrypt = require('bcryptjs');
    const mockDatabase = require('./mockDatabase');
    
    // Add sample users with proper passwords for testing
    if (!mockDatabase.users.find(u => u.email === 'admin@example.com')) {
      const adminPassword = await bcrypt.hash('admin123', 10);
      const userPassword = await bcrypt.hash('password123', 10);
      
      mockDatabase.users.push(
        {
          id: 1,
          username: 'admin',
          email: 'admin@example.com',
          password_hash: adminPassword,
          first_name: 'Admin',
          last_name: 'User',
          role: 'admin',
          bio: 'System administrator',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 2,
          username: 'john_doe',
          email: 'john@example.com',
          password_hash: userPassword,
          first_name: 'John',
          last_name: 'Doe',
          role: 'user',
          bio: 'Photography enthusiast',
          created_at: new Date(),
          updated_at: new Date()
        }
      );
      
      console.log('✅ Mock database initialized with authentication data');
      console.log('👤 Test credentials:');
      console.log('   Admin: admin@example.com / admin123');
      console.log('   User: john@example.com / password123');
    }
  }
}

// Seed sample data
async function seedData(connection) {
  const bcrypt = require('bcryptjs');
  
  // Check if users exist
  const [userRows] = await connection.execute('SELECT COUNT(*) as count FROM users');
  if (userRows[0].count === 0) {
    // Hash passwords for sample users
    const password1 = await bcrypt.hash('password123', 10);
    const password2 = await bcrypt.hash('password123', 10);
    const password3 = await bcrypt.hash('password123', 10);
    const adminPassword = await bcrypt.hash('admin123', 10);
    
    // Insert sample users including admin
    await connection.execute(`
      INSERT INTO users (username, email, password_hash, first_name, last_name, bio, role) VALUES
      ('admin', 'admin@example.com', ?, 'Admin', 'User', 'System administrator', 'admin'),
      ('john_doe', 'john@example.com', ?, 'John', 'Doe', 'Photography enthusiast', 'user'),
      ('jane_smith', 'jane@example.com', ?, 'Jane', 'Smith', 'Digital artist', 'user'),
      ('mike_johnson', 'mike@example.com', ?, 'Mike', 'Johnson', 'Travel blogger', 'user')
    `, [adminPassword, password1, password2, password3]);
    
    // Insert sample media
    await connection.execute(`
      INSERT INTO media (title, description, filename, original_name, file_type, file_size, file_path, mime_type, user_id) VALUES
      ('Red Bicycle', 'A beautiful red bicycle for city riding', 'redbike.jpg', 'red-bike-original.jpg', 'image', 156789, '/uploads/redbike.jpg', 'image/jpeg', 2),
      ('Skateboard', 'Professional skateboard for tricks', 'skateboard.jpg', 'skateboard-original.jpg', 'image', 234567, '/uploads/skateboard.jpg', 'image/jpeg', 3),
      ('Safety Helmet', 'Green safety helmet for cycling', 'green-helmet.jpg', 'helmet-original.jpg', 'image', 189012, '/uploads/green-helmet.jpg', 'image/jpeg', 4)
    `);
    
    console.log('📊 Sample data inserted with hashed passwords');
    console.log('👤 Sample login credentials:');
    console.log('   Admin: admin@example.com / admin123');
    console.log('   User: john@example.com / password123');
    console.log('   User: jane@example.com / password123');
    console.log('   User: mike@example.com / password123');
  }
}

module.exports = {
  pool,
  initializeDatabase
};
