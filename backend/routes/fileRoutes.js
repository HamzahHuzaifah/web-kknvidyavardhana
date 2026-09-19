const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');
const { verifyToken, isAdmin } = require('../middleware/auth');
const { uploadDir, upload, registerMediaFile } = require('../utils/fileHelper');

// API: Get all files in Media Library (Admin & Logged In)
router.get('/files', verifyToken, async (req, res) => {
  try {
    const { type, q, source } = req.query;
    let query = 'SELECT * FROM media_files WHERE 1=1';
    const params = [];

    if (type && type !== 'all') {
      query += ' AND file_type = ?';
      params.push(type);
    }

    if (source && source !== 'all') {
      query += ' AND source = ?';
      params.push(source);
    }

    if (q && q.trim()) {
      query += ' AND (original_name LIKE ? OR filename LIKE ?)';
      params.push(`%${q.trim()}%`, `%${q.trim()}%`);
    }

    query += ' ORDER BY created_at DESC';

    const [files] = await pool.query(query, params);

    // Get count breakdown by file type
    const [counts] = await pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN file_type = 'image' THEN 1 ELSE 0 END) as images,
        SUM(CASE WHEN file_type = 'video' THEN 1 ELSE 0 END) as videos,
        SUM(CASE WHEN file_type = 'document' THEN 1 ELSE 0 END) as documents,
        SUM(CASE WHEN file_type = 'other' THEN 1 ELSE 0 END) as others
      FROM media_files
    `);

    res.json({
      files,
      counts: {
        total: Number(counts[0]?.total || 0),
        images: Number(counts[0]?.images || 0),
        videos: Number(counts[0]?.videos || 0),
        documents: Number(counts[0]?.documents || 0),
        others: Number(counts[0]?.others || 0)
      }
    });
  } catch (err) {
    console.error('Error fetching media files:', err);
    res.status(500).json({ error: 'Gagal memuat daftar berkas media.' });
  }
});

// API: Direct upload to Media Library (Supports multiple files: images, videos, documents)
router.post('/files/upload', verifyToken, upload.array('files', 20), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Tidak ada berkas yang dipilih untuk diunggah.' });
    }

    const uploadedRecords = [];
    for (const file of req.files) {
      const record = await registerMediaFile(
        file,
        req.username || 'Admin',
        req.body.source || 'direct_upload'
      );
      if (record) {
        uploadedRecords.push(record);
      }
    }

    res.status(201).json({
      message: `Berhasil mengunggah ${uploadedRecords.length} berkas ke Manajer Berkas!`,
      files: uploadedRecords
    });
  } catch (err) {
    console.error('Error uploading files to media library:', err);
    res.status(500).json({ error: 'Gagal mengunggah berkas.' });
  }
});

// API: Delete file from Media Library (Admin Only)
router.post('/files/:id/delete', verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM media_files WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Berkas tidak ditemukan.' });
    }

    const file = rows[0];
    await pool.query('DELETE FROM media_files WHERE id = ?', [id]);

    // Attempt to remove physical file from disk
    if (file.filename) {
      const filePath = path.join(uploadDir, file.filename);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (unlinkErr) {
          console.warn('Gagal menghapus file fisik di disk:', unlinkErr.message);
        }
      }
    }

    res.json({ message: 'Berkas berhasil dihapus secara permanen!' });
  } catch (err) {
    console.error('Error deleting media file:', err);
    res.status(500).json({ error: 'Gagal menghapus berkas.' });
  }
});

// API: Set or Update Website Logo (Admin Only)
router.post('/settings/logo/edit', verifyToken, isAdmin, upload.single('logo'), async (req, res) => {
  try {
    let logoUrl = req.body.logo_url;

    if (req.file) {
      const record = await registerMediaFile(req.file, req.username || 'Admin', 'logo');
      if (record) {
        logoUrl = record.file_url;
      }
    }

    if (!logoUrl) {
      return res.status(400).json({ error: 'Pilih berkas logo atau masukkan URL logo.' });
    }

    await pool.query('UPDATE profile_info SET logo_url = ? WHERE id = 1', [logoUrl]);

    res.json({
      message: 'Logo website resmi berhasil diperbarui!',
      logo_url: logoUrl
    });
  } catch (err) {
    console.error('Error updating website logo:', err);
    res.status(500).json({ error: 'Gagal memperbarui logo website.' });
  }
});

module.exports = router;
