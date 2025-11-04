// routes/api.js
const express = require('express');
const router = express.Router();
const { items } = require('../data/mockData');

/**
 * Helper: find item by id (number)
 * returns {index, item} or {index:-1,item:null}
 */
function findById(id) {
  const idx = items.findIndex(i => i.id === id);
  return { index: idx, item: idx >= 0 ? items[idx] : null };
}

/**
 * GET /api/items
 * Return list of items
 */
router.get('/items', (req, res) => {
  res.set('Content-Type', 'application/json');
  res.status(200).json({ count: items.length, items });
});

/**
 * GET /api/items/:id
 * Return single item or 404
 */
router.get('/items/:id', (req, res) => {
  const id = Number(req.params.id);
  const { item } = findById(id);
  if (!item) {
    return res.status(404).json({ error: 'Not Found', message: `Item with id ${id} not found.` });
  }
  res.status(200).json(item);
});

/**
 * POST /api/items
 * Create new item. Expects JSON body { title, description, image }
 * Returns 201 with created object.
 */
router.post('/items', (req, res) => {
  const { title, description, image } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Bad Request', message: 'Title is required.' });
  }
  // simplistic id generator
  const newId = items.length ? Math.max(...items.map(i => i.id)) + 1 : 1;
  const newItem = { id: newId, title, description: description || '', image: image || '' };
  items.push(newItem);
  res.status(201).json({ message: 'Item created', item: newItem });
});

/**
 * PUT /api/items/:id
 * Modify item: returns 200 with updated item, or 404.
 * This is a dummy modification, no persistence beyond in-memory.
 */
router.put('/items/:id', (req, res) => {
  const id = Number(req.params.id);
  const { index, item } = findById(id);
  if (index === -1) {
    return res.status(404).json({ error: 'Not Found', message: `Item with id ${id} not found.` });
  }
  const { title, description, image } = req.body;
  // rudimentary update
  if (title !== undefined) items[index].title = title;
  if (description !== undefined) items[index].description = description;
  if (image !== undefined) items[index].image = image;
  res.status(200).json({ message: 'Item updated', item: items[index] });
});

/**
 * DELETE /api/items/:id
 * Remove item from the array (dummy). Respond 204 on success.
 * If not found -> 404. Also show example error response for e.g. constrained delete.
 */
router.delete('/items/:id', (req, res) => {
  const id = Number(req.params.id);
  const { index } = findById(id);
  if (index === -1) {
    return res.status(404).json({ error: 'Not Found', message: `Item with id ${id} not found.` });
  }
  // For assignment show both success and an example of an error test:
  // simulate protected item id=1 cannot be deleted (example)
  if (id === 1) {
    return res.status(403).json({ error: 'Forbidden', message: 'Item is protected and cannot be deleted (demo).' });
  }
  items.splice(index, 1);
  // 204 No Content is common for successful DELETE
  res.status(204).send();
});

module.exports = router;
