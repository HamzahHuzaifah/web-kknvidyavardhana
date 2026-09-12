const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { verifyToken, isAdmin } = require('../middleware/auth');

// API: Get Media Items (Public)
router.get('/media', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM media_items ORDER BY display_order ASC, id DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal memuat konten media.' });
  }
});

// API: Add Media Item (Admin Only)
router.post('/media', verifyToken, isAdmin, async (req, res) => {
  try {
    const { title, platform, url, caption, is_autoplay, display_order } = req.body;
    if (!title || !platform || !url) {
      return res.status(400).json({ error: 'Judul, platform, dan URL video/media wajib diisi.' });
    }

    const autoplayVal = is_autoplay === 1 || is_autoplay === '1' || is_autoplay === true ? 1 : 0;
    const orderNum = parseInt(display_order) || 0;

    const [result] = await pool.query(
      'INSERT INTO media_items (title, platform, url, caption, is_autoplay, display_order) VALUES (?, ?, ?, ?, ?, ?)',
      [title, platform, url, caption || '', autoplayVal, orderNum]
    );

    res.status(201).json({
      message: 'Media berhasil ditambahkan!',
      id: result.insertId,
      title,
      platform,
      url,
      caption,
      is_autoplay: autoplayVal,
      display_order: orderNum
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal menambahkan media.' });
  }
});

// API: Update Media Item (Admin Only)
router.put('/media/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, platform, url, caption, is_autoplay, display_order } = req.body;

    if (!title || !platform || !url) {
      return res.status(400).json({ error: 'Judul, platform, dan URL video/media wajib diisi.' });
    }

    const autoplayVal = is_autoplay === 1 || is_autoplay === '1' || is_autoplay === true ? 1 : 0;
    const orderNum = parseInt(display_order) || 0;

    await pool.query(
      'UPDATE media_items SET title = ?, platform = ?, url = ?, caption = ?, is_autoplay = ?, display_order = ? WHERE id = ?',
      [title, platform, url, caption || '', autoplayVal, orderNum, id]
    );

    res.json({ message: 'Media berhasil diperbarui!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal memperbarui media.' });
  }
});

// API: Delete Media Item (Admin Only)
router.delete('/media/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM media_items WHERE id = ?', [id]);
    res.json({ message: 'Media berhasil dihapus.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal menghapus media.' });
  }
});

// API: Get Social Links (Public)
router.get('/social-links', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM social_links ORDER BY id ASC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal memuat akun medsos.' });
  }
});

// API: Add Social Link (Admin Only)
router.post('/social-links', verifyToken, isAdmin, async (req, res) => {
  try {
    const { platform, username_handle, url } = req.body;
    if (!platform || !url) {
      return res.status(400).json({ error: 'Platform dan link media sosial wajib diisi.' });
    }

    const [result] = await pool.query(
      'INSERT INTO social_links (platform, username_handle, url) VALUES (?, ?, ?)',
      [platform, username_handle || '', url]
    );

    res.status(201).json({
      message: 'Akun media sosial berhasil ditambahkan!',
      id: result.insertId,
      platform,
      username_handle,
      url
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal menambahkan akun media sosial.' });
  }
});

// API: Delete Social Link (Admin Only)
router.delete('/social-links/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM social_links WHERE id = ?', [id]);
    res.json({ message: 'Akun media sosial berhasil dihapus.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal menghapus akun media sosial.' });
  }
});

module.exports = router;
