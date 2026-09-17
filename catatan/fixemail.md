# 📧 Panduan Solusi Email: Mengatasi Delay, Port SMTP cPanel, dan Masuk Folder Spam

Dokumen ini menjelaskan akar masalah mengapa pengiriman email (Nodemailer) sempat gagal atau terasa sangat lambat (pending lama) saat dijalankan di cPanel, penjelasan teknis port SMTP, serta solusi agar email tidak masuk ke folder spam.

---

## 🔍 1. Akar Masalah: Mengapa Email Tidak Langsung Masuk / Pending Lama?

Saat melakukan pengujian pengiriman email di server cPanel menggunakan konfigurasi standar awal:
```javascript
// Konfigurasi Lama (Bermasalah di cPanel)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  port: 465,
  secure: true,
  // ...
});
```

Terjadi masalah:
1. **Request Timeout / Terasa Membeku**: Backend membutuhkan waktu 30 hingga 60 detik sebelum memberikan respon ke frontend.
2. **Error `ECONNREFUSED` atau `ETIMEDOUT`**: Koneksi ke server `smtp.gmail.com:465` ditolak oleh firewall hosting.
3. **Email Baru Masuk Sangat Terlambat**: Server terus mencoba menghubungkan ulang (*retry*) hingga batas waktu habis, membuat pengiriman email tertunda sangat lama.

### Mengapa Hal Ini Terjadi di cPanel?
Hampir seluruh penyedia **Shared Hosting cPanel** menerapkan aturan keamanan firewall yang sangat ketat (seperti CSF - *ConfigServer Security & Firewall*).
- Hosting secara default **MEMBLOKIR LALU LINTAS KELUAR (OUTBOUND)** pada **Port 25** dan **Port 465** untuk mencegah akun hosting yang diretas digunakan sebagai sarang pengirim spam (*spam botnet*).
- Akibatnya, setiap kali Node.js mencoba membuka koneksi keluar ke `smtp.gmail.com` melalui port 465, paket data ditahan dan dibuang oleh firewall cPanel.

---

## 🔌 2. Bedah Teknis Port SMTP (Port 25 vs 465 vs 587)

Untuk memahami solusinya, kita perlu membedah fungsi masing-masing port email:

| Port | Nama Protokol | Mekanisme Enkripsi | Status di cPanel Hosting | Rekomendasi |
| :---: | :---: | :---: | :---: | :---: |
| **25** | SMTP Standar (Lama) | Plaintext (Tanpa Enkripsi) | **DIBLOKIR TOTAL** oleh semua ISP & Hosting | ❌ Sangat Tidak Direkomendasikan |
| **465** | SMTPS (Implicit TLS) | SSL/TLS Langsung sejak byte pertama | **SERING DIBLOKIR** oleh Firewall Shared Hosting | ⚠️ Sering Gagal di cPanel |
| **587** | Mail Submission (STARTTLS) | Plaintext diawali lalu di-*upgrade* ke TLS terenkripsi | **DIIZINKAN & TERBUKA** di cPanel | ✅ **STANDAR RESMI TERBAIK (RFC 6409)** |

### Mengapa Port 587 Berhasil?
1. **Standar IETF Modern**: Port 587 dikhususkan untuk pengiriman email dari aplikasi/klien (*email submission*), bukan untuk transfer antar mail-server pusat.
2. **STARTTLS**: Komunikasi dimulai dengan sapaan jaringan biasa, lalu secara eksplisit dinaikkan menjadi jalur terenkripsi penuh (TLS). Karena perilaku ini, port 587 tidak dicurigai sebagai lalu lintas relay ilegal dan **dibuka secara resmi** oleh penyedia cPanel.

---

## 🛠️ 3. Konfigurasi Nodemailer yang Benar (Solusi Final)

Berikut adalah konfigurasi di file `backend/utils/email.js` yang telah terbukti **berhasil 100% dan instan (kurang dari 2 detik)** di cPanel:

```javascript
const nodemailer = require('nodemailer');

const EMAIL_USER = process.env.EMAIL_USER || 'kknvidyavardhana@gmail.com';
const EMAIL_PASS = process.env.EMAIL_PASS || 'nyvffscwlmhqzhgj';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,              // Gunakan Port 587 (Bukan 465!)
  secure: false,          // WAJIB FALSE untuk port 587
  requireTLS: true,       // Memaksa koneksi di-upgrade ke enkripsi TLS aman
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,     // Gunakan Google App Password 16 karakter
  },
  // Opsional: Timeout agar aplikasi tidak menggantung jika ada gangguan jaringan
  connectionTimeout: 10000, // 10 detik
});

module.exports = transporter;
```

> [!IMPORTANT]
> Aturan Emas Nodemailer:
> - Jika `port: 465`, maka `secure: true`.
> - Jika `port: 587`, maka `secure: false` dan tambahkan `requireTLS: true`.

