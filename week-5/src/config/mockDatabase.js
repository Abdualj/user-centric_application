// Mock Database - for demonstration when MySQL is not available
const users = [
  {
    id: 1,
    username: 'john_doe',
    email: 'john@example.com',
    password_hash: 'temp_hash',
    first_name: 'John',
    last_name: 'Doe',
    bio: 'Photography enthusiast',
    role: 'user',
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01'),
    media_count: 2,
    likes_given: 5
  },
  {
    id: 2,
    username: 'jane_smith',
    email: 'jane@example.com',
    password_hash: 'temp_hash',
    first_name: 'Jane',
    last_name: 'Smith',
    bio: 'Digital artist',
    role: 'user',
    created_at: new Date('2024-01-02'),
    updated_at: new Date('2024-01-02'),
    media_count: 1,
    likes_given: 3
  }
];

const media = [
  {
    id: 1,
    title: 'Red Bicycle',
    description: 'A beautiful red bicycle for city riding',
    filename: 'redbike.jpg',
    original_name: 'red-bike-original.jpg',
    file_type: 'image',
    file_size: 156789,
    file_path: '/uploads/redbike.jpg',
    mime_type: 'image/jpeg',
    user_id: 1,
    username: 'john_doe',
    first_name: 'John',
    last_name: 'Doe',
    like_count: 5,
    created_at: new Date('2024-01-10')
  },
  {
    id: 2,
    title: 'Professional Skateboard',
    description: 'Professional skateboard for tricks and street riding',
    filename: 'skateboard.jpg',
    original_name: 'skateboard-original.jpg',
    file_type: 'image',
    file_size: 234567,
    file_path: '/uploads/skateboard.jpg',
    mime_type: 'image/jpeg',
    user_id: 2,
    username: 'jane_smith',
    first_name: 'Jane',
    last_name: 'Smith',
    like_count: 3,
    created_at: new Date('2024-01-11')
  }
];

const likes = [
  { id: 1, user_id: 1, media_id: 2, created_at: new Date('2024-01-15') },
  { id: 2, user_id: 2, media_id: 1, created_at: new Date('2024-01-16') }
];

class MockDatabase {
  static getNextId(collection) {
    return Math.max(...collection.map(item => item.id), 0) + 1;
  }

  // User operations
  static async getAllUsers() {
    return [...users];
  }

  static async getUserById(id) {
    return users.find(user => user.id === parseInt(id)) || null;
  }

  static async createUser(userData) {
    const newUser = {
      id: this.getNextId(users),
      ...userData,
      created_at: new Date(),
      updated_at: new Date(),
      media_count: 0,
      likes_given: 0
    };
    users.push(newUser);
    return newUser;
  }

  static async updateUser(id, updates) {
    const userIndex = users.findIndex(user => user.id === parseInt(id));
    if (userIndex === -1) return null;
    
    users[userIndex] = { ...users[userIndex], ...updates, updated_at: new Date() };
    return users[userIndex];
  }

  static async deleteUser(id) {
    const userIndex = users.findIndex(user => user.id === parseInt(id));
    if (userIndex === -1) return false;
    
    users.splice(userIndex, 1);
    return true;
  }

  static async getUserStats(id) {
    const user = users.find(user => user.id === parseInt(id));
    if (!user) return null;
    
    return {
      media_count: user.media_count || 0,
      likes_given: user.likes_given || 0,
      likes_received: 0
    };
  }

  // Media operations
  static async getAllMedia() {
    return [...media];
  }

  static async getMediaById(id) {
    return media.find(m => m.id === parseInt(id)) || null;
  }

  static async createMedia(mediaData) {
    const newMedia = {
      id: this.getNextId(media),
      ...mediaData,
      like_count: 0,
      created_at: new Date()
    };
    media.push(newMedia);
    return newMedia;
  }

  static async updateMedia(id, updates) {
    const mediaIndex = media.findIndex(m => m.id === parseInt(id));
    if (mediaIndex === -1) return null;
    
    media[mediaIndex] = { ...media[mediaIndex], ...updates };
    return media[mediaIndex];
  }

  static async deleteMedia(id) {
    const mediaIndex = media.findIndex(m => m.id === parseInt(id));
    if (mediaIndex === -1) return false;
    
    media.splice(mediaIndex, 1);
    return true;
  }

  // Like operations
  static async getLikesForMedia(mediaId) {
    return likes.filter(like => like.media_id === parseInt(mediaId));
  }

  static async getLikesByUser(userId) {
    return likes.filter(like => like.user_id === parseInt(userId));
  }

  static async toggleLike(userId, mediaId) {
    const existingLike = likes.find(like => 
      like.user_id === parseInt(userId) && like.media_id === parseInt(mediaId)
    );

    if (existingLike) {
      const likeIndex = likes.indexOf(existingLike);
      likes.splice(likeIndex, 1);
      return { action: 'unliked', success: true };
    } else {
      const newLike = {
        id: this.getNextId(likes),
        user_id: parseInt(userId),
        media_id: parseInt(mediaId),
        created_at: new Date()
      };
      likes.push(newLike);
      return { action: 'liked', success: true, likeId: newLike.id };
    }
  }

  static async deleteLike(likeId) {
    const likeIndex = likes.findIndex(like => like.id === parseInt(likeId));
    if (likeIndex === -1) return false;
    
    likes.splice(likeIndex, 1);
    return true;
  }

  static async getLikeCount(mediaId) {
    return likes.filter(like => like.media_id === parseInt(mediaId)).length;
  }
}

module.exports = MockDatabase;
module.exports.users = users;
module.exports.media = media;
module.exports.likes = likes;
