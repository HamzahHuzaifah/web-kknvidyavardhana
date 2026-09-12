const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { verifyToken } = require('../middleware/auth');

// API: Submit Attendance (Protected)
router.post('/attendance', verifyToken, async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Data koordinat lokasi (latitude & longitude) wajib disertakan.' });
    }

    await pool.query(
      'INSERT INTO attendance (user_id, latitude, longitude) VALUES (?, ?, ?)',
      [req.userId, latitude, longitude]
    );

    res.status(201).json({ message: 'Presensi kehadiran berhasil dicatat!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal mencatat presensi.' });
  }
});

// API: Get Attendance History (Protected)
router.get('/attendance', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT a.*, u.username 
      FROM attendance a 
      JOIN users u ON a.user_id = u.id 
      ORDER BY a.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal memuat riwayat presensi.' });
  }
});

module.exports = router;
