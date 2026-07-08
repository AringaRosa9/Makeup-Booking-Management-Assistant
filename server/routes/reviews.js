const express = require('express');
const db = require('../db');
const { authMiddleware, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.post('/', authMiddleware, (req, res) => {
  const { appointment_id, rating, content } = req.body;
  if (!appointment_id || !rating) return res.status(400).json({ error: '预约ID和评分必填' });
  if (rating < 1 || rating > 5) return res.status(400).json({ error: '评分范围1-5' });

  const appointment = db.prepare(
    'SELECT * FROM appointments WHERE id = ? AND user_id = ? AND status = ?'
  ).get(appointment_id, req.user.id, 'completed');
  if (!appointment) return res.status(400).json({ error: '只能评价已完成的预约' });

  const existing = db.prepare('SELECT id FROM reviews WHERE appointment_id = ?').get(appointment_id);
  if (existing) return res.status(400).json({ error: '已评价过该预约' });

  const result = db.prepare(
    'INSERT INTO reviews (appointment_id, user_id, rating, content) VALUES (?, ?, ?, ?)'
  ).run(appointment_id, req.user.id, rating, content || '');
  res.json({ id: result.lastInsertRowid });
});

router.get('/', authMiddleware, (req, res) => {
  const { makeup_type_id, public_only } = req.query;
  let sql = `SELECT r.*, u.nickname, a.total_price, m.name as makeup_name,
             d.date, s.start_time
             FROM reviews r
             JOIN appointments a ON r.appointment_id = a.id
             JOIN users u ON r.user_id = u.id
             JOIN makeup_types m ON a.makeup_type_id = m.id
             JOIN available_slots s ON a.slot_id = s.id
             JOIN available_dates d ON s.date_id = d.id
             WHERE 1=1`;
  const params = [];

  if (public_only === '1') {
    sql += ' AND r.is_public = 1';
  }
  if (makeup_type_id) {
    sql += ' AND a.makeup_type_id = ?';
    params.push(makeup_type_id);
  }
  sql += ' ORDER BY r.created_at DESC';
  res.json(db.prepare(sql).all(...params));
});

router.get('/stats', authMiddleware, (req, res) => {
  const stats = db.prepare(
    'SELECT COUNT(*) as total, ROUND(AVG(rating), 1) as avg_rating FROM reviews'
  ).get();
  const distribution = db.prepare(
    'SELECT rating, COUNT(*) as count FROM reviews GROUP BY rating ORDER BY rating DESC'
  ).all();
  res.json({ ...stats, distribution });
});

router.put('/:id/visibility', authMiddleware, adminOnly, (req, res) => {
  const { is_public } = req.body;
  db.prepare('UPDATE reviews SET is_public = ? WHERE id = ?').run(is_public ? 1 : 0, req.params.id);
  res.json({ success: true });
});

module.exports = router;
