// Mock Database - for demonstration when MySQL is not available
const users = [
  {
    id: 1,
    username: 'john_doe',
    email: 'john@example.com',
    first_name: 'John',
    last_name: 'Doe',
    bio: 'Photography enthusiast',
    role: 'user',
    password_hash: 'temp_hash',
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01'),
    media_count: 2,
    likes_given: 5
  },
  {
    id: 2,
    username: 'jane_smith',
    email: 'jane@example.com',
    first_name: 'Jane',
    last_name: 'Smith',
    bio: 'Digital artist',
    role: 'user',
    password_hash: 'temp_hash',
    created_at: new Date('2024-01-02'),
    updated_at: new Date('2024-01-02'),
    media_count: 1,
    likes_given: 3
  },
  {
    id: 3,
    username: 'mike_johnson',
    email: 'mike@example.com',
    first_name: 'Mike',
    last_name: 'Johnson',
    bio: 'Travel blogger',
    role: 'user',
    password_hash: 'temp_hash',
    created_at: new Date('2024-01-03'),
    updated_at: new Date('2024-01-03'),
    media_count: 1,
    likes_given: 2
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
  },
  {
    id: 3,
    title: 'Safety Helmet',
    description: 'Green safety helmet for cycling protection',
    filename: 'green-helmet.jpg',
    original_name: 'helmet-original.jpg',
    file_type: 'image',
    file_size: 189012,
    file_path: '/uploads/green-helmet.jpg',
    mime_type: 'image/jpeg',
    user_id: 3,
    username: 'mike_johnson',
    first_name: 'Mike',
    last_name: 'Johnson',
    like_count: 2,
    created_at: new Date('2024-01-12')
  }
];

const mockLikes = [
  { id: 1, user_id: 1, media_id: 2, created_at: new Date('2024-01-15') },
  { id: 2, user_id: 1, media_id: 3, created_at: new Date('2024-01-16') },
  { id: 3, user_id: 2, media_id: 1, created_at: new Date('2024-01-17') },
  { id: 4, user_id: 2, media_id: 3, created_at: new Date('2024-01-18') },
  { id: 5, user_id: 3, media_id: 1, created_at: new Date('2024-01-19') },
  { id: 6, user_id: 3, media_id: 2, created_at: new Date('2024-01-20') }
];

class MockDatabase {
  // Helper function to generate next ID
  static getNextId(collection) {
    return Math.max(...collection.map(item => item.id), 0) + 1;
  }

  // User operations
  static async getAllUsers() {
    return [...mockUsers];
  }

  static async getUserById(id) {
    return mockUsers.find(user => user.id === parseInt(id)) || null;
  }

  static async createUser(userData) {
    const newUser = {
      id: this.getNextId(mockUsers),
      ...userData,
      created_at: new Date(),
      media_count: 0,
      likes_given: 0
    };
    mockUsers.push(newUser);
    return newUser;
  }

  static async updateUser(id, updates) {
    const userIndex = mockUsers.findIndex(user => user.id === parseInt(id));
    if (userIndex === -1) return null;
    
    mockUsers[userIndex] = { ...mockUsers[userIndex], ...updates };
    return mockUsers[userIndex];
  }

  static async deleteUser(id) {
    const userIndex = mockUsers.findIndex(user => user.id === parseInt(id));
    if (userIndex === -1) return false;
    
    mockUsers.splice(userIndex, 1);
    return true;
  }

  // Media operations
  static async getAllMedia() {
    return [...mockMedia];
  }

  static async getMediaById(id) {
    return mockMedia.find(media => media.id === parseInt(id)) || null;
  }

  static async createMedia(mediaData) {
    const newMedia = {
      id: this.getNextId(mockMedia),
      ...mediaData,
      like_count: 0,
      created_at: new Date()
    };
    mockMedia.push(newMedia);
    return newMedia;
  }

  static async updateMedia(id, updates) {
    const mediaIndex = mockMedia.findIndex(media => media.id === parseInt(id));
    if (mediaIndex === -1) return null;
    
    mockMedia[mediaIndex] = { ...mockMedia[mediaIndex], ...updates };
    return mockMedia[mediaIndex];
  }

  static async deleteMedia(id) {
    const mediaIndex = mockMedia.findIndex(media => media.id === parseInt(id));
    if (mediaIndex === -1) return false;
    
    mockMedia.splice(mediaIndex, 1);
    return true;
  }

  // Like operations
  static async getLikesForMedia(mediaId) {
    return mockLikes.filter(like => like.media_id === parseInt(mediaId));
  }

  static async getLikesByUser(userId) {
    return mockLikes.filter(like => like.user_id === parseInt(userId));
  }

  static async isLiked(userId, mediaId) {
    return mockLikes.some(like => 
      like.user_id === parseInt(userId) && like.media_id === parseInt(mediaId)
    );
  }

  static async toggleLike(userId, mediaId) {
    const existingLike = mockLikes.find(like => 
      like.user_id === parseInt(userId) && like.media_id === parseInt(mediaId)
    );

    if (existingLike) {
      // Remove like
      const likeIndex = mockLikes.indexOf(existingLike);
      mockLikes.splice(likeIndex, 1);
      return { action: 'unliked', success: true };
    } else {
      // Add like
      const newLike = {
        id: this.getNextId(mockLikes),
        user_id: parseInt(userId),
        media_id: parseInt(mediaId),
        created_at: new Date()
      };
      mockLikes.push(newLike);
      return { action: 'liked', success: true, likeId: newLike.id };
    }
  }

  static async deleteLike(likeId) {
    const likeIndex = mockLikes.findIndex(like => like.id === parseInt(likeId));
    if (likeIndex === -1) return false;
    
    mockLikes.splice(likeIndex, 1);
    return true;
  }

  static async getLikeCount(mediaId) {
    return mockLikes.filter(like => like.media_id === parseInt(mediaId)).length;
  }

  static async getMostLikedMedia(limit = 10) {
    const mediaWithCounts = mockMedia.map(media => ({
      ...media,
      like_count: this.getLikeCount(media.id)
    }));
    
    return mediaWithCounts
      .sort((a, b) => b.like_count - a.like_count)
      .slice(0, limit);
  }
}

// Export the class and the data arrays
module.exports = MockDatabase;
module.exports.users = users;
module.exports.media = media;
module.exports.likes = mockLikes;
