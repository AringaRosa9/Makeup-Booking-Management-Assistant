const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'makeup-booking-secret-key-2026';

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: '请先登录' });
  }
  try {
    req.user = jwt.verify(header.slice(7), JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: '登录已过期，请重新登录' });
  }
}

function adminOnly(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: '无权限操作' });
  }
  next();
}

module.exports = { authMiddleware, adminOnly, JWT_SECRET };
