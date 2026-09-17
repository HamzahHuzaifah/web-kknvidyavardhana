# 🔑 Panduan Pembuatan Sistem Login Modern dengan Google (Google OAuth 2.0)

Dokumen ini menjelaskan secara menyeluruh bagaimana sistem autentikasi **Sign in with Google** (menggunakan Google Identity Services terbaru) dirancang dan diimplementasikan pada website KKN Vidya Vardhana.

---

## 🌟 1. Mengapa Menggunakan Google Identity Services?

Dibandingkan dengan sistem registrasi tradisional (isi form, ketik password berulang kali):
1. **Keamanan Tinggi**: Pengguna tidak perlu mengingat password baru. Autentikasi ditangani langsung oleh server Google dengan standar keamanan kelas dunia.
2. **Email Valid Secara Otomatis**: Email yang didapatkan dari Google dipastikan valid dan aktif milik pengguna tersebut, mencegah pendaftaran akun anonim / email palsu.
3. **Kemudahan Akses (UX Modern)**: Cukup satu kali klik (atau menggunakan Google One Tap), akun langsung terdaftar ke sistem.

---

## 🔄 2. Diagram Alur Kerja (Authentication Flow)

```
[ Pengguna ]             [ Frontend (React) ]           [ Backend (Node.js) ]           [ Google Server ]
     │                           │                                │                             │
     │ 1. Klik Tombol Google     │                                │                             │
     ├──────────────────────────►│                                │                             │
     │                           │ 2. Buka Popup / One Tap        │                             │
     │                           ├─────────────────────────────────────────────────────────────►│
     │                           │                                │                             │
     │ 3. Pilih Akun & Setuju    │                                │                             │
     │◄─────────────────────────────────────────────────────────────────────────────────────────┤
     │                           │                                │                             │
     │                           │ 4. Terima Google ID Token      │                             │
     │                           │◄─────────────────────────────────────────────────────────────┤
     │                           │                                │                             │
     │                           │ 5. POST /api/google-login      │                             │
     │                           │    (Kirim ID Token)            │                             │
     │                           ├───────────────────────────────►│                             │
     │                           │                                │ 6. Verifikasi Token         │
     │                           │                                ├────────────────────────────►│
     │                           │                                │ 7. Token Sah (Payload User) │
     │                           │                                │◄────────────────────────────┤
     │                           │                                │                             │
     │                           │                                │ 8. Cek / Simpan ke MySQL DB │
     │                           │                                │    - Jika baru: status PENDING
     │                           │                                │    - Kirim notifikasi ke Admin
     │                           │                                │    - Jika ACC: Terbitkan JWT│
     │                           │ 9. Respon Token JWT Aplikasi   │                             │
     │                           │◄───────────────────────────────┤                             │
     │                           │                                │                             │
     │ 10. Masuk ke Dashboard    │                                │                             │
     │◄──────────────────────────┤                                │                             │
```

---

## 🛠️ 3. Langkah 1: Pengaturan di Google Cloud Console

Untuk menggunakan fitur ini, Anda wajib memiliki **Google OAuth Client ID**:

1. Buka [Google Cloud Console](https://console.cloud.google.com/).
2. Buat Project Baru (contoh nama: `kkn-vidyavardhana`).
3. Konfigurasi **OAuth consent screen** (Layar Persetujuan OAuth):
   - Pilih jenis pengguna: **External** -> Klik *Create*.
   - Isi **App name**: `KKN Vidya Vardhana`.
   - Isi **User support email** & **Developer contact information** dengan email Anda.
   - Pada bagian **Scopes**, pilih minimal:
     - `.../auth/userinfo.email`
     - `.../auth/userinfo.profile`
     - `openid`
   - Pada **Publishing status**, pastikan statusnya sudah di-**Publish** (Production) agar semua orang dengan akun Gmail dapat login, bukan hanya test users.
4. Buat Kredensial (**Credentials**):
   - Klik **+ CREATE CREDENTIALS** -> Pilih **OAuth client ID**.
   - Application type: **Web application**.
   - Nama: `Web KKN Client`.
   - **Authorized JavaScript origins** (Sangat Penting!):
     - `http://localhost:5173` (untuk testing lokal Vite)
     - `http://localhost:3000`
     - `https://vidyavardhana.my.id` (domain produksi cPanel)
     *(Catatan: Jangan tambahkan tanda slash `/` di akhir URL origin)*.
5. Klik **Create**, lalu salin **Client ID** yang diberikan.
   *(Formatnya seperti: `707874718428-xxxxxxx.apps.googleusercontent.com`)*.

---

## 💻 4. Langkah 2: Implementasi Frontend (React)

Di frontend, kita menggunakan library resmi `@react-oauth/google`.

### 1. Instalasi Library
```bash
cd frontend
npm install @react-oauth/google
```

### 2. Bungkus Aplikasi dengan `GoogleOAuthProvider`
Buka file `frontend/src/main.jsx`:

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google';
import './index.css'
import App from './App.jsx'

// Masukkan Client ID dari Google Cloud Console
const GOOGLE_CLIENT_ID = '707874718428-e4q8n1u9g68ogg58ho435lf2406iocvq.apps.googleusercontent.com';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)
```

### 3. Tambahkan Tombol Login di `frontend/src/pages/Login.jsx`
Gunakan komponen bawaan `<GoogleLogin />` yang responsif dan aman:

```jsx
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Fungsi dipanggil saat Google berhasil mengautentikasi pengguna
  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError('');
    try {
      // credentialResponse berisi JWT ID Token dari Google
      const response = await axios.post('/api/google-login', {
        credential: credentialResponse.credential,
        clientId: credentialResponse.clientId,
      });

      // Simpan session aplikasi ke LocalStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('username', response.data.user.username);
      localStorage.setItem('role', response.data.user.role || 'user');

      // Arahkan ke dashboard
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login Google gagal.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Login Google gagal atau dibatalkan.');
  };

  return (
    <div>
      {/* Tombol Google Login */}
      <div className="flex justify-center mb-6">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
          useOneTap              // Mengaktifkan fitur One Tap di pojok layar
          theme="filled_black"   // Tema tombol (outline / filled_blue / filled_black)
          shape="rectangular"
          text="continue_with"
        />
      </div>
    </div>
  );
}
```

---

## ⚙️ 5. Langkah 3: Implementasi Backend (Node.js & Express)

Di backend, token yang dikirim oleh frontend **wajib diverifikasi** ke server Google menggunakan library `google-auth-library`.

### 1. Instalasi Library di Backend
```bash
cd backend
npm install google-auth-library
```

### 2. Buat Endpoint `/api/google-login` di `backend/routes/authRoutes.js`

```javascript
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { pool } = require('../config/db');
const { JWT_SECRET } = require('../middleware/auth');
const { sendAdminNotificationEmail } = require('../utils/email');

