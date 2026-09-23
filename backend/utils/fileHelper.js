const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { pool } = require('../config/db');

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size
    fieldSize: 50 * 1024 * 1024  // 50MB max field value size (supports embedded rich text images)
  }
});

const uploadFields = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'document', maxCount: 1 }
]);

// Helper to detect file type category
const detectFileType = (file) => {
  const mime = (file.mimetype || '').toLowerCase();
  const ext = path.extname(file.originalname || file.filename || '').toLowerCase();

  if (
    mime.startsWith('image/') ||
    ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.ico', '.avif', '.heic', '.heif'].includes(ext)
  ) {
    return 'image';
  }
  if (
    mime.startsWith('video/') ||
    ['.mp4', '.webm', '.mkv', '.mov', '.avi', '.flv', '.wmv', '.m4v'].includes(ext)
  ) {
    return 'video';
  }
  if (
    mime.startsWith('audio/') ||
    ['.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac'].includes(ext)
  ) {
    return 'audio';
  }
  if (
    mime.includes('pdf') ||
    mime.includes('document') ||
    mime.includes('word') ||
    mime.includes('sheet') ||
    mime.includes('excel') ||
    mime.includes('presentation') ||
    mime.includes('powerpoint') ||
    mime.includes('text') ||
    mime.includes('zip') ||
    mime.includes('rar') ||
    ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.csv', '.zip', '.rar', '.7z'].includes(ext)
  ) {
    return 'document';
  }
  return 'other';
};

// Helper to register file to media_files table
const registerMediaFile = async (file, uploadedBy = 'Admin', source = 'direct_upload') => {
  if (!file) return null;
  try {
    let fileExt = path.extname(file.originalname || file.filename || '').toLowerCase();
    let isHeic = fileExt === '.heic' || fileExt === '.heif';
    
    let finalFilename = file.filename;
    let finalOriginalName = file.originalname || file.filename;
    let finalMimeType = file.mimetype || 'application/octet-stream';
    let finalFileSize = file.size || 0;
    
    // HEIC/HEIF and MOV are now accepted natively.

    const fileType = detectFileType(file);
    const fileUrl = `/uploads/${finalFilename}`;

    const [result] = await pool.query(
      `INSERT INTO media_files 
       (filename, original_name, file_url, file_type, mime_type, file_size, uploaded_by, source) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [finalFilename, finalOriginalName, fileUrl, fileType, finalMimeType, finalFileSize, uploadedBy || 'Admin', source]
    );

    return {
      id: result.insertId,
      filename: finalFilename,
      original_name: finalOriginalName,
      file_url: fileUrl,
      file_type: fileType,
      mime_type: finalMimeType,
      file_size: finalFileSize,
      uploaded_by: uploadedBy || 'Admin',
      source
    };
  } catch (err) {
    console.error('Error registering media file in database:', err);
    return null;
  }
};

// Sync existing files in uploads folder into media_files if missing
const syncExistingUploads = async () => {
  try {
    if (!fs.existsSync(uploadDir)) return;
    const uploadFiles = fs.readdirSync(uploadDir);
    for (const fname of uploadFiles) {
      const filePath = path.join(uploadDir, fname);
      const stat = fs.statSync(filePath);
      if (stat.isFile()) {
        const [existing] = await pool.query('SELECT id FROM media_files WHERE filename = ?', [fname]);
        if (existing.length === 0) {
          const fakeFile = {
            filename: fname,
            originalname: fname,
            size: stat.size,
            mimetype: ''
          };
          const fileType = detectFileType(fakeFile);
          await pool.query(
            `INSERT INTO media_files 
             (filename, original_name, file_url, file_type, mime_type, file_size, uploaded_by, source) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [fname, fname, `/uploads/${fname}`, fileType, 'application/octet-stream', stat.size, 'System', 'existing']
          );
        }
      }
    }
  } catch (err) {
    console.warn('Sync uploads warning:', err.message);
  }
};

// Helper to generate clean, short slug (max 5-6 words, max 50 chars)
const generateSlug = (title, maxWords = 5) => {
  if (!title) return 'post-' + Math.random().toString(36).substring(2, 6);
  const clean = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .trim();
  const words = clean.split(/\s+/).filter(Boolean).slice(0, maxWords);
  let slug = words.join('-');
  if (slug.length > 50) {
    slug = slug.substring(0, 50).replace(/-[^-]*$/, '');
  }
  return slug || 'berita';
};

module.exports = {
  uploadDir,
  upload,
  uploadFields,
  detectFileType,
  registerMediaFile,
  syncExistingUploads,
  generateSlug
};
