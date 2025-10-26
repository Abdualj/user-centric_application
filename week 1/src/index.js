import http from 'http';
import { readData, writeData } from './utils/fileUtils.js';

const hostname = '127.0.0.1';
const port = 3000;

function sendJSON(res, statusCode, payload) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(payload));
}

function collectRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => (body += chunk.toString()));
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const { url, method } = req;

  // GET /api/items
  if (url === '/api/items' && method === 'GET') {
    const data = readData();
    return sendJSON(res, 200, data);
  }

  // POST /api/items
  if (url === '/api/items' && method === 'POST') {
    try {
      const body = await collectRequestBody(req);
      const newItem = JSON.parse(body);

      if (!newItem.name || typeof newItem.price !== 'number')
        return sendJSON(res, 400, { error: 'Invalid item data' });

      const data = readData();
      newItem.id = data.length ? data[data.length - 1].id + 1 : 1;
      data.push(newItem);
      writeData(data);

      return sendJSON(res, 201, newItem);
    } catch {
      return sendJSON(res, 400, { error: 'Bad JSON' });
    }
  }

  // PUT /api/items/:id
  if (url.startsWith('/api/items/') && method === 'PUT') {
    const id = parseInt(url.split('/')[3]);
    if (Number.isNaN(id)) return sendJSON(res, 400, { error: 'Invalid ID' });

    try {
      const body = await collectRequestBody(req);
      const updates = JSON.parse(body);
      const data = readData();
      const index = data.findIndex(i => i.id === id);

      if (index === -1) return sendJSON(res, 404, { error: 'Not found' });

      data[index] = { ...data[index], ...updates };
      writeData(data);

      return sendJSON(res, 200, data[index]);
    } catch {
      return sendJSON(res, 400, { error: 'Bad JSON' });
    }
  }

  // DELETE /api/items/:id
  if (url.startsWith('/api/items/') && method === 'DELETE') {
    const id = parseInt(url.split('/')[3]);
    const data = readData();
    const index = data.findIndex(i => i.id === id);
    if (index === -1) return sendJSON(res, 404, { error: 'Not found' });

    data.splice(index, 1);
    writeData(data);
    return sendJSON(res, 200, { message: 'Deleted' });
  }

  // GET /api/summary
  if (url === '/api/summary' && method === 'GET') {
    const data = readData();
    const total = data.reduce((s, i) => s + i.price, 0);
    return sendJSON(res, 200, { count: data.length, totalPrice: total });
  }

  sendJSON(res, 404, { error: 'Resource not found' });
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