const googleClient = new OAuth2Client();

router.post('/google-login', async (req, res) => {
  try {
    const { credential, clientId } = req.body;
    if (!credential || !clientId) {
      return res.status(400).json({ error: 'Token kredensial Google tidak ditemukan.' });
    }

    // 1. Verifikasi ID Token secara kriptografis menggunakan library resmi Google
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: clientId,
    });
    
    // 2. Ambil data profil pengguna yang aman dari payload Google
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.status(400).json({ error: 'Gagal mengambil data dari Google.' });
    }

    const email = payload.email;
    const googleId = payload.sub; // ID unik permanen dari akun Google
    const rawName = payload.name || email.split('@')[0];
    const usernameBase = rawName.trim().slice(0, 45);

    // 3. Cek apakah email sudah terdaftar di database MySQL
    let [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    let user = rows.length > 0 ? rows[0] : null;

    if (!user) {
      // Pendaftar Baru: Buat akun dengan status 'pending' (perlu persetujuan Admin KKN)
      const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);
      
      // Pastikan username unik di database
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

      // Simpan user baru ke database
      await pool.query(
        'INSERT INTO users (username, email, password, role, status, google_id) VALUES (?, ?, ?, ?, ?, ?)',
        [username, email, hashedPassword, 'user', 'pending', googleId]
      );
      
      const [newRows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
      user = newRows[0];

      // Kirim email notifikasi ke Admin bahwa ada pendaftar baru
      await sendAdminNotificationEmail(username, email);
    } else {
      // Pengguna Lama: Hubungkan google_id jika sebelumnya daftar manual
      if (!user.google_id) {
        await pool.query('UPDATE users SET google_id = ? WHERE id = ?', [googleId, user.id]);
      }
    }

    // 4. Validasi Status Akun (Security Check)
    if (user.status === 'pending') {
      return res.status(403).json({ 
        error: 'Akun Google Anda sedang menunggu persetujuan (ACC) dari Admin KKN.' 
      });
    }
    if (user.status === 'rejected') {
      return res.status(403).json({ 
        error: 'Pendaftaran akun Anda ditolak oleh Admin.' 
      });
    }

    // 5. Berhasil Login: Terbitkan JWT Token Aplikasi
    const token = jwt.sign(
      { id: user.id, role: user.role, username: user.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Simpan active_token untuk deteksi online & proteksi multi-login
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
```

---

## 🗄️ 6. Struktur Kolom Database yang Dibutuhkan

Pastikan tabel `users` memiliki kolom-kolom berikut:

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(191) NULL AFTER username;
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(100) NULL AFTER status;
ALTER TABLE users ADD COLUMN IF NOT EXISTS active_token TEXT NULL AFTER google_id;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_active DATETIME NULL AFTER active_token;
```

---

## 💡 7. Tips Keamanan & Best Practices

1. **Jangan Percaya Data dari Frontend Tanpa Verifikasi**:
   Jangan pernah menerima nama atau email langsung dari body request frontend tanpa memverifikasi `credential` ID Token. Siapapun bisa memalsukan request HTTP jika tidak ada verifikasi kriptografis lewat `verifyIdToken`.
2. **Audience Check**:
   Parameter `audience: clientId` memastikan bahwa token yang dikirim memang dibuat khusus untuk aplikasi Web KKN Anda, bukan token dari aplikasi Google lain.
3. **Pemisahan Peran (Role & Status)**:
   Meskipun login berhasil via Google, pengguna baru tetap memiliki status `pending` sampai Admin kelompok menyetujui (ACC) akun mereka di dashboard. Ini mencegah orang asing di luar anggota kelompok KKN mengunggah artikel sembarangan.
