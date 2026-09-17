# 📝 Changelog & Laporan Pembaruan (Update 1)

Dokumen ini merangkum seluruh perbaikan (*bug fixes*), penambahan fitur baru, serta peningkatan desain dan keamanan yang telah kita kerjakan untuk mengembangkan web **KKN Vidya Vardhana** pada fase ini.

---

## 🌟 1. Penambahan Fitur Modern
- **Integrasi Google Sign-In (OAuth 2.0)**:
  - **Frontend**: Menambahkan pustaka `@react-oauth/google` untuk menampilkan tombol login cerdas (Google One Tap & Tombol Standar) di halaman `Login.jsx` menggunakan `GoogleOAuthProvider`.
  - **Backend**: Menggunakan pustaka `google-auth-library` untuk memverifikasi keaslian dan keamanan JWT (ID Token) yang dikirim oleh frontend.
  - **Database**: Menambahkan kolom `google_id` pada tabel `users` MySQL untuk menautkan akun Google secara mulus. Jika belum punya akun, sistem akan membuatkan otomatis berstatus `pending`.

## 🛠️ 2. Perbaikan Isu Krusial (Bug Fixes & Troubleshooting)
- **Mengatasi Email Delay & Timeout (Port SMTP)**:
  - **Masalah**: Pengiriman notifikasi email terasa membeku lalu *error* (`ECONNREFUSED` / Timeout) saat web di-deploy ke cPanel. Hal ini disebabkan firewall cPanel yang memblokir lalulintas keluar dari Port 465.
  - **Solusi**: Mengubah konfigurasi port Nodemailer di `backend/utils/email.js` dari `465` (Implicit SSL) menjadi **`587`** (Mail Submission). Ditambah pengaturan `secure: false` dan `requireTLS: true`. Kini email terkirim 100% instan!
- **Penanganan Sisa Kode Mati (Syntax Error Prevention)**:
  - Membersihkan *junk code* (sisa kurung kurawal `} else {` dan `catch`) peninggalan endpoint `/test-email` di baris terbawah file `backend/routes/authRoutes.js` yang berpotensi memicu *fatal crash* saat server Node.js di-restart.

## 🛡️ 3. Peningkatan Keamanan (Security Patches)
- **Menambal Kebocoran Data (Data Leak Alert GitGuardian)**:
  - **Masalah**: Sandi Aplikasi Google (*Google App Password*) sempat tertulis langsung di file (Hardcoded) dan terekspos secara publik di GitHub.
  - **Solusi Tuntas**: 
    1. Mengamankan file `email.js` agar hanya membaca dari memori sistem (`process.env.EMAIL_PASS`).
    2. Menghapus sandi lama dan membuat sandi baru.
    3. Menginstruksikan penyimpanan sandi hanya di file `.env` yang terisolasi dari GitHub (menggunakan `.gitignore`).
    4. Membersihkan *commit history* GitHub dari rekam jejak password tersebut.

## 🎨 4. Pengembangan Desain UI & UX
- **Redesign Template HTML Email (Neo-Brutalism)**:
  - Merombak total 5 *template* notifikasi email yang dikirim sistem (Welcome/ACC, Penolakan, Notifikasi Admin, Pembekuan Akun, Penghapusan Akun).
  - Tampilan email kini terasa **sangat premium** karena mengadopsi tema *Neo-Brutalism* persis seperti website utama (garis border tegas `#0f172a`, *hard drop-shadow*, font `Outfit`, dan kotak informasi estetik berwarna pastel).
- **Pesan Pesan Pengingat UX Lebih Detail**:
  - Memperbarui pesan respon saat pengguna yang berstatus `pending` mencoba *login*, di mana sistem secara spesifik meminta pengguna untuk "*mengecek email secara berkala, mengecek folder spam, dan melaporkan bukan spam*".

## 📚 5. Penulisan Dokumentasi Referensi Cepat
- Telah dibuat kumpulan modul panduan di folder `catatan/` atau di *root*:
  1. `newdeploy.md` (Panduan Deployment web ke cPanel, script `restart-server.sh`, konfigurasi file dan database).
  2. `googlelogin.md` (Penjelasan *logic flow* Google OAuth 2.0).
  3. `fixemail.md` (Pembahasan port SMTP dan solusi surel masuk ke folder *Spam*).

---
*Laporan ini dibuat sebagai arsip rekam jejak (*track record*) perbaikan web agar mudah dilanjutkan dan di-*maintain* oleh pengembang selanjutnya.*
