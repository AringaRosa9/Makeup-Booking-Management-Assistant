const express = require('express');
const db = require('../db');
const { authMiddleware, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/', authMiddleware, (req, res) => {
  const notice = db.prepare('SELECT * FROM notices ORDER BY id DESC LIMIT 1').get();
  res.json(notice || { content: '' });
});

router.put('/', authMiddleware, adminOnly, (req, res) => {
  const { content } = req.body;
  if (content === undefined) return res.status(400).json({ error: '内容不能为空' });
  const existing = db.prepare('SELECT id FROM notices LIMIT 1').get();
  if (existing) {
    db.prepare('UPDATE notices SET content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(content, existing.id);
  } else {
    db.prepare('INSERT INTO notices (content) VALUES (?)').run(content);
  }
  res.json({ success: true });
});

module.exports = router;
