const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { verifyToken, isAdmin } = require('../middleware/auth');
const { upload, registerMediaFile } = require('../utils/fileHelper');

// API: Get Profile Info (Public)
router.get('/profile-info', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM profile_info WHERE id = 1');
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Data profil belum tersedia.' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal memuat profil desa & tim.' });
  }
});

// API: Update Profile Info (Admin Only)
router.post('/profile-info/edit', verifyToken, isAdmin, async (req, res) => {
  try {
    const {
      about_title,
      about_description,
      vision,
      mission,
      village_name,
      village_description,
      village_population,
      village_rtrw,
      village_area,
      village_map_iframe,
      village_map_label,
      logo_url,
      jumbotron_animation
    } = req.body;

    if (logo_url !== undefined) {
      await pool.query(`
        UPDATE profile_info SET
          about_title = ?,
          about_description = ?,
          vision = ?,
          mission = ?,
          village_name = ?,
          village_description = ?,
          village_population = ?,
          village_rtrw = ?,
          village_area = ?,
          village_map_iframe = ?,
          village_map_label = ?,
          logo_url = ?,
          jumbotron_animation = ?
        WHERE id = 1
      `, [
        about_title,
        about_description,
        vision,
        mission,
        village_name,
        village_description,
        village_population,
        village_rtrw,
        village_area,
        village_map_iframe,
        village_map_label,
        logo_url,
        jumbotron_animation || 'fade'
      ]);
    } else {
      await pool.query(`
        UPDATE profile_info SET
          about_title = ?,
          about_description = ?,
          vision = ?,
          mission = ?,
          village_name = ?,
          village_description = ?,
          village_population = ?,
          village_rtrw = ?,
          village_area = ?,
          village_map_iframe = ?,
          village_map_label = ?,
          jumbotron_animation = ?
        WHERE id = 1
      `, [
        about_title,
        about_description,
        vision,
        mission,
        village_name,
        village_description,
        village_population,
        village_rtrw,
        village_area,
        village_map_iframe,
        village_map_label,
        jumbotron_animation || 'fade'
      ]);
    }

    res.json({ message: 'Profil Desa & Tentang Kami berhasil diperbarui!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal memperbarui data profil.' });
  }
});

// API: Get Team Members (Public)
router.get('/team', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM team_members ORDER BY display_order ASC, id ASC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal memuat daftar anggota tim.' });
  }
});

// API: Add Team Member (Admin Only)
router.post('/team', verifyToken, isAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, role, major, display_order } = req.body;
    if (!name || !role) {
      return res.status(400).json({ error: 'Nama dan peran/jabatan wajib diisi.' });
    }

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const orderNum = parseInt(display_order) || 0;

    if (req.file) {
      await registerMediaFile(req.file, req.username || 'Admin', 'team');
    }

    const [result] = await pool.query(
      'INSERT INTO team_members (name, role, major, image_url, display_order) VALUES (?, ?, ?, ?, ?)',
      [name, role, major || '', imageUrl, orderNum]
    );

    res.status(201).json({
      message: 'Anggota tim berhasil ditambahkan!',
      id: result.insertId,
      name,
      role,
      major,
      image_url: imageUrl,
      display_order: orderNum
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal menambahkan anggota tim.' });
  }
});

// API: Update Team Member (Admin Only)
router.post('/team/:id/edit', verifyToken, isAdmin, upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, major, display_order } = req.body;

    if (!name || !role) {
      return res.status(400).json({ error: 'Nama dan peran/jabatan wajib diisi.' });
    }

    const orderNum = parseInt(display_order) || 0;

    if (req.file) {
      const imageUrl = `/uploads/${req.file.filename}`;
      await registerMediaFile(req.file, req.username || 'Admin', 'team');
      await pool.query(
        'UPDATE team_members SET name = ?, role = ?, major = ?, image_url = ?, display_order = ? WHERE id = ?',
        [name, role, major || '', imageUrl, orderNum, id]
      );
    } else {
      await pool.query(
        'UPDATE team_members SET name = ?, role = ?, major = ?, display_order = ? WHERE id = ?',
        [name, role, major || '', orderNum, id]
      );
    }

    res.json({ message: 'Data anggota tim berhasil diperbarui!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal memperbarui anggota tim.' });
  }
});

// API: Delete Team Member (Admin Only)
router.post('/team/:id/delete', verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM team_members WHERE id = ?', [id]);
    res.json({ message: 'Anggota tim berhasil dihapus.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal menghapus anggota tim.' });
  }
});

module.exports = router;
