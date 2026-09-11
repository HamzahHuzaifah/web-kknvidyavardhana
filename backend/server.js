const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { verifyToken, isAdmin, JWT_SECRET } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Expose static uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });
const uploadFields = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'document', maxCount: 1 }
]);

// Database Connection Pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root', // adjust based on user's phpMyAdmin setup
  password: '', // adjust based on user's phpMyAdmin setup
  database: 'db_kkn',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Initialize DB for advanced features
const initDB = async () => {
  try {
    // 1. Ensure users table exists with base columns
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'user',
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Ensure role, status, created_at columns exist for legacy tables
    const [cols] = await pool.query('SHOW COLUMNS FROM users');
    const colNames = cols.map(c => c.Field);
    if (!colNames.includes('role')) {
      await pool.query("ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user'");
    }
    if (!colNames.includes('status')) {
      await pool.query("ALTER TABLE users ADD COLUMN status VARCHAR(20) DEFAULT 'pending'");
    }
    if (!colNames.includes('created_at')) {
      await pool.query("ALTER TABLE users ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
    }

    // 2. Create attendance table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS attendance (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        latitude DECIMAL(10, 8) NOT NULL,
        longitude DECIMAL(11, 8) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // 3. Ensure admin user exists with role='admin' & status='approved'
    const hashedPwd = await bcrypt.hash('admin123', 10);
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', ['admin']);
    if (rows.length === 0) {
      await pool.query('INSERT INTO users (username, password, role, status) VALUES (?, ?, ?, ?)', ['admin', hashedPwd, 'admin', 'approved']);
    } else {
      await pool.query('UPDATE users SET password = ?, role = ?, status = ? WHERE username = ?', [hashedPwd, 'admin', 'approved', 'admin']);
    }

    // 4. Create profile_info table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS profile_info (
        id INT PRIMARY KEY,
        about_title VARCHAR(255),
        about_description TEXT,
        vision TEXT,
        mission TEXT,
        village_name VARCHAR(255),
        village_description TEXT,
        village_population VARCHAR(50),
        village_rtrw VARCHAR(50),
        village_area VARCHAR(50),
        village_latitude DECIMAL(10, 8),
        village_longitude DECIMAL(11, 8),
        village_map_label VARCHAR(255),
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Seed profile_info if empty
    const [profileRows] = await pool.query('SELECT * FROM profile_info WHERE id = 1');
    if (profileRows.length === 0) {
      await pool.query(`
        INSERT INTO profile_info (
          id, about_title, about_description, vision, mission, 
          village_name, village_description, village_population, 
          village_rtrw, village_area, village_latitude, village_longitude, village_map_label
        ) VALUES (
          1,
          'KKN Vidya Vardhana',
          'KKN Vidya Vardhana adalah inisiatif pengabdian mahasiswa yang berfokus pada pemberdayaan pendidikan, teknologi informasi, dan pengembangan potensi lokal desa demi kemajuan masyarakat.',
          'Mewujudkan masyarakat desa yang berdaya saing, melek teknologi digital, dan mandiri secara ekonomi berlandaskan kearifan lokal.',
          '1. Menyelenggarakan program edukasi dan literasi digital berkelanjutan.\\n2. Mendorong digitalisasi potensi UMKM dan pariwisata desa.\\n3. Menjalin sinergi harmonis antara akademisi, aparat desa, dan warga.',
          'Desa Ciasihan',
          'Desa Ciasihan terletak di kawasan perbukitan Kecamatan Pamijahan, Kabupaten Bogor. Dikelilingi udara sejuk, bentang alam hijau yang asri, serta warga yang ramah dan memegang teguh semangat gotong royong.',
          '5,420 Jiwa',
          '12 RT / 04 RW',
          '3.2 km²',
          -6.65780000,
          106.66690000,
          'Balai Desa Ciasihan, Pamijahan'
        )
      `);
    }

    // 5. Create team_members table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS team_members (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(100) NOT NULL,
        major VARCHAR(100),
        image_url VARCHAR(255),
        display_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Seed default team members if table empty
    const [teamRows] = await pool.query('SELECT COUNT(*) as cnt FROM team_members');
    if (teamRows[0].cnt === 0) {
      const defaultTeam = [
        ['M. Arya Pratama', 'Ketua Kelompok', 'Teknik Informatika', 1],
        ['Siti Nurhaliza', 'Sekretaris', 'Ilmu Komunikasi', 2],
        ['Budi Santoso', 'Bendahara', 'Akuntansi', 3],
        ['Rina Wijaya', 'Koordinator Lapangan', 'Sosiologi', 4],
        ['Fajar Hidayat', 'Divisi Kominfo & Media', 'Sistem Informasi', 5],
        ['Dewi Lestari', 'Divisi Pendidikan & Sosial', 'Pendidikan Guru', 6]
      ];
      for (const m of defaultTeam) {
        await pool.query(
          'INSERT INTO team_members (name, role, major, display_order) VALUES (?, ?, ?, ?)',
          [m[0], m[1], m[2], m[3]]
        );
      }
    }

    // 6. Create media_items table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS media_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        platform VARCHAR(50) NOT NULL,
        url TEXT NOT NULL,
        caption TEXT,
        is_autoplay TINYINT(1) DEFAULT 1,
        display_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Seed default media items if empty
    const [mediaRows] = await pool.query('SELECT COUNT(*) as cnt FROM media_items');
    if (mediaRows[0].cnt === 0) {
      await pool.query(`
        INSERT INTO media_items (title, platform, url, caption, is_autoplay, display_order)
        VALUES 
        (
          'Video Profil & Dokumenter KKN',
          'youtube',
          'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          'Dokumentasi video rangkaian kegiatan pengabdian masyarakat mahasiswa KKN Vidya Vardhana di Desa Ciasihan.',
          1,
          1
        ),
        (
          'Keseruan Program Mengajar & Literasi',
          'instagram',
          'https://www.instagram.com/p/C-placeholder/',
          'Potret semangat adik-adik belajar bersama tim KKN Vidya Vardhana.',
          0,
          2
        )
      `);
    }

    // 7. Create social_links table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS social_links (
        id INT AUTO_INCREMENT PRIMARY KEY,
        platform VARCHAR(50) NOT NULL,
        username_handle VARCHAR(100) NOT NULL,
        url TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Seed default social links if empty
    const [socialRows] = await pool.query('SELECT COUNT(*) as cnt FROM social_links');
    if (socialRows[0].cnt === 0) {
      await pool.query(`
        INSERT INTO social_links (platform, username_handle, url)
        VALUES
        ('instagram', '@kkn_vidyavardhana', 'https://instagram.com'),
        ('youtube', 'KKN Vidya Vardhana Official', 'https://youtube.com'),
        ('tiktok', '@kkn.vidyavardhana', 'https://tiktok.com')
      `);
    }

    // 8. Ensure articles table exists and has proper columns
    await pool.query(`
      CREATE TABLE IF NOT EXISTS articles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        category VARCHAR(50) DEFAULT 'berita',
        content LONGTEXT NOT NULL,
        image_url VARCHAR(255),
        file_url VARCHAR(255),
        author_id INT,
        author_name VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Ensure columns category, file_url, author_id, author_name exist
    const [artCols] = await pool.query('SHOW COLUMNS FROM articles');
    const artColNames = artCols.map(c => c.Field);
    if (!artColNames.includes('category')) {
      await pool.query("ALTER TABLE articles ADD COLUMN category VARCHAR(50) DEFAULT 'berita'");
    }
    if (!artColNames.includes('file_url')) {
      await pool.query("ALTER TABLE articles ADD COLUMN file_url VARCHAR(255)");
    }
    if (!artColNames.includes('author_id')) {
      await pool.query("ALTER TABLE articles ADD COLUMN author_id INT");
    }
    if (!artColNames.includes('author_name')) {
      await pool.query("ALTER TABLE articles ADD COLUMN author_name VARCHAR(100)");
    }

    // Seed default articles if empty
    const [existingArticles] = await pool.query('SELECT COUNT(*) as cnt FROM articles');
    if (existingArticles[0].cnt === 0) {
      await pool.query(`
        INSERT INTO articles (title, slug, category, content, author_name)
        VALUES 
        (
          'Sosialisasi Literasi Digital & Pengenalan Website Desa Ciasihan',
          'sosialisasi-literasi-digital-dan-pengenalan-website-desa-ciasihan',
          'berita',
          '<p>Mahasiswa KKN Vidya Vardhana sukses menggelar sosialisasi literasi digital dan pengenalan portal website desa bersama aparatur serta masyarakat Desa Ciasihan. Kegiatan ini bertujuan mempercepat transformasi digital pedesaan dan memudahkan akses informasi publik.</p>',
          'Tim KKN'
        ),
        (
          'Laporan Pengabdian: Pemetaan Potensi UMKM Lokal Desa Ciasihan',
          'laporan-pengabdian-pemetaan-potensi-umkm-lokal-desa-ciasihan',
          'publikasi',
          '<p>Hasil observasi dan riset lapangan tim mahasiswa mengenai rantai pasok komoditas pertanian dan kerajinan warga di Desa Ciasihan. Publikasi ini merangkum strategi digital marketing dan perluasan pasar produk lokal.</p>',
          'Divisi Ekonomi & UMKM'
        ),
        (
          'Buku Saku & Modul Panduan Pengelolaan Sampah Mandiri Tingkat RT',
          'buku-saku-dan-modul-panduan-pengelolaan-sampah-mandiri-tingkat-rt',
          'modul',
          '<p>Modul praktis yang disusun mahasiswa KKN Vidya Vardhana mengenai teknik pemilahan sampah organik dan anorganik, pembuatan kompos sederhana skala rumah tangga, dan pembentukan bank sampah lingkungan.</p>',
          'Divisi Lingkungan Hidup'
        )
      `);
    }

    console.log("Database initialized with all tables: profile, team, media, social, and articles.");
  } catch (error) {
    console.error("DB Init Error:", error);
  }
};
initDB();

// Helper to generate slug
const generateSlug = (title) => {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
};

// API: Get all articles (supports filter by category: berita, publikasi, modul)
app.get('/api/articles', async (req, res) => {
  try {
    const { category } = req.query;
    let query = 'SELECT * FROM articles';
    let params = [];
    if (category && ['berita', 'publikasi', 'modul'].includes(category)) {
      query += ' WHERE category = ?';
      params.push(category);
    }
    query += ' ORDER BY created_at DESC';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

// API: Get article by slug
app.get('/api/articles/:slug', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM articles WHERE slug = ?', [req.params.slug]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Article not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch article' });
  }
});

// API: Create new article / publication / module (User & Admin Allowed to upload)
app.post('/api/articles', verifyToken, uploadFields, async (req, res) => {
  try {
    const { title, content, category } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ error: 'Judul dan isi konten wajib diisi.' });
    }

    const validCategory = ['berita', 'publikasi', 'modul'].includes(category) ? category : 'berita';
    const slug = generateSlug(title) + '-' + Date.now().toString().slice(-4);
    
    const imageUrl = req.files && req.files['image'] ? `/uploads/${req.files['image'][0].filename}` : null;
    const fileUrl = req.files && req.files['document'] ? `/uploads/${req.files['document'][0].filename}` : null;
    const authorName = req.username || 'Anggota KKN';

    const [result] = await pool.query(
      'INSERT INTO articles (title, slug, category, content, image_url, file_url, author_id, author_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [title, slug, validCategory, content, imageUrl, fileUrl, req.userId, authorName]
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

// API: Update article (Hanya Admin yang diizinkan mengubah)
app.put('/api/articles/:id', verifyToken, isAdmin, uploadFields, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, category } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Judul dan isi konten wajib diisi.' });
    }

    const validCategory = ['berita', 'publikasi', 'modul'].includes(category) ? category : 'berita';

    let query = 'UPDATE articles SET title = ?, category = ?, content = ?';
    let params = [title, validCategory, content];

    if (req.files && req.files['image']) {
      query += ', image_url = ?';
      params.push(`/uploads/${req.files['image'][0].filename}`);
    }
    if (req.files && req.files['document']) {
      query += ', file_url = ?';
      params.push(`/uploads/${req.files['document'][0].filename}`);
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

// API: Delete article (Hanya Admin yang diizinkan menghapus)
app.delete('/api/articles/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM articles WHERE id = ?', [id]);
    res.json({ message: 'Konten berhasil dihapus oleh Admin.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal menghapus konten.' });
  }
});

// API: Register (Default role: user, status: pending)
app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username dan password wajib diisi.' });
    }

    if (username.trim().length < 3) {
      return res.status(400).json({ error: 'Username minimal 3 karakter.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password minimal 6 karakter.' });
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE username = ?', [username.trim()]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Username sudah digunakan. Silakan pilih username lain.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO users (username, password, role, status) VALUES (?, ?, ?, ?)',
      [username.trim(), hashedPassword, 'user', 'pending']
    );

    res.status(201).json({
      message: 'Pendaftaran berhasil! Akun Anda sedang menunggu persetujuan (ACC) dari Admin.',
      status: 'pending'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal melakukan pendaftaran akun.' });
  }
});

// API: Login
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const [users] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    if (users.length === 0) {
      return res.status(401).json({ error: 'Username atau password salah.' });
    }

    const user = users[0];
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Username atau password salah.' });
    }

    // Check account status
    if (user.status === 'pending') {
      return res.status(403).json({ 
        error: 'Akun Anda sedang menunggu persetujuan (ACC) dari Admin. Silakan hubungi Admin.' 
      });
    }

    if (user.status === 'rejected') {
      return res.status(403).json({ 
        error: 'Pendaftaran akun Anda telah ditolak oleh Admin.' 
      });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role || 'user' }, 
      JWT_SECRET, 
      { expiresIn: '24h' }
    );
    res.json({ 
      token, 
      username: user.username, 
      role: user.role || 'user' 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login gagal.' });
  }
});

// API: Get all users (Admin only)
app.get('/api/admin/users', verifyToken, isAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT id, username, role, status, created_at 
      FROM users 
      ORDER BY 
        CASE WHEN status = 'pending' THEN 1 ELSE 2 END, 
        created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal mengambil data pengguna.' });
  }
});

// API: Update user status (ACC or Tolak) (Admin only)
app.patch('/api/admin/users/:id/status', verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ error: 'Status tidak valid.' });
    }

    // Prevent modifying main admin account
    const [target] = await pool.query('SELECT username FROM users WHERE id = ?', [id]);
    if (target.length > 0 && target[0].username === 'admin') {
      return res.status(400).json({ error: 'Status Admin utama tidak dapat diubah.' });
    }

    await pool.query('UPDATE users SET status = ? WHERE id = ?', [status, id]);
    res.json({ message: `Status pengguna berhasil diperbarui menjadi '${status}'.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal memperbarui status pengguna.' });
  }
});

// API: Submit Attendance (Protected)
app.post('/api/attendance', verifyToken, async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Location data is required' });
    }
    
    await pool.query(
      'INSERT INTO attendance (user_id, latitude, longitude) VALUES (?, ?, ?)',
      [req.userId, latitude, longitude]
    );

    res.status(201).json({ message: 'Attendance recorded successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to record attendance' });
  }
});

