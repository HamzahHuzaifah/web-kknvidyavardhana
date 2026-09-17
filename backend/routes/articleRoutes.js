const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { verifyToken, isAdmin } = require('../middleware/auth');
const { uploadFields, generateSlug, registerMediaFile } = require('../utils/fileHelper');

// API: Get all articles (supports category filter)
router.get('/articles', async (req, res) => {
  try {
    const { category } = req.query;
    let query = 'SELECT * FROM articles';
    let params = [];

    if (category && category !== 'all') {
      query += ' WHERE category = ?';
      params.push(category);
    }

    query += ' ORDER BY created_at DESC';

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal memuat artikel.' });
  }
});

// API: Get single article by slug
router.get('/articles/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const [rows] = await pool.query('SELECT * FROM articles WHERE slug = ?', [slug]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Artikel atau publikasi tidak ditemukan.' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal memuat artikel.' });
  }
});

// API: Track view counter for article
router.post('/articles/:id/view', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE articles SET views_count = views_count + 1 WHERE id = ?', [id]);
    const [rows] = await pool.query('SELECT views_count FROM articles WHERE id = ?', [id]);
    res.json({ views_count: rows[0]?.views_count || 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal mencatat pembaca.' });
  }
});

// API: Track download counter for publication PDF
router.post('/articles/:id/download', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE articles SET downloads_count = downloads_count + 1 WHERE id = ?', [id]);
    const [rows] = await pool.query('SELECT downloads_count FROM articles WHERE id = ?', [id]);
    res.json({ downloads_count: rows[0]?.downloads_count || 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal mencatat unduhan.' });
  }
});

// API: Create new article / publication / module (User & Admin)
router.post('/articles', verifyToken, uploadFields, async (req, res) => {
  try {
    const { 
      title, 
      content, 
      category, 
      abstract, 
      keywords, 
      authors_meta, 
      doi_or_reg,
      publisher,
      references_list,
      volume,
      issue,
      published_date
    } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Judul dan isi konten wajib diisi.' });
    }

    const validCategory = ['berita', 'publikasi', 'modul'].includes(category) ? category : 'berita';

    // Fetch user permissions
    const [userRows] = await pool.query('SELECT role, can_upload_berita, can_upload_publikasi, can_upload_modul FROM users WHERE id = ?', [req.userId]);
    const user = userRows[0];
    
    if (user && user.role !== 'admin') {
       if (validCategory === 'berita' && !user.can_upload_berita) return res.status(403).json({ error: 'Anda tidak memiliki hak akses untuk mengupload Berita.' });
       if (validCategory === 'publikasi' && !user.can_upload_publikasi) return res.status(403).json({ error: 'Anda tidak memiliki hak akses untuk mengupload Publikasi Ilmiah.' });
       if (validCategory === 'modul' && !user.can_upload_modul) return res.status(403).json({ error: 'Anda tidak memiliki hak akses untuk mengupload Modul.' });
    }

    const slug = generateSlug(title) + '-' + Date.now().toString().slice(-4);

    let imageUrl = req.files && req.files['image'] ? `/uploads/${req.files['image'][0].filename}` : (req.body.image_url || null);
    let fileUrl = req.files && req.files['document'] ? `/uploads/${req.files['document'][0].filename}` : (req.body.file_url || null);
    const authorName = req.username || 'Anggota KKN';

    // Auto-register uploaded files to Media Library
    if (req.files && req.files['image']) {
      await registerMediaFile(req.files['image'][0], authorName, 'article');
    }
    if (req.files && req.files['document']) {
      await registerMediaFile(req.files['document'][0], authorName, 'article');
    }

    const [result] = await pool.query(
      `INSERT INTO articles 
       (title, slug, category, content, image_url, file_url, author_id, author_name, abstract, keywords, authors_meta, doi_or_reg, publisher, references_list, volume, issue, published_date) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title, 
        slug, 
        validCategory, 
        content, 
        imageUrl, 
        fileUrl, 
        req.userId, 
        authorName,
        abstract || null,
        keywords || null,
        authors_meta || null,
        doi_or_reg || null,
        publisher || 'KKN Vidya Vardhana',
        references_list || null,
        volume ? parseInt(volume) : null,
        issue ? parseInt(issue) : null,
        published_date || null
      ]
    );

    res.status(201).json({
      id: result.insertId,
      title,
      slug,
      category: validCategory,
      content,
      imageUrl,
      fileUrl,
      authorName,
      message: `${validCategory.toUpperCase()} berhasil dipublikasikan!`
    });
  } catch (err) {
    console.error(err);
    if (err.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Judul sudah digunakan. Silakan gunakan judul lain.' });
    } else {
      res.status(500).json({ error: 'Gagal mempublikasikan konten.' });
    }
  }
});

// API: Update article (Admin Only)
router.put('/articles/:id', verifyToken, isAdmin, uploadFields, async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      title, 
      content, 
      category,
      abstract,
      keywords,
      authors_meta,
      doi_or_reg,
      publisher,
      references_list,
      volume,
      issue,
      published_date
    } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Judul dan isi konten wajib diisi.' });
    }

    const validCategory = ['berita', 'publikasi', 'modul'].includes(category) ? category : 'berita';

    let query = `UPDATE articles SET 
      title = ?, 
      category = ?, 
      content = ?,
      abstract = ?,
      keywords = ?,
      authors_meta = ?,
      doi_or_reg = ?,
      publisher = ?,
      references_list = ?,
      volume = ?,
      issue = ?,
      published_date = ?`;
    let params = [
      title, 
      validCategory, 
      content, 
      abstract || null, 
      keywords || null, 
      authors_meta || null, 
      doi_or_reg || null,
      publisher || 'KKN Vidya Vardhana',
      references_list || null,
      volume ? parseInt(volume) : null,
      issue ? parseInt(issue) : null,
      published_date || null
    ];

    if (req.files && req.files['image']) {
      query += ', image_url = ?';
      const imgPath = `/uploads/${req.files['image'][0].filename}`;
      params.push(imgPath);
      await registerMediaFile(req.files['image'][0], req.username || 'Admin', 'article');
    } else if (req.body.image_url !== undefined) {
      query += ', image_url = ?';
      params.push(req.body.image_url || null);
    }

    if (req.files && req.files['document']) {
      query += ', file_url = ?';
      const docPath = `/uploads/${req.files['document'][0].filename}`;
      params.push(docPath);
      await registerMediaFile(req.files['document'][0], req.username || 'Admin', 'article');
    } else if (req.body.file_url !== undefined) {
      query += ', file_url = ?';
      params.push(req.body.file_url || null);
    }

    query += ' WHERE id = ?';
    params.push(id);

    await pool.query(query, params);
    res.json({ message: 'Konten berhasil diperbarui oleh Admin!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal memperbarui konten.' });
  }
});

// API: Delete article (Admin Only)
router.delete('/articles/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM articles WHERE id = ?', [id]);
    res.json({ message: 'Konten berhasil dihapus.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal menghapus konten.' });
  }
});

module.exports = router;
