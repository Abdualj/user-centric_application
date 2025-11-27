# User-Centric Media API with JWT Authentication

## Overview
This is version 3.0 of the User-Centric Media API, now featuring JWT-based authentication and role-based authorization. The application implements a complete MVC architecture with secure user authentication, protecting media uploads and user management operations.

## New Features in v3.0

### JWT Authentication
- **POST /api/auth/login** - User login with email/password
- **POST /api/auth/register** - User registration 
- **GET /api/auth/profile** - Get authenticated user profile
- **GET /api/auth/verify** - Verify JWT token validity

### Role-Based Authorization
- **User Role**: Can manage their own media and profile
- **Admin Role**: Can manage all users and media

### Protected Endpoints
All media upload/modification and user management operations now require authentication:
- Media upload, update, and delete operations
- User profile updates
- User management (admin only)

## API Endpoints

### Authentication
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/login` | User login | No |
| POST | `/api/auth/register` | User registration | No |
| GET | `/api/auth/profile` | Get current user profile | Yes |
| GET | `/api/auth/verify` | Verify token validity | Yes |

### Media Management
| Method | Endpoint | Description | Auth Required | Authorization |
|--------|----------|-------------|---------------|---------------|
| GET | `/api/media` | List all media | No | Public |
| GET | `/api/media/:id` | Get media by ID | No | Public |
| POST | `/api/media` | Upload media | Yes | Authenticated users |
| PUT | `/api/media/:id` | Update media | Yes | Owner or Admin |
| DELETE | `/api/media/:id` | Delete media | Yes | Owner or Admin |

### User Management
| Method | Endpoint | Description | Auth Required | Authorization |
|--------|----------|-------------|---------------|---------------|
| GET | `/api/users` | List all users | No | Public |
| GET | `/api/users/:id` | Get user by ID | No | Public |
| POST | `/api/users` | Create user | Yes | Admin only |
| PUT | `/api/users/:id` | Update user | Yes | Owner or Admin |
| DELETE | `/api/users/:id` | Delete user | Yes | Owner or Admin |

### Social Features
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/likes/media/:id` | Get likes for media | No |
| GET | `/api/likes/user/:id` | Get user's likes | No |
| POST | `/api/likes` | Like/unlike media | Optional |
| DELETE | `/api/likes/:id` | Remove like | Optional |

## Authentication Flow

1. **User Registration**: POST to `/api/auth/register`
2. **User Login**: POST to `/api/auth/login` (returns JWT token)
3. **API Access**: Include token in Authorization header: `Bearer <token>`
4. **Token Verification**: Middleware validates JWT on protected routes

## Authorization Rules

### Media Operations
- **Create**: Any authenticated user can upload media
- **Read**: Public access to view all media
- **Update**: Only media owner or admin can update
- **Delete**: Only media owner or admin can delete

### User Operations  
- **Profile Updates**: Users can only update their own profiles
- **User Management**: Only admins can create/delete users
- **Role Assignment**: Only admins can modify user roles

## Setup and Installation

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Configuration**:
   Create `.env` file with:
   ```
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRES_IN=7d
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=user_centric_media
   PORT=3000
   ```

3. **Database Setup** (Optional):
   ```bash
   npm run init-db
   ```
   *Note: App will use mock data if database connection fails*

4. **Start Server**:
   ```bash
   npm start
   ```

## Testing the API

### Sample Authentication Flow

1. **Register a new user**:
   ```bash
   curl -X POST http://localhost:3000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "username": "newuser",
       "email": "user@example.com",
       "password": "password123",
       "first_name": "New",
       "last_name": "User"
     }'
   ```

2. **Login to get token**:
   ```bash
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "user@example.com",
       "password": "password123"
     }'
   ```

3. **Use token for authenticated requests**:
   ```bash
   curl -X POST http://localhost:3000/api/media \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -F "title=My Photo" \
     -F "description=A test upload" \
     -F "media=@path/to/image.jpg"
   ```

### Pre-seeded Test Accounts

When using mock data mode, these accounts are available:

- **Admin Account**: 
  - Email: `admin@example.com`
  - Password: `admin123`
  - Role: `admin`

- **Regular User**: 
  - Email: `john@example.com` 
  - Password: `password123`
  - Role: `user`

## Technical Implementation

### Security Features
- **JWT Token Authentication**: Secure, stateless authentication
- **Password Hashing**: bcrypt for secure password storage
- **Authorization Middleware**: Role-based access control
- **Input Validation**: Request validation and sanitization
- **Error Handling**: Secure error messages without information leakage

### Architecture
- **MVC Pattern**: Models, Views, Controllers separation
- **Middleware Stack**: Authentication, authorization, error handling
- **Database Integration**: MySQL with connection pooling
- **Mock Data Fallback**: Development mode without database
- **File Upload**: Multer for media file handling

### Security Considerations
- JWT tokens expire after 7 days (configurable)
- Admin privileges required for user management
- Resource ownership validation for updates/deletes
- SQL injection prevention through parameterized queries
- File upload restrictions (images/videos only, size limits)

## Development Notes

- Server runs on `http://localhost:3000`
- API documentation available at root URL
- Mock data mode activates automatically if database unavailable  
- JWT secret should be changed in production
- File uploads stored in `./uploads/` directory

## Error Handling

The API returns consistent error responses:

```json
{
  "error": "Error Type",
  "message": "Human-readable error description"
}
```

Common status codes:
- `401`: Authentication required
- `403`: Access forbidden (authorization failed)  
- `404`: Resource not found
- `409`: Conflict (duplicate resource)
- `500`: Internal server error