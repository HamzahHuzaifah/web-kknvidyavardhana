const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { pool } = require('../config/db');
const { verifyToken, isAdmin, JWT_SECRET } = require('../middleware/auth');
const { OAuth2Client } = require('google-auth-library');
const { sendWelcomeEmail } = require('../utils/email');

const googleClient = new OAuth2Client(); // Client ID will be passed from frontend tokens

// Rate Limiters
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 register requests per `window` (here, per hour)
  message: { error: 'Terlalu banyak permintaan pembuatan akun dari IP ini, silakan coba lagi setelah 1 jam.' }
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 login requests per `window` (here, per 15 minutes)
  message: { error: 'Terlalu banyak percobaan login yang gagal. IP diblokir sementara, silakan coba 15 menit lagi.' }
});

// API: Register User
router.post('/register', registerLimiter, async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, dan password wajib diisi.' });
    }

    if (!email.toLowerCase().endsWith('@gmail.com')) {
      return res.status(400).json({ error: 'Hanya alamat @gmail.com yang diizinkan untuk keamanan.' });
    }

    const [existing] = await pool.query('SELECT * FROM users WHERE username = ? OR email = ?', [username.trim(), email.trim()]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Username atau email sudah digunakan.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO users (username, email, password, role, status) VALUES (?, ?, ?, ?, ?)',
      [username.trim(), email.trim(), hashedPassword, 'user', 'pending']
    );

    res.status(201).json({
      message: 'Registrasi berhasil! Akun Anda sedang menunggu persetujuan (ACC) dari Admin sebelum dapat digunakan.'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registrasi gagal.' });
  }
});

// API: Login
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { identifier, password } = req.body; // identifier can be username or email
    
    if (!identifier || !password) {
      return res.status(400).json({ error: 'Username/Email dan password wajib diisi.' });
    }

    const [rows] = await pool.query(
      'SELECT * FROM users WHERE username = ? OR email = ?', 
      [identifier.trim(), identifier.trim()]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Username/Email atau password salah.' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Username atau password salah.' });
    }

    if (user.role !== 'admin') {
      if (user.status === 'pending') {
        return res.status(403).json({
          error: 'Akun Anda masih dalam status PENDING (Menunggu Persetujuan Admin). Silakan hubungi admin KKN.'
        });
      }
      if (user.status === 'rejected') {
        return res.status(403).json({
          error: 'Akun Anda DITOLAK oleh Admin. Anda tidak dapat masuk ke sistem.'
        });
      }
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Save active_token to DB (Kick out other sessions)
    await pool.query('UPDATE users SET active_token = ?, last_active = NOW() WHERE id = ?', [token, user.id]);

    res.json({
      token,
      username: user.username,
      role: user.role,
      status: user.status
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login gagal.' });
  }
});

// API: Get All Users (Admin Only)
router.get('/admin/users', verifyToken, isAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, username, role, status, created_at, last_active FROM users ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal memuat daftar pengguna.' });
  }
});

// API: Logout (User explicitly logs out)
router.post('/logout', verifyToken, async (req, res) => {
  try {
    await pool.query('UPDATE users SET active_token = NULL WHERE id = ?', [req.userId]);
    res.json({ message: 'Logout berhasil.' });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ error: 'Gagal melakukan logout.' });
  }
});

// API: Force Logout User (Admin Only)
router.post('/admin/users/:id/logout', verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE users SET active_token = NULL WHERE id = ?', [id]);
    res.json({ message: 'Sesi pengguna berhasil diputus (Logout Paksa).' });
  } catch (err) {
    console.error('Force logout error:', err);
    res.status(500).json({ error: 'Gagal melakukan logout paksa.' });
  }
});

// API: Update User Status - ACC or Reject (Admin Only)
router.patch('/admin/users/:id/status', verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ error: 'Status tidak valid. Pilihan: approved, rejected, pending.' });
    }

    if (parseInt(id) === req.userId && status !== 'approved') {
      return res.status(400).json({ error: 'Admin tidak dapat mengubah status akunnya sendiri menjadi non-aktif!' });
    }

    // Fetch user details first
    const [userRows] = await pool.query('SELECT username, email, status FROM users WHERE id = ?', [id]);
    if (userRows.length === 0) {
      return res.status(404).json({ error: 'Pengguna tidak ditemukan.' });
    }
    const user = userRows[0];
    const prevStatus = user.status;

    await pool.query('UPDATE users SET status = ? WHERE id = ?', [status, id]);
    
    // If status changed to approved, send welcome email
    if (status === 'approved' && prevStatus !== 'approved' && user.email) {
      // We don't await this so it doesn't block the response
      sendWelcomeEmail(user.email, user.username).catch(console.error);
    }

    res.json({ message: `Status akun berhasil diubah menjadi '${status.toUpperCase()}'.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal memperbarui status akun.' });
  }
});

// API: Update User Role - Promote or Demote (Admin Only)
router.patch('/admin/users/:id/role', verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Role tidak valid. Pilihan: user, admin.' });
    }

    if (parseInt(id) === req.userId && role !== 'admin') {
      return res.status(400).json({ error: 'Anda tidak dapat mencabut hak akses Admin dari akun Anda sendiri!' });
    }

    await pool.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
    res.json({ message: `Hak akses akun berhasil diubah menjadi '${role.toUpperCase()}'.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal mengubah role pengguna.' });
  }
});

