const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { verifyToken, isAdmin } = require('../middleware/auth');
const { upload, registerMediaFile } = require('../utils/fileHelper');

// API: Get All Active Jumbotron Slides (Public)
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM jumbotron_slides WHERE is_active = 1 ORDER BY display_order ASC, id ASC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal memuat slide jumbotron.' });
  }
});

// API: Get All Jumbotron Slides (Admin)
router.get('/admin', verifyToken, isAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM jumbotron_slides ORDER BY display_order ASC, id ASC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal memuat daftar slide.' });
  }
});

// API: Create Slide
router.post('/admin', verifyToken, isAdmin, async (req, res) => {
  try {
    const { image_url, title, subtitle, display_order, is_active } = req.body;
    
    if (!image_url) {
      return res.status(400).json({ error: 'URL Gambar wajib diisi.' });
    }

    const [result] = await pool.query(
      'INSERT INTO jumbotron_slides (image_url, title, subtitle, display_order, is_active) VALUES (?, ?, ?, ?, ?)',
      [image_url, title || '', subtitle || '', display_order || 0, is_active === false ? 0 : 1]
    );

    res.status(201).json({ message: 'Slide berhasil ditambahkan.', id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal menambahkan slide.' });
  }
});

// API: Update Slide
router.post('/admin/:id/edit', verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { image_url, title, subtitle, display_order, is_active } = req.body;

    if (!image_url) {
      return res.status(400).json({ error: 'URL Gambar wajib diisi.' });
    }

    await pool.query(
      'UPDATE jumbotron_slides SET image_url = ?, title = ?, subtitle = ?, display_order = ?, is_active = ? WHERE id = ?',
      [image_url, title || '', subtitle || '', display_order || 0, is_active === false ? 0 : 1, id]
    );

    res.json({ message: 'Slide berhasil diperbarui.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal memperbarui slide.' });
  }
});

// API: Delete Slide
router.post('/admin/:id/delete', verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM jumbotron_slides WHERE id = ?', [id]);
    res.json({ message: 'Slide berhasil dihapus.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal menghapus slide.' });
  }
});

module.exports = router;
