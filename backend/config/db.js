const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

// Load .env jika ada (lokal pakai .env, cPanel pakai env dari Setup Node.js App)
try { require('dotenv').config(); } catch(e) {}

// Database Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
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
    try {
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

      // Default Admin User
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
    } catch (err) {
      console.error('Error initializing users table:', err);
    }

    // 2. Create attendance table
    try {
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
    } catch (err) {
      console.error('Error initializing attendance table:', err);
    }

    // 3. Create profile_info table
    try {
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

      const [pCols] = await pool.query('SHOW COLUMNS FROM profile_info');
      const pColNames = pCols.map((c) => c.Field);
      if (!pColNames.includes('village_map_iframe')) {
        await pool.query("ALTER TABLE profile_info ADD COLUMN village_map_iframe TEXT");
      }
      if (!pColNames.includes('village_map_label')) {
        await pool.query("ALTER TABLE profile_info ADD COLUMN village_map_label VARCHAR(255)");
      }
      if (!pColNames.includes('logo_url')) {
        await pool.query("ALTER TABLE profile_info ADD COLUMN logo_url VARCHAR(500) NULL");
      }
      if (!pColNames.includes('jumbotron_animation')) {
        await pool.query("ALTER TABLE profile_info ADD COLUMN jumbotron_animation VARCHAR(50) DEFAULT 'fade'");
      }

      // Seed or restore profile_info if empty
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
    } catch (err) {
      console.error('Error initializing profile_info table:', err);
    }

    // 4. Create team_members table
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS team_members (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT UNIQUE NULL,
          name VARCHAR(255) NOT NULL,
          slug VARCHAR(255) UNIQUE,
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

      const [tmCols] = await pool.query('SHOW COLUMNS FROM team_members');
      const tmColNames = tmCols.map((c) => c.Field);
      if (!tmColNames.includes('user_id')) {
        await pool.query("ALTER TABLE team_members ADD COLUMN user_id INT UNIQUE NULL");
        await pool.query("ALTER TABLE team_members ADD CONSTRAINT fk_team_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL");
      }
      if (!tmColNames.includes('slug')) {
        await pool.query("ALTER TABLE team_members ADD COLUMN slug VARCHAR(255) UNIQUE NULL");
      }

      // Auto-generate slug for existing members with NULL or empty slug
      const [nullSlugMembers] = await pool.query("SELECT id, name FROM team_members WHERE slug IS NULL OR slug = ''");
      for (const mem of nullSlugMembers) {
        let baseSlug = (mem.name || 'anggota')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '');
        if (!baseSlug) baseSlug = `anggota-${mem.id}`;
        
        let candidateSlug = baseSlug;
        let counter = 1;
        let isUnique = false;
        while (!isUnique) {
          const [existing] = await pool.query("SELECT id FROM team_members WHERE slug = ? AND id != ?", [candidateSlug, mem.id]);
          if (existing.length === 0) {
            isUnique = true;
          } else {
            candidateSlug = `${baseSlug}-${counter}`;
            counter++;
          }
        }
        await pool.query("UPDATE team_members SET slug = ? WHERE id = ?", [candidateSlug, mem.id]);
      }
      
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
          const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
          await pool.query(
            'INSERT INTO team_members (name, slug, role, major, display_order) VALUES (?, ?, ?, ?, ?)',
            [name, slug, role, major, order]
          );
        }
      }
    } catch (err) {
      console.error('Error initializing team_members table:', err);
    }

    // 5. Create media_items table
    try {
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
    } catch (err) {
      console.error('Error initializing media_items table:', err);
    }

    // 6. Create social_links table
    try {
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
    } catch (err) {
      console.error('Error initializing social_links table:', err);
    }

    // 7. Ensure articles table exists
    try {
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
    } catch (err) {
      console.error('Error initializing articles table:', err);
    }

    // 8. Create media_files table
    try {
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
    } catch (err) {
      console.error('Error initializing media_files table:', err);
    }

    // 9. Create jumbotron_slides table
    try {
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

      const [slideRows] = await pool.query('SELECT COUNT(*) as cnt FROM jumbotron_slides');
      if (slideRows[0].cnt === 0) {
        await pool.query(`
          INSERT INTO jumbotron_slides (image_url, title, subtitle, display_order)
          VALUES 
          ('https://images.unsplash.com/photo-1596484552834-6a58f850d0a7?auto=format&fit=crop&q=80&w=1200', 'SELAMAT DATANG DI WEBSITE KKN VIDYA VARDHANA', 'Pusat informasi dan publikasi program kerja Kuliah Kerja Nyata. Bersama membangun desa, mewujudkan kemajuan berkelanjutan.', 1)
        `);
      }
    } catch (err) {
      console.error('Error initializing jumbotron_slides table:', err);
    }

    // 10. Create footer_info table
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS footer_info (
          id INT PRIMARY KEY,
          brand_title VARCHAR(255) DEFAULT 'KKN Vidya Vardhana',
          brand_tagline TEXT,
          about_text TEXT,
          address TEXT,
          email VARCHAR(150),
          phone VARCHAR(50),
          operational_hours VARCHAR(150),
          copyright_text VARCHAR(255),
          quick_links LONGTEXT,
          show_social_links TINYINT(1) DEFAULT 1,
          show_map_link TINYINT(1) DEFAULT 1,
          map_url TEXT,
          bottom_bar_text VARCHAR(255),
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);

      const [footerCols] = await pool.query('SHOW COLUMNS FROM footer_info');
      const footerColNames = footerCols.map((c) => c.Field);
      if (!footerColNames.includes('brand_tagline')) {
        await pool.query('ALTER TABLE footer_info ADD COLUMN brand_tagline TEXT');
      }
      if (!footerColNames.includes('quick_links')) {
        await pool.query('ALTER TABLE footer_info ADD COLUMN quick_links LONGTEXT');
      }
      if (!footerColNames.includes('show_social_links')) {
        await pool.query('ALTER TABLE footer_info ADD COLUMN show_social_links TINYINT(1) DEFAULT 1');
      }
      if (!footerColNames.includes('show_map_link')) {
        await pool.query('ALTER TABLE footer_info ADD COLUMN show_map_link TINYINT(1) DEFAULT 1');
      }
      if (!footerColNames.includes('map_url')) {
        await pool.query('ALTER TABLE footer_info ADD COLUMN map_url TEXT');
      }
      if (!footerColNames.includes('bottom_bar_text')) {
        await pool.query('ALTER TABLE footer_info ADD COLUMN bottom_bar_text VARCHAR(255)');
      }

      const [footerRows] = await pool.query('SELECT * FROM footer_info WHERE id = 1');
      if (footerRows.length === 0) {
        const defaultQuickLinks = JSON.stringify([
          { label: 'Beranda', url: '/' },
          { label: 'Profil Desa & Tim', url: '/profile' },
          { label: 'Media & Galeri', url: '/media' },
          { label: 'Berita & Publikasi', url: '/berita' },
          { label: 'Panel Akun', url: '/login' }
        ]);

        await pool.query(`
          INSERT INTO footer_info (
            id, brand_title, brand_tagline, about_text, 
            address, email, phone, operational_hours, 
            copyright_text, quick_links, show_social_links, 
            show_map_link, map_url, bottom_bar_text
          ) VALUES (
            1,
            'KKN Vidya Vardhana',
            'Inisiatif Pengabdian Mahasiswa untuk Pemberdayaan Desa & Transformasi Digital.',
            'KKN Vidya Vardhana berfokus pada dedikasi dan kontribusi nyata dalam pendidikan, teknologi informasi, serta penguatan potensi lokal masyarakat Desa Ciasihan.',
            'Kantor Balai Desa Ciasihan, Kec. Pamijahan, Kabupaten Bogor, Jawa Barat 16810',
            'kkn.vidyavardhana@gmail.com',
            '+62 812-3456-7890',
            'Senin - Sabtu: 08:00 - 17:00 WIB',
            '© 2024-2026 KKN Vidya Vardhana. Seluruh Hak Cipta Dilindungi.',
            ?,
            1,
            1,
            'https://maps.google.com/?q=Balai+Desa+Ciasihan+Pamijahan',
            'Bersama Mewujudkan Kemajuan Berkelanjutan di Desa Ciasihan'
          )
        `, [defaultQuickLinks]);
      }
    } catch (err) {
      console.error('Error initializing footer_info table:', err);
    }

    // 11. Create welcome_audio_settings table
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS welcome_audio_settings (
          id INT PRIMARY KEY,
          is_enabled TINYINT(1) DEFAULT 1,
          title VARCHAR(255) DEFAULT 'Selamat Datang di Website Resmi',
          subtitle TEXT,
          button_text VARCHAR(100) DEFAULT 'Buka Website & Putar Musik 🎵',
          source_type ENUM('upload', 'youtube', 'url') DEFAULT 'url',
          audio_url TEXT,
          audio_title VARCHAR(255) DEFAULT 'Instrumen Musik Sambutan',
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);

      const [audioCols] = await pool.query('SHOW COLUMNS FROM welcome_audio_settings');
      const audioColNames = audioCols.map((c) => c.Field);
      if (!audioColNames.includes('source_type')) {
        await pool.query("ALTER TABLE welcome_audio_settings ADD COLUMN source_type ENUM('upload', 'youtube', 'url') DEFAULT 'url'");
      }
      if (!audioColNames.includes('audio_title')) {
        await pool.query("ALTER TABLE welcome_audio_settings ADD COLUMN audio_title VARCHAR(255) DEFAULT 'Instrumen Musik Sambutan'");
      }

      const [audioRows] = await pool.query('SELECT * FROM welcome_audio_settings WHERE id = 1');
      if (audioRows.length === 0) {
        await pool.query(`
          INSERT INTO welcome_audio_settings (
            id, is_enabled, title, subtitle, button_text, source_type, audio_url, audio_title
          ) VALUES (
            1,
            1,
            'Selamat Datang di Website Resmi',
            'KKN Vidya Vardhana Desa Ciasihan',
            'Buka Website & Putar Musik 🎵',
            'url',
            'https://actions.google.com/sounds/v1/ambiences/outdoor_festival_ambience.ogg',
            'Instrumen Musik Sambutan'
          )
        `);
      }
    } catch (err) {
      console.error('Error initializing welcome_audio_settings table:', err);
    }

    console.log('Database initialization completed.');
  } catch (error) {
    console.error('Critical DB Init Error:', error);
  }
};

module.exports = { pool, initDB };
