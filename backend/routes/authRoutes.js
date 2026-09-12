const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
const { verifyToken, isAdmin, JWT_SECRET } = require('../middleware/auth');

// API: Register User
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username dan password wajib diisi.' });
    }

    const [existing] = await pool.query('SELECT * FROM users WHERE username = ?', [username.trim()]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Username sudah digunakan, silakan pilih username lain.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO users (username, password, role, status) VALUES (?, ?, ?, ?)',
      [username.trim(), hashedPassword, 'user', 'pending']
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
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Username atau password salah.' });
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
      'SELECT id, username, role, status, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal memuat daftar pengguna.' });
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

    await pool.query('UPDATE users SET status = ? WHERE id = ?', [status, id]);
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
    const { username, password, role } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username dan password wajib diisi.' });
    }

    if (password.trim().length < 6) {
      return res.status(400).json({ error: 'Password minimal 6 karakter.' });
    }

    const targetRole = ['user', 'admin'].includes(role) ? role : 'user';

    const [existing] = await pool.query('SELECT * FROM users WHERE username = ?', [username.trim()]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Username sudah digunakan, silakan pilih username lain.' });
    }

    const hashedPassword = await bcrypt.hash(password.trim(), 10);
    const [result] = await pool.query(
      'INSERT INTO users (username, password, role, status) VALUES (?, ?, ?, ?)',
      [username.trim(), hashedPassword, targetRole, 'approved']
    );

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

module.exports = router;
