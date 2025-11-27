Assignment (validation branch)
This week's task: add error handler middleware and server-side validation to Express app.

Features:
- Centralized error handler middleware (errorHandler.js)
- All controllers use next(err) for error handling
- Input validation and sanitization with express-validator
- Validation rules for all POST/PUT endpoints
- Example: title, description, email, password, etc. are validated and sanitized

How to run:
```bash
npm install
npm run init-db
npm start
```