// API: Delete User (Admin Only)
router.delete('/admin/users/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (parseInt(id) === req.userId) {
      return res.status(400).json({ error: 'Anda tidak dapat menghapus akun Anda sendiri!' });
    }

    const [target] = await pool.query('SELECT username FROM users WHERE id = ?', [id]);
    if (target.length === 0) {
      return res.status(404).json({ error: 'Pengguna tidak ditemukan.' });
    }

    await pool.query('DELETE FROM users WHERE id = ?', [id]);
    res.json({ message: `Akun '${target[0].username}' berhasil dihapus secara permanen.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal menghapus akun pengguna.' });
  }
});

// API: Reset Password User (Admin Only)
router.patch('/admin/users/:id/reset-password', verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { new_password } = req.body;

    if (!new_password || new_password.trim().length < 6) {
      return res.status(400).json({ error: 'Password baru minimal 6 karakter.' });
    }

    const [target] = await pool.query('SELECT username FROM users WHERE id = ?', [id]);
    if (target.length === 0) {
      return res.status(404).json({ error: 'Pengguna tidak ditemukan.' });
    }

    const hashedPassword = await bcrypt.hash(new_password.trim(), 10);
    await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, id]);

    res.json({ message: `Password untuk akun '${target[0].username}' berhasil diperbarui!` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal mereset password pengguna.' });
  }
});

// API: Admin Create User Directly (Admin Only)
router.post('/admin/users', verifyToken, isAdmin, async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, dan password wajib diisi.' });
    }

    if (password.trim().length < 6) {
      return res.status(400).json({ error: 'Password minimal 6 karakter.' });
    }

    const targetRole = ['user', 'admin'].includes(role) ? role : 'user';

    const [existing] = await pool.query('SELECT * FROM users WHERE username = ? OR email = ?', [username.trim(), email.trim()]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Username atau email sudah digunakan.' });
    }

    const hashedPassword = await bcrypt.hash(password.trim(), 10);
    const [result] = await pool.query(
      'INSERT INTO users (username, email, password, role, status) VALUES (?, ?, ?, ?, ?)',
      [username.trim(), email.trim(), hashedPassword, targetRole, 'approved']
    );

    // Because admin created and approved, send email directly if email provided
    if (email) {
      sendWelcomeEmail(email.trim(), username.trim()).catch(console.error);
    }

    res.status(201).json({
      id: result.insertId,
      username: username.trim(),
      role: targetRole,
      status: 'approved',
      message: `Akun '${username.trim()}' (${targetRole.toUpperCase()}) berhasil dibuat langsung dengan status Disetujui (ACC)!`
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal menambahkan akun pengguna.' });
  }
});

// API: Google Login / Register
router.post('/google-login', async (req, res) => {
  try {
    const { credential, clientId } = req.body;
    if (!credential || !clientId) {
      return res.status(400).json({ error: 'Token kredensial Google tidak ditemukan.' });
    }

    // Verify token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: clientId,
    });
    
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.status(400).json({ error: 'Gagal mengambil data dari Google.' });
    }

    const email = payload.email;
    const googleId = payload.sub;
    // Generate a username base from email
    const usernameBase = email.split('@')[0];

    // Check if user exists
    let [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    let user = rows.length > 0 ? rows[0] : null;

    if (!user) {
      // Create new user, set status to pending since it's their first time
      // We will assign a random password since they use Google to login
      const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);
      
      // Ensure unique username
      let username = usernameBase;
      let counter = 1;
      let isUnique = false;
      while (!isUnique) {
        const [existing] = await pool.query('SELECT id FROM users WHERE username = ?', [username]);
        if (existing.length === 0) {
          isUnique = true;
        } else {
          username = `${usernameBase}${counter}`;
          counter++;
        }
      }

      await pool.query(
        'INSERT INTO users (username, email, password, role, status, google_id) VALUES (?, ?, ?, ?, ?, ?)',
        [username, email, hashedPassword, 'user', 'pending', googleId]
      );
      
      // Fetch the newly created user
      const [newRows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
      user = newRows[0];
    } else {
      // User exists, if they don't have google_id, update it
      if (!user.google_id) {
        await pool.query('UPDATE users SET google_id = ? WHERE id = ?', [googleId, user.id]);
      }
    }

    // Check status
    if (user.status === 'pending') {
      return res.status(403).json({ error: 'Akun Google Anda sedang menunggu persetujuan (ACC) dari Admin.' });
    }
    if (user.status === 'rejected') {
      return res.status(403).json({ error: 'Pendaftaran akun Anda ditolak oleh Admin.' });
    }

    // Login successful
    const token = jwt.sign(
      { id: user.id, role: user.role, username: user.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Save active token
    await pool.query('UPDATE users SET active_token = ?, last_active = NOW() WHERE id = ?', [token, user.id]);

    res.json({
      message: 'Login dengan Google berhasil',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });

  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(500).json({ error: 'Verifikasi Google gagal. Silakan coba lagi.' });
  }
});

module.exports = router;
