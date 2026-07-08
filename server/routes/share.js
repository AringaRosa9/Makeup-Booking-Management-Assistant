const express = require('express');
const db = require('../db');
const { authMiddleware, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/config', authMiddleware, adminOnly, (req, res) => {
  const config = db.prepare('SELECT * FROM share_config LIMIT 1').get();
  res.json(config || { title: '接妆管理助手', description: '专业化妆师，欢迎预约' });
});

router.put('/config', authMiddleware, adminOnly, (req, res) => {
  const { title, description } = req.body;
  const existing = db.prepare('SELECT id FROM share_config LIMIT 1').get();
  if (existing) {
    db.prepare('UPDATE share_config SET title=COALESCE(?,title), description=COALESCE(?,description), updated_at=CURRENT_TIMESTAMP WHERE id=?')
      .run(title, description, existing.id);
  } else {
    db.prepare('INSERT INTO share_config (title, description) VALUES (?, ?)').run(title || '接妆管理助手', description || '');
  }
  res.json({ success: true });
});

router.get('/public', (req, res) => {
  const config = db.prepare('SELECT title, description FROM share_config LIMIT 1').get();
  const types = db.prepare("SELECT id, name, price, description FROM makeup_types WHERE status = 'active' ORDER BY sort_order ASC, id ASC").all();
  const extras = db.prepare('SELECT id, name, price, description FROM extra_services ORDER BY sort_order ASC, id ASC').all();
  const portfolio = db.prepare('SELECT p.id, p.image_path, p.description, m.name as makeup_type_name FROM portfolio p LEFT JOIN makeup_types m ON p.makeup_type_id = m.id ORDER BY p.sort_order ASC, p.created_at DESC').all();
  const reviews = db.prepare(`SELECT r.rating, r.content, r.created_at, u.nickname, m.name as makeup_name
    FROM reviews r JOIN users u ON r.user_id = u.id JOIN appointments a ON r.appointment_id = a.id JOIN makeup_types m ON a.makeup_type_id = m.id
    WHERE r.is_public = 1 ORDER BY r.created_at DESC LIMIT 10`).all();
  const reviewStats = db.prepare('SELECT COUNT(*) as total, ROUND(AVG(rating), 1) as avg_rating FROM reviews WHERE is_public = 1').get();

  res.json({ config, types, extras, portfolio, reviews, review_stats: reviewStats });
});

module.exports = router;
