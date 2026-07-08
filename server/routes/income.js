const express = require('express');
const db = require('../db');
const { authMiddleware, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/summary', authMiddleware, adminOnly, (req, res) => {
  const month = req.query.month || new Date().toISOString().slice(0, 7);

  const confirmed = db.prepare(`
    SELECT COALESCE(SUM(a.total_price), 0) as total FROM appointments a
    JOIN available_slots s ON a.slot_id = s.id
    JOIN available_dates d ON s.date_id = d.id
    WHERE d.date LIKE ? AND a.status = 'confirmed'
  `).get(`${month}%`);

  const completed = db.prepare(`
    SELECT COALESCE(SUM(a.total_price), 0) as total FROM appointments a
    JOIN available_slots s ON a.slot_id = s.id
    JOIN available_dates d ON s.date_id = d.id
    WHERE d.date LIKE ? AND a.status = 'completed'
  `).get(`${month}%`);

  const manual = db.prepare(`
    SELECT COALESCE(SUM(amount), 0) as total FROM manual_income WHERE date LIKE ?
  `).get(`${month}%`);

  const appointmentCount = db.prepare(`
    SELECT COUNT(*) as count FROM appointments a
    JOIN available_slots s ON a.slot_id = s.id
    JOIN available_dates d ON s.date_id = d.id
    WHERE d.date LIKE ? AND a.status IN ('confirmed', 'completed')
  `).get(`${month}%`);

  const cancelledCount = db.prepare(`
    SELECT COUNT(*) as count FROM appointments a
    JOIN available_slots s ON a.slot_id = s.id
    JOIN available_dates d ON s.date_id = d.id
    WHERE d.date LIKE ? AND a.status = 'cancelled'
  `).get(`${month}%`);

  res.json({
    month,
    expected_income: confirmed.total + completed.total,
    completed_income: completed.total,
    manual_income: manual.total,
    total_income: completed.total + manual.total,
    appointment_count: appointmentCount.count,
    cancelled_count: cancelledCount.count
  });
});

router.get('/details', authMiddleware, adminOnly, (req, res) => {
  const month = req.query.month || new Date().toISOString().slice(0, 7);

  const appointments = db.prepare(`
    SELECT a.id, a.total_price, a.status, a.created_at, d.date, s.start_time, s.end_time,
           u.nickname, m.name as makeup_name
    FROM appointments a
    JOIN users u ON a.user_id = u.id
    JOIN makeup_types m ON a.makeup_type_id = m.id
    JOIN available_slots s ON a.slot_id = s.id
    JOIN available_dates d ON s.date_id = d.id
    WHERE d.date LIKE ? AND a.status IN ('confirmed', 'completed')
    ORDER BY d.date ASC, s.start_time ASC
  `).all(`${month}%`);

  const manualRecords = db.prepare(
    'SELECT * FROM manual_income WHERE date LIKE ? ORDER BY date ASC'
  ).all(`${month}%`);

  res.json({ appointments, manual_records: manualRecords });
});

router.get('/stats', authMiddleware, adminOnly, (req, res) => {
  // 各妆型占比
  const typeStats = db.prepare(`
    SELECT m.name, COUNT(*) as count, SUM(a.total_price) as total
    FROM appointments a JOIN makeup_types m ON a.makeup_type_id = m.id
    WHERE a.status IN ('confirmed', 'completed')
    GROUP BY m.name
  `).all();

  // 近6个月收入趋势
  const trendSql = `
    SELECT substr(d.date, 1, 7) as month, SUM(a.total_price) as total
    FROM appointments a
    JOIN available_slots s ON a.slot_id = s.id
    JOIN available_dates d ON s.date_id = d.id
    WHERE a.status IN ('confirmed', 'completed') AND d.date >= date('now', '-6 months')
    GROUP BY month ORDER BY month
  `;
  const trend = db.prepare(trendSql).all();

  res.json({ type_stats: typeStats, trend });
});

// 手动记账
router.post('/manual', authMiddleware, adminOnly, (req, res) => {
  const { date, client_name, makeup_type, amount, notes } = req.body;
  if (!date || !amount) return res.status(400).json({ error: '日期和金额必填' });
  const result = db.prepare(
    'INSERT INTO manual_income (date, client_name, makeup_type, amount, notes) VALUES (?, ?, ?, ?, ?)'
  ).run(date, client_name || '', makeup_type || '', amount, notes || '');
  res.json({ id: result.lastInsertRowid });
});

router.delete('/manual/:id', authMiddleware, adminOnly, (req, res) => {
  db.prepare('DELETE FROM manual_income WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
