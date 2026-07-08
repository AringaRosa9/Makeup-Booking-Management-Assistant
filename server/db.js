const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const db = new Database(path.join(__dirname, '..', 'data.db'));

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phone TEXT UNIQUE NOT NULL,
    nickname TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'client',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS notices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL DEFAULT '',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS makeup_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    description TEXT DEFAULT '',
    sort_order INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS extra_services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    description TEXT DEFAULT '',
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS available_dates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT UNIQUE NOT NULL
  );

  CREATE TABLE IF NOT EXISTS available_slots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date_id INTEGER NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    max_capacity INTEGER DEFAULT 1,
    FOREIGN KEY (date_id) REFERENCES available_dates(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    slot_id INTEGER NOT NULL,
    makeup_type_id INTEGER NOT NULL,
    contact_phone TEXT NOT NULL,
    contact_wechat TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    status TEXT DEFAULT 'pending',
    total_price REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (slot_id) REFERENCES available_slots(id),
    FOREIGN KEY (makeup_type_id) REFERENCES makeup_types(id)
  );

  CREATE TABLE IF NOT EXISTS appointment_extras (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    appointment_id INTEGER NOT NULL,
    extra_service_id INTEGER NOT NULL,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
    FOREIGN KEY (extra_service_id) REFERENCES extra_services(id)
  );

  CREATE TABLE IF NOT EXISTS appointment_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    appointment_id INTEGER NOT NULL,
    image_path TEXT NOT NULL,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS manual_income (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    client_name TEXT DEFAULT '',
    makeup_type TEXT DEFAULT '',
    amount REAL NOT NULL,
    notes TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

const noticeExists = db.prepare('SELECT COUNT(*) as count FROM notices').get();
if (noticeExists.count === 0) {
  db.prepare('INSERT INTO notices (content) VALUES (?)').run('欢迎使用接妆管理助手！请仔细阅读注意事项。');
}

const adminExists = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'admin'").get();
if (adminExists.count === 0) {
  const hash = bcrypt.hashSync('admin123456', 10);
  db.prepare("INSERT INTO users (phone, nickname, password_hash, role) VALUES (?, ?, ?, 'admin')").run('admin', '化妆师', hash);
}

module.exports = db;
