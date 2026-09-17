# 🚀 Panduan Lengkap Deploy Web KKN Vidya Vardhana

Dokumen ini adalah panduan referensi resmi untuk melakukan deployment awal maupun update rutin (CI/CD manual) pada website **KKN Vidya Vardhana**. Simpan dokumen ini agar di masa depan proses deployment dapat dilakukan dengan cepat, aman, dan tanpa error.

---

## 📌 1. Gambaran Arsitektur Sistem

Website KKN Vidya Vardhana dibangun dengan arsitektur modern yang terbagi menjadi 3 komponen utama:

```
                  ┌─────────────────────────────────────┐
                  │          Pengguna / Browser         │
                  └──────────────────┬──────────────────┘
                                     │ HTTPS
                                     ▼
                  ┌─────────────────────────────────────┐
                  │       Web Server cPanel (Apache)    │
                  │   Folder: public_html (Frontend)    │
                  └─────────┬──────────────────┬────────┘
                            │                  │
        (File Statis SPA)   │                  │ (Proxy / API)
        HTML, JS, CSS       │                  │ /api/*
                            ▼                  ▼
                  ┌──────────────────┐   ┌──────────────────────────────┐
                  │  React + Vite    │   │ Node.js Backend (Express)    │
                  │  (Production)    │   │ Port: 5000 / Phusion Passeng.│
                  └──────────────────┘   └──────────────┬───────────────┘
                                                        │
                                                        ▼
                                         ┌──────────────────────────────┐
                                         │ Database MariaDB / MySQL     │
                                         │ cPanel Database & phpMyAdmin │
                                         └──────────────────────────────┘
```

- **Frontend**: React.js + Vite + TailwindCSS. Dihasilkan menjadi file statis (`index.html`, bundle JS/CSS) dan diletakkan di `public_html`.
- **Backend**: Node.js + Express.js. Dijalankan menggunakan fitur **Setup Node.js App** (Phusion Passenger) atau via `nohup`/background service di folder `repositories/web-kknvidyavardhana/backend`.
- **Database**: MariaDB / MySQL dikelola lewat phpMyAdmin di cPanel.

---

## 🔐 2. Konfigurasi Awal (Environment Variables)

Sebelum aplikasi dijalankan, pastikan file konfigurasi rahasia (`.env`) sudah ada di folder `backend/`:

### Lokasi: `backend/.env`
```env
PORT=5000
DB_HOST=localhost
DB_USER=vidt4129_kkn_user      # Ganti sesuai user DB di cPanel
DB_PASS=PasswordDbCpanel123!   # Ganti sesuai password DB di cPanel
DB_NAME=vidt4129_kkn_db        # Ganti sesuai nama DB di cPanel
JWT_SECRET=kkn_vidyavardhana_secret_super_aman_2024

# Konfigurasi SMTP Email Notifikasi (Port 587 TLS)
EMAIL_USER=kknvidyavardhana@gmail.com
EMAIL_PASS=nyvffscwlmhqzhgj    # Google App Password 16 karakter
```

> **PERINGATAN KEAMANAN**:
> **JANGAN PERNAH** mengunggah (commit) file `.env` ke repository GitHub publik! File ini harus dibuat langsung di server cPanel melalui File Manager atau terminal SSH.

---

## ⚡ 3. Cara Update Cepat ke cPanel (Alur Harian)

Jika Anda baru saja melakukan perubahan kode di komputer lokal dan telah melakukan `git push origin main`, ikuti langkah berikut untuk meng-update server:

### Opsi 1: Menggunakan Script Otomatis (Direkomendasikan)
1. Buka **Terminal SSH** di cPanel (atau via PuTTY / Terminal VS Code SSH).
2. Masuk ke folder repository proyek:
   ```bash
   cd repositories/web-kknvidyavardhana
   ```
3. Jalankan script restart yang sudah disiapkan:
   ```bash
   bash restart-server.sh
   ```
4. Selesai! Script ini secara otomatis akan:
   - Mengaktifkan Node.js Virtual Environment.
   - Menarik kode terbaru dari GitHub (`git fetch origin && git reset --hard origin/main`).
   - Menginstall library backend baru jika ada (`npm install`).
   - Merestart proses Node.js dan memperbarui trigger Passenger (`backend/tmp/restart.txt`).

---

### Opsi 2: Update Manual Langkah-demi-Langkah
Jika Anda ingin menjalankan perintah satu per satu:

