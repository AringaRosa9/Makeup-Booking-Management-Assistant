const express = require('express');
const cors = require('cors');
const path = require('path');
require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/notices', require('./routes/notices'));
app.use('/api/makeup', require('./routes/makeup'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/income', require('./routes/income'));
app.use('/api/portfolio', require('./routes/portfolio'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/share', require('./routes/share'));

app.use((err, req, res, next) => {
  if (err.name === 'MulterError') {
    return res.status(400).json({ error: '文件上传失败：' + err.message });
  }
  console.error(err);
  res.status(500).json({ error: '服务器错误' });
});

app.listen(PORT, () => console.log(`服务已启动: http://localhost:${PORT}`));
