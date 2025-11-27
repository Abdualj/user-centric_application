Set up a new branch express-db continuing from the previous Express project.
Reorganized the whole app into an MVC structure with models, controllers, and routes.
Connected the app to a MySQL database using mysql2 and added connection pooling.
Replaced mock data with real SQL queries.
Added a fallback mode that uses mock data if the database is not available.
Media API
Converted /api/media to MVC and implemented full CRUD:
GET /api/media — list media
GET /api/media/:id — get media
POST /api/media — create media + multer file upload
PUT /api/media/:id — update media
DELETE /api/media/:id — delete media
POST /api/media/upload — file upload endpoint
Users API
Converted /api/users to MVC and added CRUD:
GET /api/users
GET /api/users/:id
POST /api/users
PUT /api/users/:id
DELETE /api/users/:id
Likes Feature
Added a simple like system:
POST /api/likes — like media
DELETE /api/likes/:id — remove like
GET /api/likes/popular — most liked media
File Upload
Multer used for uploading image/video files.
Unique filenames and file type validation added.
Notes
All endpoints tested and working
Error handling improved across controllers and models
App available at http://localhost:3000
Tested using curl and Postman
Example curl commands:
curl http://localhost:3000/api/media
curl http://localhost:3000/api/users
curl -X POST http://localhost:3000/api/likes -H "Content-Type