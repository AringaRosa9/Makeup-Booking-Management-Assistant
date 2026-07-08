const express = require('express');
const multer = require('multer');
const path = require('path');
const db = require('../db');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const { createNotification } = require('./notifications');

const router = express.Router();

const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', 'uploads'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (/\.(jpg|jpeg|png|webp)$/i.test(file.originalname)) cb(null, true);
    else cb(new Error('只支持 jpg/png/webp 格式'));
  }
});

// --- 可约日期管理（管理员） ---
router.get('/available-dates', authMiddleware, (req, res) => {
  const { month } = req.query;
  let dates;
  if (month) {
    dates = db.prepare("SELECT * FROM available_dates WHERE date LIKE ? ORDER BY date").all(`${month}%`);
  } else {
    dates = db.prepare("SELECT * FROM available_dates WHERE date >= date('now') ORDER BY date").all();
  }
  const result = dates.map(d => {
    const slots = db.prepare('SELECT * FROM available_slots WHERE date_id = ? ORDER BY start_time').all(d.id);
    const slotsWithBookings = slots.map(s => {
      const booked = db.prepare("SELECT COUNT(*) as count FROM appointments WHERE slot_id = ? AND status IN ('pending','confirmed')").get(s.id);
      return { ...s, booked_count: booked.count };
    });
    return { ...d, slots: slotsWithBookings };
  });
  res.json(result);
});

router.post('/available-dates', authMiddleware, adminOnly, (req, res) => {
  const { date, slots } = req.body;
  if (!date || !slots || !slots.length) return res.status(400).json({ error: '请选择日期和时间段' });

  const insertDate = db.prepare('INSERT OR IGNORE INTO available_dates (date) VALUES (?)');
  const getDate = db.prepare('SELECT id FROM available_dates WHERE date = ?');
  const deleteSlots = db.prepare('DELETE FROM available_slots WHERE date_id = ?');
  const insertSlot = db.prepare('INSERT INTO available_slots (date_id, start_time, end_time, max_capacity) VALUES (?, ?, ?, ?)');

  const transaction = db.transaction(() => {
    insertDate.run(date);
    const dateRow = getDate.get(date);
    deleteSlots.run(dateRow.id);
    for (const slot of slots) {
      insertSlot.run(dateRow.id, slot.start_time, slot.end_time, slot.max_capacity || 1);
    }
    return dateRow.id;
  });

  const dateId = transaction();
  res.json({ success: true, dateId });
});

router.delete('/available-dates/:date', authMiddleware, adminOnly, (req, res) => {
  const dateRow = db.prepare('SELECT id FROM available_dates WHERE date = ?').get(req.params.date);
  if (!dateRow) return res.status(404).json({ error: '日期不存在' });
  const hasBookings = db.prepare("SELECT COUNT(*) as count FROM appointments a JOIN available_slots s ON a.slot_id = s.id WHERE s.date_id = ? AND a.status IN ('pending','confirmed')").get(dateRow.id);
  if (hasBookings.count > 0) return res.status(400).json({ error: '该日期下有预约，无法删除' });
  db.prepare('DELETE FROM available_dates WHERE id = ?').run(dateRow.id);
  res.json({ success: true });
});

