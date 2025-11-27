// app.js
const express = require('express');
const path = require('path');

const apiRouter = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

// view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// parse JSON bodies
app.use(express.json());

// serve media folder at /media
app.use('/media', express.static(path.join(__dirname, 'media')));

// landing page
app.get('/', (req, res) => {
  // dynamic content: show API info and example items
  const apiInfo = {
    name: 'Example Items API',
    version: '1.0',
    endpoints: [
      { method: 'GET', path: '/api/items' },
      { method: 'GET', path: '/api/items/:id' },
      { method: 'POST', path: '/api/items' },
      { method: 'PUT', path: '/api/items/:id' },
      { method: 'DELETE', path: '/api/items/:id' }
    ]
  };

  // pass to pug view
  res.render('index', { apiInfo, baseUrl: req.protocol + '://' + req.get('host') });
});

// mount API router
app.use('/api', apiRouter);

// 404 for other routes
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found', message: 'Resource does not exist.' });
});

// basic error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: 'Server Error', message: err.message });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
