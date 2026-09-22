const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const { pool } = require('../config/db');
const { verifyToken, isAdmin } = require('../middleware/auth');
const { uploadDir, registerMediaFile } = require('../utils/fileHelper');

// Multer Storage Configuration for Audio
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'audio-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedExts = ['.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExts.includes(ext) || file.mimetype.startsWith('audio/')) {
    cb(null, true);
  } else {
    cb(new Error('Format file audio tidak didukung. Harap upload file .mp3, .wav, .m4a, atau .ogg'));
  }
};

const audioUpload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 15 * 1024 * 1024 } // 15MB limit
});

// API: Get Welcome Audio Settings (Public)
router.get('/welcome-audio', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM welcome_audio_settings WHERE id = 1');
    if (rows.length === 0) {
      return res.json({
        is_enabled: 1,
        title: 'Selamat Datang di Website Resmi',
        subtitle: 'KKN Vidya Vardhana Desa Ciasihan',
        button_text: 'Buka Website & Putar Musik 🎵',
        source_type: 'url',
        audio_url: 'https://actions.google.com/sounds/v1/ambiences/outdoor_festival_ambience.ogg',
        audio_title: 'Instrumen Musik Sambutan'
      });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching welcome audio settings:', err);
    res.status(500).json({ error: 'Gagal memuat pengaturan musik sambutan.' });
  }
});

// API: Update Welcome Audio Settings (Admin Only)
router.post('/welcome-audio/edit', verifyToken, isAdmin, audioUpload.single('audio_file'), async (req, res) => {
  try {
    const {
      is_enabled,
      title,
      subtitle,
      button_text,
      source_type,
      audio_url,
      audio_title
    } = req.body;

    let finalAudioUrl = audio_url || '';

    // If an audio file was uploaded
    if (req.file) {
      finalAudioUrl = `/uploads/${req.file.filename}`;
      await registerMediaFile(req.file, req.username || 'Admin', 'welcome_audio');
    }

    const enabledVal = is_enabled === '1' || is_enabled === 1 || is_enabled === true || is_enabled === 'true' ? 1 : 0;
    const sourceTypeVal = ['upload', 'youtube', 'url'].includes(source_type) ? source_type : 'upload';

    await pool.query(
      `UPDATE welcome_audio_settings SET 
        is_enabled = ?, 
        title = ?, 
        subtitle = ?, 
        button_text = ?, 
        source_type = ?, 
        audio_url = ?, 
        audio_title = ? 
      WHERE id = 1`,
      [
        enabledVal,
        title || 'Selamat Datang di Website Resmi',
        subtitle || '',
        button_text || 'Buka Website & Putar Musik 🎵',
        sourceTypeVal,
        finalAudioUrl,
        audio_title || 'Musik Sambutan KKN'
      ]
    );

    res.json({
      message: 'Pengaturan musik sambutan berhasil disimpan!',
      audio_url: finalAudioUrl
    });
  } catch (err) {
    console.error('Error updating welcome audio settings:', err);
    res.status(500).json({ error: err.message || 'Gagal menyimpan pengaturan musik sambutan.' });
  }
});

module.exports = router;