```bash
# 1. Masuk ke folder repo
cd repositories/web-kknvidyavardhana

# 2. Tarik kode terbaru dari GitHub
git fetch origin
git reset --hard origin/main

# 3. Masuk ke backend & install dependensi baru (jika ada)
cd backend
npm install

# 4. Restart aplikasi Node.js
# Cara A: Lewat touch restart.txt (Phusion Passenger)
mkdir -p tmp
touch tmp/restart.txt

# Cara B: Matikan proses lama dan jalankan ulang di background
pkill -f "node server.js" || true
nohup node server.js > server.log 2>&1 &
```

Selain via terminal, Anda juga bisa menekan tombol **RESTART** pada menu **Setup Node.js App** di cPanel.

---

## 🎨 4. Cara Update Frontend (Tampilan Web)

Frontend dibangun menggunakan **Vite**. Kode JSX di folder `frontend/src/` tidak bisa langsung dibaca oleh browser sebelum di-*build*.

### Jika Mengompilasi di Komputer Lokal (Paling Cepat & Stabil):
1. Buka terminal di laptop Anda:
   ```bash
   cd frontend
   npm run build
   ```
2. Folder baru bernama `dist/` akan terbentuk di dalam `frontend/`.
3. Buka **File Manager** cPanel.
4. Masuk ke folder `public_html/`.
5. Upload seluruh isi yang ada di dalam folder `frontend/dist/` ke `public_html/`.
   *(Pastikan file `index.html` dan folder `assets/` berada langsung di dalam `public_html/`)*.

### File Penting: `.htaccess` di `public_html`
Agar routing React (React Router DOM) tidak menghasilkan error **404 Not Found** saat pengguna me-refresh halaman (misal: `/login`, `/dashboard`), pastikan file `.htaccess` di `public_html` memiliki konfigurasi ini:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  # Arahkan permintaan API ke backend Node.js jika menggunakan reverse proxy
  RewriteRule ^api/(.*)$ http://127.0.0.1:5000/api/$1 [P,L]
  RewriteRule ^uploads/(.*)$ http://127.0.0.1:5000/uploads/$1 [P,L]

  # Routing SPA Frontend
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

---

## 🗄️ 5. Cara Update Database (Migrasi SQL)

Jika ada penambahan fitur baru (seperti kolom email, Google Auth, atau token multi-login), **JANGAN ME-RESET ATAU MEN-DROP TABEL** yang sudah ada di cPanel karena akan menghapus artikel dan akun yang sudah live!

### Langkah Update Database via phpMyAdmin:
1. Login ke **cPanel** -> Buka **phpMyAdmin**.
2. Pilih database web KKN Anda (misal: `vidt4129_kkn_db`).
3. Klik tab **SQL** di bagian atas.
4. Jalankan query penambahan kolom yang aman (menggunakan klausa `IF NOT EXISTS` atau per kolom):

```sql
-- Tambah kolom email jika belum ada
ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(191) NULL AFTER username;

-- Tambah kolom google_id untuk Sign in with Google
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(100) NULL AFTER status;

-- Tambah kolom untuk mendeteksi login aktif & fitur tendang sesi ganda (Force Kick)
ALTER TABLE users ADD COLUMN IF NOT EXISTS active_token TEXT NULL AFTER google_id;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_active DATETIME NULL AFTER active_token;
```

5. Klik tombol **Go / Kirim**. Data akun lama akan tetap utuh tanpa terhapus!

---

## 🛠️ 6. Checklist Pemecahan Masalah (Troubleshooting)

| Masalah | Penyebab | Solusi |
| :--- | :--- | :--- |
| **Halaman blank putih / 404 saat refresh** | Browser tidak menemukan route fisik file. | Periksa file `.htaccess` di `public_html`, pastikan ada aturan *rewrite* ke `/index.html`. |
| **Error 500 / 503 Backend** | Script Node.js berhenti atau ada dependensi yang kurang. | Masuk ke terminal SSH, jalankan `cat repositories/web-kknvidyavardhana/backend/server.log` untuk membaca pesan error. |
| **Port 5000 EADDRINUSE** | Proses node lama masih menyala di latar belakang. | Jalankan `pkill -f "node server.js"` di terminal, tunggu 2 detik, lalu jalankan ulang. |
| **Tombol Login Google tidak muncul** | Domain cPanel belum didaftarkan di Google Cloud Console. | Buka Google Cloud Console -> Tambahkan `https://domainanda.com` ke Authorized JavaScript Origins. |
| **Email tidak terkirim** | Port 465 terblokir firewall hosting. | Pastikan `port: 587` dan `secure: false` di `backend/utils/email.js`. Lihat panduan `fixemail.md`. |

---

*Dokumentasi disusun untuk tim pengembang Web KKN Kelompok 7 Vidya Vardhana.*