// --- 预约（客户） ---
router.post('/', authMiddleware, upload.array('images', 6), (req, res) => {
  const { slot_id, makeup_type_id, extra_service_ids, contact_phone, contact_wechat, notes } = req.body;
  if (!slot_id || !makeup_type_id || !contact_phone) {
    return res.status(400).json({ error: '请填写完整预约信息' });
  }

  const slot = db.prepare('SELECT * FROM available_slots WHERE id = ?').get(slot_id);
  if (!slot) return res.status(400).json({ error: '时间段不存在' });

  const bookedCount = db.prepare("SELECT COUNT(*) as count FROM appointments WHERE slot_id = ? AND status IN ('pending','confirmed')").get(slot_id);
  if (bookedCount.count >= slot.max_capacity) {
    return res.status(400).json({ error: '该时间段已约满' });
  }

  const makeupType = db.prepare('SELECT * FROM makeup_types WHERE id = ?').get(makeup_type_id);
  if (!makeupType) return res.status(400).json({ error: '妆型不存在' });

  let totalPrice = makeupType.price;
  const extraIds = extra_service_ids ? JSON.parse(extra_service_ids) : [];
  for (const eid of extraIds) {
    const extra = db.prepare('SELECT price FROM extra_services WHERE id = ?').get(eid);
    if (extra) totalPrice += extra.price;
  }

  const transaction = db.transaction(() => {
    const result = db.prepare(
      'INSERT INTO appointments (user_id, slot_id, makeup_type_id, contact_phone, contact_wechat, notes, total_price) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(req.user.id, slot_id, makeup_type_id, contact_phone, contact_wechat || '', notes || '', totalPrice);

    const appointmentId = result.lastInsertRowid;

    for (const eid of extraIds) {
      db.prepare('INSERT INTO appointment_extras (appointment_id, extra_service_id) VALUES (?, ?)').run(appointmentId, eid);
    }

    if (req.files) {
      for (const file of req.files) {
        db.prepare('INSERT INTO appointment_images (appointment_id, image_path) VALUES (?, ?)').run(appointmentId, file.filename);
      }
    }

    return appointmentId;
  });

  const appointmentId = transaction();

  const admin = db.prepare("SELECT id FROM users WHERE role = 'admin' LIMIT 1").get();
  if (admin) {
    createNotification(admin.id, 'new_appointment', '新预约', `收到新预约，妆型：${makeupType.name}`, appointmentId);
  }

  res.json({ success: true, appointmentId });
});

// 查看预约列表
router.get('/', authMiddleware, (req, res) => {
  const { status, month } = req.query;
  let sql, params;

  if (req.user.role === 'admin') {
    sql = `SELECT a.*, u.nickname, u.phone as user_phone, m.name as makeup_name, m.price as makeup_price,
           s.start_time, s.end_time, d.date
           FROM appointments a
           JOIN users u ON a.user_id = u.id
           JOIN makeup_types m ON a.makeup_type_id = m.id
           JOIN available_slots s ON a.slot_id = s.id
           JOIN available_dates d ON s.date_id = d.id
           WHERE 1=1`;
    params = [];
  } else {
    sql = `SELECT a.*, m.name as makeup_name, m.price as makeup_price,
           s.start_time, s.end_time, d.date
           FROM appointments a
           JOIN makeup_types m ON a.makeup_type_id = m.id
           JOIN available_slots s ON a.slot_id = s.id
           JOIN available_dates d ON s.date_id = d.id
           WHERE a.user_id = ?`;
    params = [req.user.id];
  }

  if (status) { sql += ' AND a.status = ?'; params.push(status); }
  if (month) { sql += ' AND d.date LIKE ?'; params.push(`${month}%`); }
  sql += ' ORDER BY d.date ASC, s.start_time ASC';

  const appointments = db.prepare(sql).all(...params);

  const result = appointments.map(a => {
    const extras = db.prepare(
      'SELECT es.name, es.price FROM appointment_extras ae JOIN extra_services es ON ae.extra_service_id = es.id WHERE ae.appointment_id = ?'
    ).all(a.id);
    const images = db.prepare('SELECT image_path FROM appointment_images WHERE appointment_id = ?').all(a.id);
    return { ...a, extras, images: images.map(i => i.image_path) };
  });

  res.json(result);
});

// 更新预约状态（管理员）
router.put('/:id/status', authMiddleware, adminOnly, (req, res) => {
  const { status } = req.body;
  if (!['confirmed', 'completed', 'cancelled'].includes(status)) {
    return res.status(400).json({ error: '无效的状态' });
  }
  const appointment = db.prepare('SELECT * FROM appointments WHERE id = ?').get(req.params.id);
  db.prepare('UPDATE appointments SET status = ? WHERE id = ?').run(status, req.params.id);

  if (appointment) {
    const statusText = { confirmed: '已确认', completed: '已完成', cancelled: '已取消' };
    createNotification(appointment.user_id, 'status_change', '预约状态更新', `您的预约已${statusText[status]}`, appointment.id);
  }

  res.json({ success: true });
});

// 客户取消预约
router.put('/:id/cancel', authMiddleware, (req, res) => {
  const appointment = db.prepare('SELECT * FROM appointments WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!appointment) return res.status(404).json({ error: '预约不存在' });
  if (appointment.status !== 'pending') return res.status(400).json({ error: '只能取消待确认的预约' });
  db.prepare("UPDATE appointments SET status = 'cancelled' WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