// API: Get Attendance (Protected)
app.get('/api/attendance', verifyToken, async (req, res) => {
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
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
});

// API: Get Profile Info (Public)
app.get('/api/profile-info', async (req, res) => {
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
app.put('/api/profile-info', verifyToken, isAdmin, async (req, res) => {
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
      village_latitude,
      village_longitude,
      village_map_label
    } = req.body;

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
        village_latitude = ?,
        village_longitude = ?,
        village_map_label = ?
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
      village_latitude,
      village_longitude,
      village_map_label
    ]);

    res.json({ message: 'Profil Desa & Tentang Kami berhasil diperbarui!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal memperbarui data profil.' });
  }
});

// API: Get Team Members (Public)
app.get('/api/team', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM team_members ORDER BY display_order ASC, id ASC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal memuat susunan pengurus tim.' });
  }
});

// API: Add Team Member (Admin Only)
app.post('/api/team', verifyToken, isAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, role, major, display_order } = req.body;
    if (!name || !role) {
      return res.status(400).json({ error: 'Nama dan peran/jabatan wajib diisi.' });
    }

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const orderNum = parseInt(display_order) || 0;

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
app.put('/api/team/:id', verifyToken, isAdmin, upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, major, display_order } = req.body;

    if (!name || !role) {
      return res.status(400).json({ error: 'Nama dan peran/jabatan wajib diisi.' });
    }

    const orderNum = parseInt(display_order) || 0;

    if (req.file) {
      const imageUrl = `/uploads/${req.file.filename}`;
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
app.delete('/api/team/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM team_members WHERE id = ?', [id]);
    res.json({ message: 'Anggota tim berhasil dihapus.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal menghapus anggota tim.' });
  }
});

