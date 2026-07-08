const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { JWT_SECRET, authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.post('/register', (req, res) => {
  const { phone, nickname, password } = req.body;
  if (!phone || !nickname || !password) {
    return res.status(400).json({ error: '请填写完整信息' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: '密码至少6位' });
  }
  const existing = db.prepare('SELECT id FROM users WHERE phone = ?').get(phone);
  if (existing) {
    return res.status(400).json({ error: '该手机号已注册' });
  }
  const hash = bcrypt.hashSync(password, 10);
  const result = db.prepare('INSERT INTO users (phone, nickname, password_hash) VALUES (?, ?, ?)').run(phone, nickname, hash);
  const token = jwt.sign({ id: result.lastInsertRowid, phone, nickname, role: 'client' }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: result.lastInsertRowid, phone, nickname, role: 'client' } });
});

router.post('/login', (req, res) => {
  const { phone, password } = req.body;
  if (!phone || !password) {
    return res.status(400).json({ error: '请填写手机号和密码' });
  }
  const user = db.prepare('SELECT * FROM users WHERE phone = ?').get(phone);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(400).json({ error: '手机号或密码错误' });
  }
  const token = jwt.sign({ id: user.id, phone: user.phone, nickname: user.nickname, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, phone: user.phone, nickname: user.nickname, role: user.role } });
});

router.get('/me', authMiddleware, (req, res) => {
  const user = db.prepare('SELECT id, phone, nickname, role, created_at FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: '用户不存在' });
  res.json(user);
});

module.exports = router;
