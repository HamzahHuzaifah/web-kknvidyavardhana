# 🚀 Panduan Optimasi Performa Web (Di Luar Koding)
### Berdasarkan Hasil Audit Google PageSpeed Insights (Desktop & Mobile)
**Domain:** `https://vidyavardhana.my.id`

---

## 📌 Ringkasan Masalah Utama Non-Koding

Dari hasil audit PageSpeed Desktop dan Mobile, sebagian besar penyebab penurunan skor **bukan lagi pada struktur kode aplikasi**, melainkan:
1. **Aset Gambar Lama di Server yang Masih Sangat Besar (Total ~10+ MB)** yang diunggah sebelum adanya fitur kompresi otomatis.
2. **Belum Aktifnya Kompresi Server (Gzip/Brotli) & Browser Caching** di tingkat cPanel / Web Server.
3. **Beban Skrip Eksternal Pihak Ketiga (YouTube Embed)** yang memakan kuota ~3 MB & mengunci *main thread* selama 1.8 detik.
4. **Kecepatan Respons Server Hosting (TTFB)** pada simulasi jaringan seluler 4G.

Berikut adalah tindakan nyata yang dapat Anda lakukan **tanpa perlu menyentuh atau merubah kode program (Non-Coding)**:

---

## 1. 🖼️ Optimasi & Penggantian Gambar Lama (Dampak Skor: +30 sampai +45 Poin)

Fitur kompresi otomatis di sistem sudah aktif untuk **semua upload baru**. Namun, file gambar yang **sudah terlanjur diunggah di masa lalu** masih tersimpan dalam ukuran mentah (kamera HP 4032x2037 px, ukuran 1.5 MB – 2.4 MB).

