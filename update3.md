# 📝 Changelog & Laporan Pembaruan (Update 3)

Dokumen ini merangkum seluruh pekerjaan pembaruan sistem pada fase ketiga pengembangan **Web KKN Vidya Vardhana**. Laporan ini mencakup penambahan fitur konversi format foto iPhone (HEIC), perbaikan pratinjau tautan media sosial (WhatsApp Open Graph Preview), perbaikan penomoran daftar artikel (*Numbered List*), stabilitas akun administrator, perombakan menyeluruh halaman **Galeri Media (Pagination, Pinterest Masonry, & 3-Kolom Responsif)**, serta **panduan teknis mengatasi kendala keterlambatan pembaruan kode di cPanel**.

---

## 📌 DAFTAR ISI
1. [Rangkuman Pembaruan Sistem & Fitur Baru](#-1-rangkuman-pembaruan-sistem--fitur-baru)
   - [A. Dukungan Format Foto iPhone (HEIC/HEIF)](#a-dukungan-format-foto-iphone-heicheif)
   - [B. Pratinjau Tautan WhatsApp & Metadata Open Graph](#b-pratinjau-tautan-whatsapp--metadata-open-graph)
   - [C. Perbaikan Format Rich Text Editor & Daftar Bernomor (Numbered List)](#c-perbaikan-format-rich-text-editor--daftar-bernomor-numbered-list)
   - [D. Stabilitas Autentikasi & Akun Administrator Database](#d-stabilitas-autentikasi--akun-administrator-database)
   - [E. Perombakan Total Halaman Galeri Media & Konten Tersemat](#e-perombakan-total-halaman-galeri-media--konten-tersemat)
2. [Panduan Teknis: Mengatasi Keterlambatan Update di cPanel](#-2-panduan-teknis-mengatasi-keterlambatan-update-di-cpanel)
   - [A. Mengapa Pembaruan Terlambat Muncul di Website?](#a-mengapa-pembaruan-terlambat-muncul-di-website)
   - [B. Peran Vital `npm --prefix frontend run build`](#b-peran-vital-npm---prefix-frontend-run-build)
   - [C. SOP / Prosedur Standar Rilis Pembaruan (Workflow)](#c-sop--prosedur-standar-rilis-pembaruan-workflow)
3. [Tabel Rangkuman File yang Dimodifikasi](#-3-tabel-rangkuman-file-yang-dimodifikasi)

---

## 🚀 1. Rangkuman Pembaruan Sistem & Fitur Baru

### A. Dukungan Format Foto iPhone (HEIC/HEIF)
* **Masalah**: Foto dokumentasi kegiatan yang diambil langsung menggunakan perangkat Apple (iPhone/iPad) berformat `.heic` atau `.heif`. Format ini ditolak oleh browser dan gagal ditampilkan di galeri web karena bukan format web standar.
* **Solusi & Implementasi**:
  1. Dibuat modul helper otomatis [frontend/src/utils/heicHelper.js](file:///d:/kknvidyavadhana-web/frontend/src/utils/heicHelper.js) yang memanfaatkan pustaka `heic2any`.
  2. Saat pengguna memilih file foto `.heic`/`.heif`, sistem di sisi browser secara transparan mengonversinya menjadi format JPEG berkualitas tinggi sebelum berkas dikirimkan ke server backend.
  3. Memperluas atribut `accept="image/*,.heic,.HEIC,.heif,.HEIF"` pada seluruh formulir input gambar (Formulir Berita/Artikel, Foto Sampul, Foto Profil Anggota, dan Logo Posko).

### B. Pratinjau Tautan WhatsApp & Metadata Open Graph
* **Masalah**: Saat artikel atau tautan website dibagikan melalui WhatsApp, kartu pratinjau (*link preview*) tidak menampilkan gambar sampul, judul artikel, atau ringkasan cerita.
* **Solusi & Implementasi**:
  1. **Batas Ukuran WhatsApp (< 300 KB)**: Crawler WhatsApp secara otomatis menolak gambar pratinjau yang memiliki ukuran berkas di atas 300 KB. Di backend, diterapkan kompresi dan *resizing* otomatis menggunakan `sharp` khusus untuk endpoint berbagi tautan.
  2. **Endpoint Khusus Crawler Sosial**: Dibuat rute backend `/api/share/article/:slug` yang menyajikan tag HTML Open Graph statis (`og:title`, `og:image`, `og:description`, `og:url`) sehingga bot/crawler WhatsApp, Facebook, dan Telegram dapat membaca informasi metadata tanpa harus mengeksekusi JavaScript.
  3. **Penyesuaian Server Web (`.htaccess`)**: Dikonfigurasikan aturan *rewrite* agar bot crawler yang mengunjungi URL artikel secara otomatis diarahkan ke generator metadata pratinjau yang sesuai.

### C. Perbaikan Format Rich Text Editor & Daftar Bernomor (Numbered List)
* **Masalah**: Pada saat admin menyusun artikel dengan format daftar bernomor (*ordered list* `<ol>`), angka penomoran (1, 2, 3...) tidak muncul di halaman pembaca artikel (tampil rata seperti paragraf biasa).
* **Solusi & Implementasi**:
  1. Tailwind CSS secara *default* menerapkan *CSS reset* yang menghilangkan gaya bawaan browser (`list-style: none`).
  2. Dilakukan perbaikan pada komponen penampil artikel dengan menambahkan kelas spesifik `list-decimal list-inside space-y-1` langsung pada elemen `<ol>` dan `<li>`.
  3. Mengatasi pembatasan kapasitas upload gambar *inline* pada editor artikel (Quill) agar artikel yang panjang dengan banyak ilustrasi tetap tersimpan dengan lancar.

### D. Stabilitas Autentikasi & Akun Administrator Database
* **Masalah**: Ketika kredensial akun bawaan (`admin` / `admin123`) diubah atau dihapus melalui phpMyAdmin, server secara otomatis membuat ulang akun bawaan tersebut sehingga terjadi duplikasi akun atau sandi kembali ke pengaturan pabrik.
* **Solusi & Implementasi**:
  1. Memodifikasi skrip inisialisasi pada backend autentikasi (`backend/server.js` / rute auth).
  2. Server kini memeriksa apakah tabel pengguna sudah memiliki data. Jika tabel telah berisi data admin kustom, server **tidak akan pernah lagi** membuat ulang atau menimpa sandi akun administrator bawaan.
  3. Admin memiliki kebebasan penuh untuk mengubah username, password, atau menghapus akun bawaan langsung dari antarmuka database phpMyAdmin secara aman.

### E. Perombakan Total Halaman Galeri Media & Konten Tersemat
Halaman [frontend/src/pages/Media.jsx](file:///d:/kknvidyavadhana-web/frontend/src/pages/Media.jsx) mendapatkan peningkatan performa dan estetika paling signifikan:

1. **Sistem Pagination (Paginasi Cerdas)**:
   - Menampilkan banyak video YouTube, Instagram Reels, dan TikTok sekaligus dalam satu halaman menyebabkan waktu pemuatan (*load time*) website menjadi berat dan menghabiskan memori RAM pengguna.
   - Diterapkan paginasi dinamis dengan pemilih jumlah video per halaman: **6, 9, 12, atau 18 video**.
   - Dilengkapi nomor halaman interaktif (`< Sebelumnya`, `1`, `2`, `Berikutnya >`), serta otomatis menggulir (*smooth scroll*) kembali ke awal galeri saat halaman diganti.
   - Paginasi otomatis mereset ke halaman 1 jika pengguna melakukan pencarian teks atau mengubah filter platform.

2. **Pinterest Masonry Grid (Bebas Whitespace)**:
   - Galeri memadukan video format lanskap (YouTube rasio 16:9) dan video format potret (TikTok/Reels rasio 9:16). Pada grid standar CSS biasa, perbedaan tinggi ini menciptakan ruang kosong putih (*gap*) yang sangat mengganggu.
   - Dibuatkan arsitektur **Pinterest Masonry sejati**: item video didistribusikan secara merata ke dalam kolom-kolom independen (`columnsData`) sehingga setiap kartu tersusun rapat ke atas tanpa rongga vertikal kosong.

3. **Responsive Video Embed Player**:
   - Pemutar video pihak ketiga (khususnya TikTok v2 dan Instagram Embed) memiliki lebar bawaan sekitar 320px.
   - Dibuat komponen `ResponsiveVideoEmbed` yang secara dinamis menghitung lebar kartu dan menerapkan `transform: scale()` presisi. Video TikTok dan Instagram tidak akan lagi terpotong (*cropped*), tidak mengalami efek *zoom-in*, dan tidak menampilkan scrollbar ganda di dalam kartu.

4. **Standardisasi Lebar Kontainer 1152px (`max-w-6xl`) & Layout 3-Kolom Simetris**:
   - Lebar halaman diselaraskan menjadi `max-w-6xl` (1152px), identik dengan halaman Berita dan Profil.
   - Galeri video diatur ke dalam **3 kolom berjajar simetris** pada layar desktop (`>= 880px`), **2 kolom** pada tablet (`>= 540px`), dan **1 kolom** pada layar HP.
   - Tata letak ini menghasilkan lebar kartu yang sangat ideal (~360px per kartu), selaras sempurna dengan 3 kotak Saluran Media Sosial di bagian atas.
   - Ukuran font judul, ringkasan caption, tombol aksi "Bagikan / Sumber / Tonton", dan ketebalan border Neo-Brutalist disesuaikan secara proporsional.

---

## 🛠️ 2. Panduan Teknis: Mengatasi Keterlambatan Update di cPanel

Salah satu pertanyaan mendasar dalam alur kerja pengembangan web modern adalah:
> *"Mengapa setelah kode diubah dan di-push ke GitHub, tampilan di website cPanel tidak langsung berubah atau masih menampilkan versi lama?"*

Berikut adalah penjelasan mendalam tentang mekanisme build dan solusi praktisnya.

### A. Mengapa Pembaruan Terlambat Muncul di Website?

Terdapat **3 penyebab utama** keterlambatan pembaruan kode pada lingkungan hosting cPanel:

#### 1. Arsitektur Single Page Application (React + Vite)
Frontend web ini dibangun menggunakan **React (Vite)**. Kode yang kita tulis di dalam folder `frontend/src/` (file `.jsx`, `.css`, dll.) adalah **kode sumber (*source code*)**, bukan file yang dijalankan langsung oleh browser pengguna.
Browser hanya membaca file statis hasil kompilasi yang ada di dalam folder:
```
frontend/dist/
├── index.html
└── assets/
    ├── index-CG7qm4_u.js   <-- Hasil bundle Javascript
    └── index-DMt5a2Mg.css  <-- Hasil bundle CSS
```
Jika kita mengedit file di `frontend/src/` tetapi **tidak menjalankan proses build**, maka folder `frontend/dist/` masih berisi file kompilasi lama. Akibatnya, server cPanel akan tetap menyajikan kode lama kepada pengunjung website.

#### 2. cPanel Tidak Mengompilasi Frontend Secara Mandiri
Pada skrip deploy [restart-server.sh](file:///d:/kknvidyavadhana-web/restart-server.sh), langkah yang dilakukan untuk frontend adalah:
```bash
# Salin seluruh isi dist yang ada di repositori ke public_html
cp -r frontend/dist/. /home/vidt4129/public_html/
```
Server cPanel **sengaja tidak menjalankan `npm run build`** di hosting karena kapasitas CPU dan RAM shared hosting/cPanel sangat terbatas. Mengompilasi React di server hosting berisiko tinggi menyebabkan *Out of Memory (OOM)*, proses terhenti di tengah jalan, atau hosting terblokir akibat lonjakan beban server.
Oleh karena itu, **proses kompilasi (build) wajib dilakukan di komputer pengembang** sebelum kode di-push ke GitHub.

#### 3. Caching Browser Pengguna
Browser modern (Google Chrome, Mozilla Firefox, Microsoft Edge, Safari) secara agresif menyimpan cache file HTML, CSS, dan JS agar halaman memuat lebih cepat saat kunjungan berikutnya. Jika nama file aset tidak berganti atau browser masih menyimpan cache `index.html`, pengguna akan tetap melihat tampilan web lama hingga cache tersebut dibersihkan.

---

### B. Peran Vital `npm --prefix frontend run build`

Perintah:
```bash
npm --prefix frontend run build
```

#### Apa fungsi perintah ini?
* Opsi `--prefix frontend` memberitahukan Node.js untuk mengeksekusi perintah di dalam sub-folder `frontend` tanpa mengharuskan Anda berpindah direktori secara manual menggunakan `cd frontend`.
* Perintah ini menjalankan Vite Compiler untuk memindai seluruh komponen React, membersihkan kode yang tidak digunakan (*tree-shaking*), memperkecil ukuran file (*minification*), dan menyusun ulang seluruh aset ke dalam folder `frontend/dist/`.

#### Fitur Cache-Busting Otomatis
Setiap kali Anda menjalankan build, Vite secara otomatis memberikan nama hash unik pada file aset yang berubah, misalnya:
* Dari: `index-BPA4j5wG.js`
* Menjadi: `index-CG7qm4_u.js`

Karena nama filenya berubah di dalam `frontend/dist/index.html`, browser pengguna **dipaksa untuk langsung mengunduh file terbaru** dan tidak akan menggunakan cache lama lagi (*cache busting*).

#### Kapan Perintah Ini Wajib Dijalankan?
Jalankan perintah ini **SETIAP KALI** Anda selesai mengubah file apa pun di dalam:
* `frontend/src/...` (komponen JSX, halaman, hook, utilitas)
* `frontend/public/...` (aset statis publik)
* `frontend/index.html` atau konfigurasi Tailwind/Vite.

---

### C. SOP / Prosedur Standar Rilis Pembaruan (Workflow)

Ikuti 4 langkah sederhana berikut agar setiap pembaruan kode langsung aktif di cPanel tanpa hambatan:

```
[Edit Kode di frontend/src] 
         ⬇
[npm --prefix frontend run build]  <-- Wajib! Menghasilkan dist/ terbaru
         ⬇
[git add, commit & push]          <-- Mengirim source code + dist/ ke GitHub
         ⬇
[bash restart-server.sh di cPanel] <-- Menarik dist/ baru & restart server
```

#### Langkah 1: Kompilasi Frontend di Komputer Lokal
Setelah selesai melakukan penyesuaian kode, buka terminal VS Code / Antigravity dan jalankan:
```bash
npm --prefix frontend run build
```
*Pastikan proses build selesai dengan tanda hijau `✓ built in ...s` dan kode exit `0`.*

#### Langkah 2: Simpan dan Unggah ke GitHub
Kirim seluruh perubahan kode beserta file hasil kompilasi di folder `dist/`:
```bash
git add -A
git commit -m "feat/fix: penjelasan singkat pembaruan"
git push origin main
```

#### Langkah 3: Eksekusi Deploy di Terminal cPanel
Buka menu **Terminal** di dashboard cPanel Anda, lalu jalankan perintah:
```bash
bash restart-server.sh
```

Skrip ini akan bekerja secara otomatis dalam hitungan detik:
1. Menarik kode terbaru dari GitHub (`git reset --hard origin/main`).
2. Memeriksa apakah ada paket baru di backend.
3. Menghapus aset lama di `public_html/assets/` dan menyalin isi `frontend/dist/` terbaru.
4. Mematikan proses Node.js lama dan menyalakan proses baru di port 5000 (*anti-zombie process*).
5. Menguji kesehatan endpoint API server.

#### Langkah 4: Bersihkan Cache Browser Klien
Buka website Anda (`https://vidyavardhana.my.id/media`) dan lakukan **Hard Refresh**:
* **Windows (Chrome / Edge / Firefox)**: Tekan `Ctrl + F5` atau `Ctrl + Shift + R`.
* **Mac (Safari / Chrome)**: Tekan `Cmd + Shift + R`.
* **Smartphone**: Buka melalui tab penyamaran (*Incognito / Private tab*) atau hapus data penjelajahan (*Clear Browsing Data*) pada browser HP.

---

## 📂 3. Tabel Rangkuman File yang Dimodifikasi

Berikut rincian berkas yang telah diperbarui pada rilis **Update 3**:

| Lokasi Berkas | Kategori | Keterangan Pembaruan |
| :--- | :--- | :--- |
| [frontend/src/pages/Media.jsx](file:///d:/kknvidyavadhana-web/frontend/src/pages/Media.jsx) | **Frontend** | Implementasi sistem Paginasi, Pinterest Masonry layout, komponen `ResponsiveVideoEmbed`, dan standardisasi grid 3-kolom (1152px). |
| [frontend/src/utils/heicHelper.js](file:///d:/kknvidyavadhana-web/frontend/src/utils/heicHelper.js) | **Frontend** | Modul utilitas konversi format foto iPhone (`.heic`/`.heif`) ke JPEG berbasis klien. |
| [frontend/src/pages/UploadForm.jsx](file:///d:/kknvidyavadhana-web/frontend/src/pages/UploadForm.jsx) | **Frontend** | Integrasi konversi HEIC otomatis dan pembesaran batas input berkas sampul artikel. |
| [frontend/src/components/RichTextEditor.jsx](file:///d:/kknvidyavadhana-web/frontend/src/components/RichTextEditor.jsx) | **Frontend** | Perbaikan rendering penomoran daftar bertingkat (*numbered list* `<ol>`) dan optimasi upload gambar inline. |
| [backend/routes/shareRoutes.js](file:///d:/kknvidyavadhana-web/backend/routes/shareRoutes.js) | **Backend** | Endpoint khusus pembangkit Open Graph meta tags dan kompresi thumbnail < 300 KB untuk WhatsApp link preview. |
| [backend/server.js](file:///d:/kknvidyavadhana-web/backend/server.js) | **Backend** | Perlindungan akun admin dari auto-seed; mengizinkan perubahan username/password dan penghapusan data akun di phpMyAdmin. |
| [restart-server.sh](file:///d:/kknvidyavadhana-web/restart-server.sh) | **DevOps** | Skrip deploy otomatis cPanel: sinkronisasi git, pembersihan aset lawas di `public_html`, penyalinan `dist/`, dan restart Node.js anti-zombie. |
| [frontend/dist/](file:///d:/kknvidyavadhana-web/frontend/dist/) | **Build Output** | Berkas bundel statis terkompilasi siap tayang untuk browser produksi. |
| `update3.md` / `catatan/update3.md` | **Dokumentasi** | Laporan teknis lengkap Update 3 dan panduan operasional cPanel. |

---

> 💡 **Tips Pengembang**: Jika di masa mendatang Anda menambahkan video baru melalui dashboard admin dan ingin video tersebut langsung tampil rapi di galeri, Anda **tidak perlu mengedit kode atau melakukan build ulang**. Cukup tambahkan URL video melalui Dashboard Admin, dan sistem Paginasi serta Pinterest Masonry akan langsung menyusun kartu video tersebut secara otomatis.
