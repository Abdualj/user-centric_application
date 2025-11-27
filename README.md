Assignment (authentication branch)
This week's task: add JWT authentication to Express MVC app.

Did the endpoints

- POST /api/auth/register - register user
- POST /api/auth/login - login user
- GET /api/auth/profile - get user profile
- GET /api/auth/verify - verify token
- All previous endpoints from week-4 with auth protection

How to run

```bash
npm install
npm run init-db
npm start
```

Test authentication

```bash
npm run test-auth
```