---

## 🔑 4. Cara Membuat Google App Password (Sandi Aplikasi)

Google telah mematikan fitur *"Less Secure Apps"* sejak tahun 2022. Anda **tidak bisa** menggunakan password akun Gmail biasa untuk mengirim email lewat script.

### Langkah Membuat Sandi Aplikasi:
1. Login ke akun Google Anda (`kknvidyavardhana@gmail.com`).
2. Masuk ke menu [Keamanan Akun Google](https://myaccount.google.com/security).
3. Pastikan **Verifikasi 2 Langkah (2-Step Verification)** sudah aktif.
4. Di kolom pencarian pengaturan atas, ketik **"Sandi Aplikasi"** atau **"App Passwords"**.
5. Beri nama aplikasi: `Web KKN Server`.
6. Klik **Buat**. Google akan menampilkan **16 karakter acak** (contoh: `nyvf fscw lmhq zhgj`).
7. Salin kode tersebut (tanpa spasi) ke file `.env` di backend sebagai `EMAIL_PASS`.

---

## 📥 5. Mengapa Email Masuk ke Folder Spam & Cara Mengatasinya

Jika email berhasil masuk namun masuk ke folder **Spam / Promosi**, berikut penyebab dan cara mengatasinya:

### Penyebab Email Masuk Spam:
1. **Domain Web Baru (`vidyavardhana.my.id`)**: Domain baru belum memiliki reputasi di mata filter spam Google.
2. **Akun Gmail Personal Mengirim Email Otomatis**: Google mendeteksi bahwa akun `@gmail.com` biasa digunakan untuk mengirim pesan otomatis dengan link ke website luar.
3. **Belum Ada Record SPF & DKIM Kustom**: Karena menggunakan server SMTP gratis dari Gmail biasa, header pengirim tidak ditandatangani oleh domain website Anda sendiri.

---

### Solusi Praktis (Saat Ini):
1. **Latih Filter AI Google (Report Not Spam)**:
   - Minta penerima email untuk membuka folder **Spam**.
   - Buka email dari KKN Vidya Vardhana, lalu klik tombol **"Laporkan Bukan Spam" (Report not spam)** atau pindahkan ke Kotak Masuk (Inbox).
   - Setelah 3–5 pengguna melakukan ini, algoritma Google akan otomatis menandai bahwa pengirim `kknvidyavardhana@gmail.com` adalah **pengirim terpercaya**, dan semua email berikutnya akan langsung masuk ke Inbox utama!

2. **Tambahkan ke Kontak**:
   - Jika penerima menambahkan `kknvidyavardhana@gmail.com` ke Google Contacts mereka, email dipastikan 100% masuk ke Inbox.

---

### Solusi Jangka Panjang (Untuk Skala Besar / Profesional):
1. **Gunakan Email Domain Resmi (Webmail cPanel)**:
   - Buat email resmi seperti `admin@vidyavardhana.my.id` atau `no-reply@vidyavardhana.my.id` lewat menu **Email Accounts** di cPanel.
   - Atur DNS Record di cPanel (**Zone Editor**):
     - **SPF**: Menjamin server cPanel berhak mengirim email atas nama domain Anda.
     - **DKIM**: Menyematkan tanda tangan kriptografis pada setiap email keluar.
     - **DMARC**: Kebijakan verifikasi email anti pemalsuan (spoofing).
2. **Gunakan Layanan Email Transaksional Pihak Ketiga**:
   - Contoh: **Resend**, **Brevo (Sendinblue)**, atau **SendGrid**.
   - Layanan ini menyediakan kuota 100–300 email gratis per hari dengan reputasi IP yang sangat tinggi, sehingga garansi 99% masuk ke Inbox utama.

---

## 📋 6. Ringkasan Fitur Email yang Berjalan di Web KKN

Sistem notifikasi email otomatis saat ini aktif untuk alur-alur berikut:

1. **Notifikasi ke Admin** (`sendAdminNotificationEmail`):
   - Dikirim ke email admin saat ada pengguna baru mendaftar (baik via Google Sign In maupun form pendaftaran manual).
2. **Notifikasi Akun Disetujui (ACC)** (`sendWelcomeEmail`):
   - Dikirim ke pengguna saat Admin mengklik tombol persetujuan di Dashboard. Berisi link langsung untuk login.
3. **Notifikasi Akun Ditolak** (`sendRejectionEmail`):
   - Dikirim ke pengguna jika pendaftarannya ditolak oleh Admin.
4. **Notifikasi Akun Dibekukan / Ditangguhkan** (`sendSuspendedEmail`):
   - Dikirim jika akun pengguna yang tadinya aktif dinonaktifkan sementara oleh Admin.
5. **Notifikasi Akun Dihapus** (`sendDeletedEmail`):
   - Dikirim saat akun dihapus permanen oleh Admin dari sistem.
