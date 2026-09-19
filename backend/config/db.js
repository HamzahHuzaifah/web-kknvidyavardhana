const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

// Load .env jika ada (lokal pakai .env, cPanel pakai env dari Setup Node.js App)
try { require('dotenv').config(); } catch(e) {}

// Database Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'db_kkn',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Initialize DB schema & default seeds
const initDB = async (syncUploadsCallback) => {
  try {
    // 1. Ensure users table exists with base columns
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('user', 'admin') DEFAULT 'user',
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Ensure role and status columns exist if table was previously created
    const [cols] = await pool.query('SHOW COLUMNS FROM users');
    const colNames = cols.map((c) => c.Field);
    if (!colNames.includes('role')) {
      await pool.query("ALTER TABLE users ADD COLUMN role ENUM('admin','user') DEFAULT 'user'");
    }
    if (!colNames.includes('status')) {
      await pool.query("ALTER TABLE users ADD COLUMN status ENUM('pending','acc','rejected') DEFAULT 'pending'");
    }
    if (!colNames.includes('active_token')) {
      await pool.query("ALTER TABLE users ADD COLUMN active_token VARCHAR(500) NULL");
    }
    if (!colNames.includes('last_active')) {
      await pool.query("ALTER TABLE users ADD COLUMN last_active TIMESTAMP NULL");
    }
    if (!colNames.includes('email')) {
      await pool.query("ALTER TABLE users ADD COLUMN email VARCHAR(100) UNIQUE NULL");
    }
    if (!colNames.includes('google_id')) {
      await pool.query("ALTER TABLE users ADD COLUMN google_id VARCHAR(100) UNIQUE NULL");
    }
    if (!colNames.includes('can_upload_berita')) {
      await pool.query("ALTER TABLE users ADD COLUMN can_upload_berita BOOLEAN DEFAULT FALSE");
    }
    if (!colNames.includes('can_upload_publikasi')) {
      await pool.query("ALTER TABLE users ADD COLUMN can_upload_publikasi BOOLEAN DEFAULT FALSE");
    }
    if (!colNames.includes('can_upload_modul')) {
      await pool.query("ALTER TABLE users ADD COLUMN can_upload_modul BOOLEAN DEFAULT FALSE");
    }
    if (!colNames.includes('can_edit_profile')) {
      await pool.query("ALTER TABLE users ADD COLUMN can_edit_profile BOOLEAN DEFAULT FALSE");
    }

    // Default Admin Userxists and is approved
    const [adminRows] = await pool.query('SELECT * FROM users WHERE username = ?', ['admin']);
    const hashedPwd = await bcrypt.hash('admin123', 10);
    if (adminRows.length === 0) {
      await pool.query('INSERT INTO users (username, password, role, status, can_upload_berita, can_upload_publikasi, can_upload_modul, can_edit_profile) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [
        'admin',
        hashedPwd,
        'admin',
        'approved',
        true,
        true,
        true,
        true
      ]);
    } else {
      await pool.query('UPDATE users SET password = ?, role = ?, status = ?, can_upload_berita = ?, can_upload_publikasi = ?, can_upload_modul = ?, can_edit_profile = ? WHERE username = ?', [
        hashedPwd,
        'admin',
        'approved',
        true,
        true,
        true,
        true,
        'admin'
      ]);
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

    // 3. Create profile_info table
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
        village_area VARCHAR(255),
        village_map_iframe TEXT,
        village_map_label VARCHAR(255),
        logo_url VARCHAR(255) DEFAULT NULL,
        jumbotron_animation VARCHAR(50) DEFAULT 'fade',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Ensure logo_url column exists in profile_info
    const [pCols] = await pool.query('SHOW COLUMNS FROM profile_info');
    const pColNames = pCols.map((c) => c.Field);
    if (!pColNames.includes('village_map_iframe')) {
      await pool.query("ALTER TABLE profile_info ADD COLUMN village_map_iframe TEXT");
    }
    if (!pColNames.includes('logo_url')) {
      await pool.query("ALTER TABLE profile_info ADD COLUMN logo_url VARCHAR(500) NULL");
    }
    if (!pColNames.includes('jumbotron_animation')) {
      await pool.query("ALTER TABLE profile_info ADD COLUMN jumbotron_animation VARCHAR(50) DEFAULT 'fade'");
    }

    // Seed profile_info if empty
    const [profileRows] = await pool.query('SELECT * FROM profile_info WHERE id = 1');
    if (profileRows.length === 0) {
      await pool.query(`
        INSERT INTO profile_info (
          id, about_title, about_description, vision, mission, 
          village_name, village_description, village_population, 
          village_rtrw, village_area, village_map_iframe, village_map_label
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
          '',
          'Balai Desa Ciasihan, Pamijahan'
        )
      `);
    }

    // 4. Create team_members table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS team_members (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT UNIQUE NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(100) NOT NULL,
        major VARCHAR(100),
        image_url VARCHAR(255),
        display_order INT DEFAULT 0,
        greeting LONGTEXT,
        about_me LONGTEXT,
        portfolio_projects LONGTEXT,
        skills_experience LONGTEXT,
        testimonials LONGTEXT,
        contact_email VARCHAR(255),
        contact_phone VARCHAR(50),
        social_links LONGTEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    // Ensure user_id column exists in team_members
    const [tmCols] = await pool.query('SHOW COLUMNS FROM team_members');
    const tmColNames = tmCols.map((c) => c.Field);
    if (!tmColNames.includes('user_id')) {
      await pool.query("ALTER TABLE team_members ADD COLUMN user_id INT UNIQUE NULL");
      await pool.query("ALTER TABLE team_members ADD CONSTRAINT fk_team_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL");
    }
    
    // Ensure new portfolio columns exist
    const portfolioCols = [
      { name: 'greeting', type: 'LONGTEXT' },
      { name: 'about_me', type: 'LONGTEXT' },
      { name: 'portfolio_projects', type: 'LONGTEXT' },
      { name: 'skills_experience', type: 'LONGTEXT' },
      { name: 'testimonials', type: 'LONGTEXT' },
      { name: 'contact_email', type: 'VARCHAR(255)' },
      { name: 'contact_phone', type: 'VARCHAR(50)' },
      { name: 'social_links', type: 'LONGTEXT' }
    ];
    for (const pCol of portfolioCols) {
      if (!tmColNames.includes(pCol.name)) {
        await pool.query(`ALTER TABLE team_members ADD COLUMN ${pCol.name} ${pCol.type}`);
      }
    }

    // Seed default team members if table empty
    const [teamRows] = await pool.query('SELECT COUNT(*) as cnt FROM team_members');
    if (teamRows[0].cnt === 0) {
      const defaultTeam = [
        ['M. Arya Pratama', 'Ketua Kelompok', 'Teknik Informatika', 1],
        ['Siti Nurhaliza', 'Sekretaris', 'Ilmu Komunikasi', 2],
        ['Budi Santoso', 'Bendahara', 'Akuntansi', 3],
        ['Rina Wijaya', 'Koordinator Lapangan', 'Sosiologi', 4],
        ['Fajar Nugraha', 'Divisi Publikasi & Dokumentasi', 'Desain Komunikasi Visual', 5],
        ['Dewi Anggraeni', 'Divisi Pendidikan & Literasi', 'Pendidikan Guru Sekolah Dasar', 6],
        ['Ahmad Hidayat', 'Divisi Ekonomi & UMKM', 'Manajemen Bisnis', 7],
        ['Nabila Putri', 'Divisi Kesehatan & Lingkungan', 'Kesehatan Masyarakat', 8]
      ];
      for (const [name, role, major, order] of defaultTeam) {
        await pool.query(
          'INSERT INTO team_members (name, role, major, display_order) VALUES (?, ?, ?, ?)',
          [name, role, major, order]
        );
      }
    }

    // 5. Create media_items table (embeds)
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

    // 6. Create social_links table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS social_links (
        id INT AUTO_INCREMENT PRIMARY KEY,
        platform VARCHAR(50) NOT NULL,
        username_handle VARCHAR(100) NOT NULL,
        url TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

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

    // 7. Ensure articles table exists
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

    const [artCols] = await pool.query('SHOW COLUMNS FROM articles');
    const artColNames = artCols.map((c) => c.Field);
    if (!artColNames.includes('category')) {
      await pool.query("ALTER TABLE articles ADD COLUMN category VARCHAR(50) DEFAULT 'berita'");
    }
    if (!artColNames.includes('file_url')) {
      await pool.query('ALTER TABLE articles ADD COLUMN file_url VARCHAR(255)');
    }
    if (!artColNames.includes('author_id')) {
      await pool.query('ALTER TABLE articles ADD COLUMN author_id INT');
    }
    if (!artColNames.includes('author_name')) {
      await pool.query('ALTER TABLE articles ADD COLUMN author_name VARCHAR(100)');
    }
    if (!artColNames.includes('abstract')) {
      await pool.query('ALTER TABLE articles ADD COLUMN abstract LONGTEXT DEFAULT NULL');
    }
    if (!artColNames.includes('keywords')) {
      await pool.query('ALTER TABLE articles ADD COLUMN keywords VARCHAR(255) DEFAULT NULL');
    }
    if (!artColNames.includes('authors_meta')) {
      await pool.query('ALTER TABLE articles ADD COLUMN authors_meta TEXT DEFAULT NULL');
    }
    if (!artColNames.includes('doi_or_reg')) {
      await pool.query('ALTER TABLE articles ADD COLUMN doi_or_reg VARCHAR(100) DEFAULT NULL');
    }
    if (!artColNames.includes('views_count')) {
      await pool.query('ALTER TABLE articles ADD COLUMN views_count INT DEFAULT 0');
    }
    if (!artColNames.includes('downloads_count')) {
      await pool.query('ALTER TABLE articles ADD COLUMN downloads_count INT DEFAULT 0');
    }
    if (!artColNames.includes('publisher')) {
      await pool.query("ALTER TABLE articles ADD COLUMN publisher VARCHAR(150) DEFAULT 'KKN Vidya Vardhana'");
    }
    if (!artColNames.includes('references_list')) {
      await pool.query('ALTER TABLE articles ADD COLUMN references_list TEXT DEFAULT NULL');
    }
    if (!artColNames.includes('volume')) {
      await pool.query('ALTER TABLE articles ADD COLUMN volume INT DEFAULT NULL');
    }
    if (!artColNames.includes('issue')) {
      await pool.query('ALTER TABLE articles ADD COLUMN issue INT DEFAULT NULL');
    }
    if (!artColNames.includes('published_date')) {
      await pool.query('ALTER TABLE articles ADD COLUMN published_date DATE DEFAULT NULL');
    }

    // 8. Create media_files table (Central Media Library / File Manager)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS media_files (
        id INT AUTO_INCREMENT PRIMARY KEY,
        filename VARCHAR(255) NOT NULL,
        original_name VARCHAR(255) NOT NULL,
        file_url VARCHAR(255) NOT NULL,
        file_type VARCHAR(50) NOT NULL,
        mime_type VARCHAR(100),
        file_size INT DEFAULT 0,
        uploaded_by VARCHAR(100) DEFAULT 'Admin',
        source VARCHAR(50) DEFAULT 'direct_upload',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    if (typeof syncUploadsCallback === 'function') {
      await syncUploadsCallback();
    }

    // 9. Create jumbotron_slides table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS jumbotron_slides (
        id INT AUTO_INCREMENT PRIMARY KEY,
        image_url VARCHAR(255) NOT NULL,
        title VARCHAR(255),
        subtitle TEXT,
        display_order INT DEFAULT 0,
        is_active TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Seed default jumbotron slide if empty
    const [slideRows] = await pool.query('SELECT COUNT(*) as cnt FROM jumbotron_slides');
    if (slideRows[0].cnt === 0) {
      await pool.query(`
        INSERT INTO jumbotron_slides (image_url, title, subtitle, display_order)
        VALUES 
        ('https://images.unsplash.com/photo-1596484552834-6a58f850d0a7?auto=format&fit=crop&q=80&w=1200', 'SELAMAT DATANG DI WEBSITE KKN VIDYA VARDHANA', 'Pusat informasi dan publikasi program kerja Kuliah Kerja Nyata. Bersama membangun desa, mewujudkan kemajuan berkelanjutan.', 1)
      `);
    }

    console.log('Database initialized with all tables: users, attendance, profile, team, media, social, articles, media_files, jumbotron_slides.');
  } catch (error) {
    console.error('DB Init Error:', error);
  }
};

module.exports = { pool, initDB };
