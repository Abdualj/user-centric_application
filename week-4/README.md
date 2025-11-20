Express MVC + Database
Created a new branch express-db continuing from the previous Express project.
Reorganized the project into an MVC structure (models, controllers, routes).
Connected the app to a MySQL database using mysql2.
Replaced all mock data with real SQL queries.
Media API
Converted /api/media routes to MVC.
Implemented full CRUD:
GET /api/media — list media
GET /api/media/:id — get one media item
POST /api/media — add media with multer file upload
PUT /api/media/:id — update media
DELETE /api/media/:id — delete media
Users API
Converted /api/users routes to MVC.
Implemented CRUD:
GET /api/users
GET /api/users/:id
POST /api/users
PUT /api/users/:id
DELETE /api/users/:id
Likes Feature
Added a simple like system with its own model, controller, and routes:
GET /api/likes/media/:id — likes for a media item
GET /api/likes/user/:id — media liked by a user
POST /api/likes — add a like
DELETE /api/likes/:id — remove a like
Used SQL to store and manage likes.
Designed so users can like media items and retrieve like data when needed.