### A. Ganti Logo Website Utama (Sangat Mendesak)
* **Temuan Audit:** Logo `1789513687517-448983817.png` berukuran **2.14 MB (2.191 KiB)**. Ini sangat berat untuk ukuran sebuah logo (seharusnya di bawah 100 KB).
* **Solusi Non-Koding:**
  1. Siapkan file logo asli Anda.
  2. Buka situs gratis seperti [TinyPNG](https://tinypng.com) atau [Squoosh.app](https://squoosh.app).
  3. Kompres gambar logo atau simpan dalam format **WebP / PNG terkompresi** dengan dimensi maksimal lebar 500 px.
  4. Masuk ke **Dashboard Admin > Pengaturan Web / File Manager**, lalu unggah ulang logo yang sudah ramping tersebut.

### B. Upload Ulang / Kompres Foto Anggota Tim Lama
* **Temuan Audit:** Beberapa foto anggota tim memiliki bobot 1.8 MB hingga 2.37 MB per foto karena langsung dari kamera HP.
* **Solusi Non-Koding:**
  * Cukup masuk ke **Dashboard > Manajemen Anggota Tim/Profil**.
  * Klik edit foto anggota bersangkutan dan pilih kembali fotonya. Sistem frontend yang sekarang sudah otomatis mengecilkan resolusi dan mengompresnya di bawah **250 KB** secara instan saat Anda mengklik simpan.
  * Alternatif lain: Anda juga bisa mengompres folder foto di `backend/uploads/` via cPanel File Manager dengan mengunduh dan mengompresnya massal di TinyPNG.

---

## 2. ⚡ Aktifkan Fitur Akselerasi di cPanel Hosting

Konfigurasi web server cPanel menentukan seberapa cepat server mengirimkan data ke browser pengunjung.

### A. Aktifkan "Optimize Website" (Gzip Compression)
Kompresi Gzip dapat memangkas ukuran pengiriman file HTML, CSS, JavaScript, dan SVG hingga **70% lebih kecil**.
* **Langkah-langkah di cPanel:**
  1. Login ke akun **cPanel** hosting Anda.
  2. Cari menu **"Optimize Website"** (atau *"Optimalkan Situs Web"*).
  3. Pilih opsi **"Compress All Content"** (Kompres Semua Konten).
  4. Klik tombol **Update Settings**.

### B. Konfigurasi Browser Caching melalui `.htaccess` di cPanel
Browser caching memberi tahu browser pengunjung (dan crawler Google) untuk menyimpan logo, font, dan gambar selama beberapa hari/bulan agar tidak perlu diunduh berulang kali.
* **Langkah-langkah di cPanel:**
  1. Buka **File Manager** di cPanel.
  2. Masuk ke folder `public_html/` (atau direktori root domain Anda).
  3. Pastikan fitur *"Show Hidden Files (dotfiles)"* aktif di pengaturan File Manager.
  4. Buka / edit file `.htaccess` (jika menggunakan Apache/LiteSpeed), lalu pastikan modul `mod_expires` aktif:
  ```apache
  <IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/webp "access plus 1 year"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
    ExpiresByType font/woff2 "access plus 1 year"
  </IfModule>
  ```

---

## 3. 🌐 Hubungkan Website ke Cloudflare Free CDN (Sangat Direkomendasikan)

Cloudflare adalah solusi **100% gratis** paling efektif untuk mendongkrak skor PageSpeed, khususnya untuk jaringan seluler (Mobile).

### Mengapa Cloudflare?
1. **Edge Caching Global:** Halaman dan aset web Anda disalin ke puluhan server data center di Jakarta dan kota-kota dunia. Pengunjung mobile mendapatkan respon dalam hitungan milidetik.
2. **Auto Brotli & HTTP/3:** Protokol modern otomatis aktif tanpa perlu pengaturan rumit di cPanel.
3. **DDoS Protection & SSL Cepat:** Mengamankan website dari serangan bot dan menstabilkan performa.

### Langkah Aktivasi Cloudflare:
1. Daftar gratis di [Cloudflare.com](https://dash.cloudflare.com/sign-up).
2. Masukkan nama domain Anda: `vidyavardhana.my.id`.
3. Pilih paket **Free Plan**.
4. Ikuti instruksi untuk mengubah **Nameserver** di panel tempat Anda membeli domain (misalnya Niagahoster, DomaiNesia, IDCloudHost, dll) ke nameserver milik Cloudflare.
5. Di dashboard Cloudflare:
   * Masuk ke menu **Speed > Optimization**.
   * Aktifkan **Brotli** dan **Early Hints**.
   * Masuk ke menu **SSL/TLS**, pastikan mode diatur ke **Full** atau **Full (Strict)**.

---

## 4. 📹 Kebijakan Penggunaan Konten Video (YouTube Embed)

* **Temuan Audit:** Pemutar YouTube di halaman utama memuat skrip eksternal sebesar **~3 MB** dan memakan waktu pemrosesan utama (*main thread*) sebesar **1.846 ms**.
* **Solusi Non-Koding:**
  * Hindari meletakkan terlalu banyak iframe video YouTube di halaman depan/beranda yang terbuka bersamaan.
  * Jika video belum perlu langsung diputar, Anda dapat menggunakan poster thumbnail gambar biasa yang baru memuat video ketika tombol Play ditekan oleh pengunjung.

---

## 5. 🔍 Pemantauan di Google Search Console

Karena skor **SEO sudah mencapai 100/100**, langkah selanjutnya di luar koding adalah memastikan indeksasi berjalan mulus:
1. Pastikan file `sitemap.xml` telah di-submit di menu **Sitemaps** pada Google Search Console:
   * URL: `https://vidyavardhana.my.id/sitemap.xml`
2. Pantau menu **Core Web Vitals** (Pengalaman Halaman) di Search Console secara berkala (Google membutuhkan waktu 28 hari pengumpulan data pengguna riil).
3. Pastikan tidak ada link halaman berstatus error 404 pada laporan **Pages / Halaman**.

---

## 📋 Checklist Ringkas Tindakan Anda

| No | Tindakan | Lokasi | Prioritas |
|---|---|---|---|
| 1 | Kompres & upload ulang Logo website (target < 80 KB) | Dashboard Admin | ⭐⭐⭐⭐⭐ (Sangat Tinggi) |
| 2 | Upload ulang foto anggota tim lama via Dashboard (agar auto-kompres) | Dashboard Admin | ⭐⭐⭐⭐⭐ (Sangat Tinggi) |
| 3 | Aktifkan *"Optimize Website"* (Gzip) di cPanel | cPanel | ⭐⭐⭐⭐ (Tinggi) |
| 4 | Hubungkan domain ke Cloudflare (Free CDN) | Cloudflare & Registrar Domain | ⭐⭐⭐⭐ (Sangat Dianjurkan) |
| 5 | Submit `sitemap.xml` di Google Search Console | Google Search Console | ⭐⭐⭐ (Penting untuk SEO) |

---
*Dokumen ini dibuat otomatis sebagai panduan operasional performa website Vidyavardhana.*
