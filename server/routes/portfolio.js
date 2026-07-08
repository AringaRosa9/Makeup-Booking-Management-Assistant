const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../db');
const { authMiddleware, adminOnly } = require('../middleware/auth');

const router = express.Router();

const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', 'uploads'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `portfolio-${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
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

router.get('/', authMiddleware, (req, res) => {
  const { makeup_type_id } = req.query;
  let sql = 'SELECT p.*, m.name as makeup_type_name FROM portfolio p LEFT JOIN makeup_types m ON p.makeup_type_id = m.id';
  const params = [];
  if (makeup_type_id) {
    sql += ' WHERE p.makeup_type_id = ?';
    params.push(makeup_type_id);
  }
  sql += ' ORDER BY p.sort_order ASC, p.created_at DESC';
  res.json(db.prepare(sql).all(...params));
});

router.post('/', authMiddleware, adminOnly, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: '请上传图片' });
  const { makeup_type_id, description, sort_order } = req.body;
  const result = db.prepare(
    'INSERT INTO portfolio (makeup_type_id, image_path, description, sort_order) VALUES (?, ?, ?, ?)'
  ).run(makeup_type_id || null, req.file.filename, description || '', sort_order || 0);
  res.json({ id: result.lastInsertRowid });
});

router.put('/:id', authMiddleware, adminOnly, (req, res) => {
  const { makeup_type_id, description, sort_order } = req.body;
  db.prepare(
    'UPDATE portfolio SET makeup_type_id=COALESCE(?,makeup_type_id), description=COALESCE(?,description), sort_order=COALESCE(?,sort_order) WHERE id=?'
  ).run(makeup_type_id, description, sort_order, req.params.id);
  res.json({ success: true });
});

router.delete('/:id', authMiddleware, adminOnly, (req, res) => {
  const item = db.prepare('SELECT image_path FROM portfolio WHERE id = ?').get(req.params.id);
  if (item) {
    const filePath = path.join(__dirname, '..', 'uploads', item.image_path);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
  db.prepare('DELETE FROM portfolio WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
