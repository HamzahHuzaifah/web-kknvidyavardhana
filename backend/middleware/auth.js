const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'kkn_vidyavardhana_secret_key_123';

const verifyToken = async (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).json({ error: 'No token provided.' });

  const bearerToken = token.split(' ')[1] || token;

  try {
    const decoded = jwt.verify(bearerToken, JWT_SECRET);
    req.userId = decoded.id;
    req.userRole = decoded.role;
    req.username = decoded.username;

    // Check if token matches the active session token in DB
    const [rows] = await pool.query('SELECT active_token FROM users WHERE id = ?', [req.userId]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Pengguna tidak ditemukan.' });
    }

    const user = rows[0];
    // If active_token is null or different, it means they logged out or logged in elsewhere
    if (user.active_token !== bearerToken) {
      return res.status(401).json({ error: 'Sesi berakhir karena Anda telah logout atau login di perangkat lain.' });
    }

    // Update last_active (asynchronous fire-and-forget so it doesn't block request)
    pool.query('UPDATE users SET last_active = NOW() WHERE id = ?', [req.userId]).catch((err) => console.error('Error updating last_active:', err));

    next();
  } catch (err) {
    return res.status(401).json({ error: 'Gagal memverifikasi token.' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ error: 'Akses ditolak: Hanya Admin yang diizinkan.' });
  }
  next();
};

module.exports = { verifyToken, isAdmin, JWT_SECRET };
