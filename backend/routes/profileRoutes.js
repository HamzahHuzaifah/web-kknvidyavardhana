const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { verifyToken, isAdmin } = require('../middleware/auth');
const { upload, registerMediaFile, generateSlug } = require('../utils/fileHelper');

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
    const { user_id, name, role, major, display_order } = req.body;
    if (!user_id || !name || !role) {
      return res.status(400).json({ error: 'Akun terdaftar, Nama, dan Jabatan wajib diisi.' });
    }

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const orderNum = parseInt(display_order) || 0;

    if (req.file) {
      await registerMediaFile(req.file, req.username || 'Admin', 'team');
    }

    let slug = generateSlug(name);
    let isUnique = false;
    let counter = 1;
    while (!isUnique) {
      const [existing] = await pool.query('SELECT id FROM team_members WHERE slug = ?', [slug]);
      if (existing.length === 0) {
        isUnique = true;
      } else {
        slug = `${generateSlug(name)}-${counter}`;
        counter++;
      }
    }

    const [result] = await pool.query(
      'INSERT INTO team_members (user_id, name, slug, role, major, image_url, display_order) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [user_id, name, slug, role, major || '', imageUrl, orderNum]
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

// API: Get Own Profile (User)
router.get('/team/me', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM team_members WHERE user_id = ?', [req.userId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Profil tim belum tersedia untuk akun ini.' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal memuat profil tim Anda.' });
  }
});

// API: Update Own Profile (User)
router.post('/team/me/edit', verifyToken, upload.single('image'), async (req, res) => {
  try {
    // Check permission
    const [userRows] = await pool.query('SELECT can_edit_profile FROM users WHERE id = ?', [req.userId]);
    if (userRows.length === 0 || (!userRows[0].can_edit_profile && req.userRole !== 'admin')) {
      return res.status(403).json({ error: 'Anda tidak memiliki izin untuk mengedit profil tim.' });
    }

    const { 
      name, role, major, 
      greeting, about_me, 
      portfolio_projects, skills_experience, testimonials, 
      contact_email, contact_phone, social_links 
    } = req.body;
    
    if (!name || !role) {
      return res.status(400).json({ error: 'Nama dan peran/jabatan wajib diisi.' });
    }

    // Check if team member exists for this user
    const [teamRows] = await pool.query('SELECT id FROM team_members WHERE user_id = ?', [req.userId]);
    if (teamRows.length === 0) {
      return res.status(404).json({ error: 'Profil tim Anda belum dibuat oleh Admin.' });
    }

    const teamId = teamRows[0].id;

    let slug = generateSlug(name);
    let isUnique = false;
    let counter = 1;
    while (!isUnique) {
      const [existing] = await pool.query('SELECT id FROM team_members WHERE slug = ? AND id != ?', [slug, teamId]);
      if (existing.length === 0) {
        isUnique = true;
      } else {
        slug = `${generateSlug(name)}-${counter}`;
        counter++;
      }
    }

    const queryParams = [
      name, slug, role, major || '', 
      greeting || '', about_me || '', 
      portfolio_projects || '[]', skills_experience || '[]', testimonials || '[]',
      contact_email || '', contact_phone || '', social_links || '[]'
    ];

    if (req.file) {
      const imageUrl = `/uploads/${req.file.filename}`;
      await registerMediaFile(req.file, req.username || 'User', 'team');
      await pool.query(
        `UPDATE team_members SET 
          name = ?, slug = ?, role = ?, major = ?, 
          greeting = ?, about_me = ?, 
          portfolio_projects = ?, skills_experience = ?, testimonials = ?,
          contact_email = ?, contact_phone = ?, social_links = ?,
          image_url = ? WHERE id = ?`,
        [...queryParams, imageUrl, teamId]
      );
    } else {
      await pool.query(
        `UPDATE team_members SET 
          name = ?, slug = ?, role = ?, major = ?, 
          greeting = ?, about_me = ?, 
          portfolio_projects = ?, skills_experience = ?, testimonials = ?,
          contact_email = ?, contact_phone = ?, social_links = ?
          WHERE id = ?`,
        [...queryParams, teamId]
      );
    }

    res.json({ message: 'Profil Anda berhasil diperbarui!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal memperbarui profil tim Anda.' });
  }
});

// API: Update Team Member (Admin Only)
router.post('/team/:id/edit', verifyToken, isAdmin, upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, name, role, major, display_order } = req.body;

    if (!user_id || !name || !role) {
      return res.status(400).json({ error: 'Akun terdaftar, Nama, dan Jabatan wajib diisi.' });
    }

    const orderNum = parseInt(display_order) || 0;

    let slug = generateSlug(name);
    let isUnique = false;
    let counter = 1;
    while (!isUnique) {
      const [existing] = await pool.query('SELECT id FROM team_members WHERE slug = ? AND id != ?', [slug, id]);
      if (existing.length === 0) {
        isUnique = true;
      } else {
        slug = `${generateSlug(name)}-${counter}`;
        counter++;
      }
    }

    if (req.file) {
      const imageUrl = `/uploads/${req.file.filename}`;
      await registerMediaFile(req.file, req.username || 'Admin', 'team');
      await pool.query(
        'UPDATE team_members SET user_id = ?, name = ?, slug = ?, role = ?, major = ?, image_url = ?, display_order = ? WHERE id = ?',
        [user_id, name, slug, role, major || '', imageUrl, orderNum, id]
      );
    } else {
      await pool.query(
        'UPDATE team_members SET user_id = ?, name = ?, slug = ?, role = ?, major = ?, display_order = ? WHERE id = ?',
        [user_id, name, slug, role, major || '', orderNum, id]
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


// API: Get Team Member Portfolio (Public)
router.get('/team/:slug/portfolio', async (req, res) => {
  try {
    const { slug } = req.params;
    const [rows] = await pool.query('SELECT * FROM team_members WHERE slug = ? OR id = ?', [slug, slug]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Profil anggota tidak ditemukan.' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal memuat profil anggota.' });
  }
});

module.exports = router;