// API: Get Media Items (Public)
app.get('/api/media', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM media_items ORDER BY display_order ASC, id DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal memuat data media.' });
  }
});

// API: Add Media Item (Admin Only)
app.post('/api/media', verifyToken, isAdmin, async (req, res) => {
  try {
    const { title, platform, url, caption, is_autoplay, display_order } = req.body;
    if (!title || !url) {
      return res.status(400).json({ error: 'Judul dan URL media wajib diisi.' });
    }

    const orderNum = parseInt(display_order) || 0;
    const autoplayVal = is_autoplay === false || is_autoplay === 0 || is_autoplay === '0' ? 0 : 1;

    const [result] = await pool.query(
      'INSERT INTO media_items (title, platform, url, caption, is_autoplay, display_order) VALUES (?, ?, ?, ?, ?, ?)',
      [title, platform || 'youtube', url, caption || '', autoplayVal, orderNum]
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
app.put('/api/media/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, platform, url, caption, is_autoplay, display_order } = req.body;
    if (!title || !url) {
      return res.status(400).json({ error: 'Judul dan URL media wajib diisi.' });
    }

    const orderNum = parseInt(display_order) || 0;
    const autoplayVal = is_autoplay === false || is_autoplay === 0 || is_autoplay === '0' ? 0 : 1;

    await pool.query(
      'UPDATE media_items SET title = ?, platform = ?, url = ?, caption = ?, is_autoplay = ?, display_order = ? WHERE id = ?',
      [title, platform || 'youtube', url, caption || '', autoplayVal, orderNum, id]
    );

    res.json({ message: 'Media berhasil diperbarui!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal memperbarui media.' });
  }
});

// API: Delete Media Item (Admin Only)
app.delete('/api/media/:id', verifyToken, isAdmin, async (req, res) => {
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
app.get('/api/social-links', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM social_links ORDER BY id ASC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal memuat akun medsos.' });
  }
});

// API: Add Social Link (Admin Only)
app.post('/api/social-links', verifyToken, isAdmin, async (req, res) => {
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
app.delete('/api/social-links/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM social_links WHERE id = ?', [id]);
    res.json({ message: 'Akun media sosial berhasil dihapus.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal menghapus akun media sosial.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
