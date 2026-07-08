const express = require('express');
const db = require('../db');
const { authMiddleware, adminOnly } = require('../middleware/auth');

const router = express.Router();

// --- 妆型 ---
router.get('/types', authMiddleware, (req, res) => {
  const types = db.prepare('SELECT * FROM makeup_types ORDER BY sort_order ASC, id ASC').all();
  res.json(types);
});

router.post('/types', authMiddleware, adminOnly, (req, res) => {
  const { name, price, description, sort_order } = req.body;
  if (!name || price === undefined) return res.status(400).json({ error: '名称和价格必填' });
  const result = db.prepare('INSERT INTO makeup_types (name, price, description, sort_order) VALUES (?, ?, ?, ?)').run(name, price, description || '', sort_order || 0);
  res.json({ id: result.lastInsertRowid });
});

router.put('/types/:id', authMiddleware, adminOnly, (req, res) => {
  const { name, price, description, sort_order, status } = req.body;
  db.prepare('UPDATE makeup_types SET name=COALESCE(?,name), price=COALESCE(?,price), description=COALESCE(?,description), sort_order=COALESCE(?,sort_order), status=COALESCE(?,status) WHERE id=?')
    .run(name, price, description, sort_order, status, req.params.id);
  res.json({ success: true });
});

router.delete('/types/:id', authMiddleware, adminOnly, (req, res) => {
  db.prepare('DELETE FROM makeup_types WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// --- 附加服务 ---
router.get('/extras', authMiddleware, (req, res) => {
  const extras = db.prepare('SELECT * FROM extra_services ORDER BY sort_order ASC, id ASC').all();
  res.json(extras);
});

router.post('/extras', authMiddleware, adminOnly, (req, res) => {
  const { name, price, description, sort_order } = req.body;
  if (!name || price === undefined) return res.status(400).json({ error: '名称和价格必填' });
  const result = db.prepare('INSERT INTO extra_services (name, price, description, sort_order) VALUES (?, ?, ?, ?)').run(name, price, description || '', sort_order || 0);
  res.json({ id: result.lastInsertRowid });
});

router.put('/extras/:id', authMiddleware, adminOnly, (req, res) => {
  const { name, price, description, sort_order } = req.body;
  db.prepare('UPDATE extra_services SET name=COALESCE(?,name), price=COALESCE(?,price), description=COALESCE(?,description), sort_order=COALESCE(?,sort_order) WHERE id=?')
    .run(name, price, description, sort_order, req.params.id);
  res.json({ success: true });
});

router.delete('/extras/:id', authMiddleware, adminOnly, (req, res) => {
  db.prepare('DELETE FROM extra_services WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
