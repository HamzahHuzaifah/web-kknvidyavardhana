# 📊 Panduan Lengkap Menu Google Search Console: Web KKN Vidya Vardhana

Dokumen ini adalah panduan referensi praktis mengenai seluruh fitur dan fungsi bilah menu di **Google Search Console (GSC)**, lengkap dengan contoh implementasi dan kasus nyata pada website resmi **KKN Vidya Vardhana ([vidyavardhana.my.id](https://vidyavardhana.my.id))**.

---

## 📌 DAFTAR ISI
1. [Menu Utama & Analisis Performa](#-1-menu-utama--analisis-performa)
   - [Overview (Ringkasan)](#overview-ringkasan)
   - [Insights (Wawasan Konten)](#insights-wawasan-konten)
   - [Performance (Performa Pencarian)](#performance-performa-pencarian)
   - [URL Inspection (Inspeksi URL)](#url-inspection-inspeksi-url)
2. [Kelompok Indexing (Pengindeksan Halaman)](#-2-kelompok-indexing-pengindeksan-halaman)
   - [Pages (Halaman)](#pages-halaman)
   - [Videos (Video)](#videos-video)
   - [Sitemaps (Peta Situs)](#sitemaps-peta-situs)
   - [Removals (Penghapusan Sementara)](#removals-penghapusan-sementara)
3. [Kelompok Experience (Pengalaman Pengguna)](#-3-kelompok-experience-pengalaman-pengguna)
   - [Core Web Vitals (Kecepatan & Kestabilan Web)](#core-web-vitals-kecepatan--kestabilan-web)
   - [HTTPS](#https)
4. [Keamanan & Penalti (Security & Manual Actions)](#-4-keamanan--penalti-security--manual-actions)
   - [Manual Actions (Tindakan Manual)](#manual-actions-tindakan-manual)
   - [Security Issues (Masalah Keamanan)](#security-issues-masalah-keamanan)
5. [Otoritas & Pengaturan Lanjutan](#-5-otoritas--pengaturan-lanjutan)
   - [Links (Tautan & Backlink)](#links-tautan--backlink)
   - [Achievements (Pencapaian)](#achievements-pencapaian)
   - [Settings (Pengaturan)](#settings-pengaturan)
6. [💡 3 Menu Paling Penting untuk Pengelolaan Harian](#-6--3-menu-paling-penting-untuk-pengelolaan-harian)

---

## 📊 1. Menu Utama & Analisis Performa

### Overview (Ringkasan)
* **Fungsi:** Dashboard utama yang menampilkan rangkuman performa dan kesehatan website secara sekilas dalam satu layar (tren total klik, cakupan indeks halaman, performa Core Web Vitals, dan keamanan).
* **Contoh Nyata di Web KKN:** Anda membuka menu ini di awal pekan untuk memantau apakah ada anomali atau grafik merah secara mendadak pada website.

### Insights (Wawasan Konten)
* **Fungsi:** Menyajikan data tren konten dalam format grafis yang mudah dipahami bagi pembuat konten non-teknis, memperlihatkan konten baru mana yang paling banyak menarik minat pengunjung.
* **Contoh Nyata di Web KKN:** Mengetahui artikel mana yang sedang viral atau paling banyak dibaca masyarakat selama program KKN berlangsung (misalnya: artikel *"Digitalisasi Pengabdian..."* menduduki posisi artikel terbanyak dibaca).

### Performance (Performa Pencarian) ⭐ *(Sangat Vital)*
* **Fungsi:** Menyajikan metrik analitik mendalam dari hasil pencarian murni (organik) Google, meliputi:
  * **Total Clicks**: Jumlah pengguna yang mengklik tautan web kita dari Google.
  * **Total Impressions**: Berapa kali judul web kita muncul di layar pencarian pengguna.
  * **Average CTR**: Rasio perbandingan antara klik terhadap impresi (`(Klik / Impresi) x 100%`).
  * **Average Position**: Rata-rata peringkat urutan web kita di Google Search.
* **Contoh Nyata di Web KKN:**
  * Anda ingin mengetahui kata kunci (*queries*) apa saja yang diketik pengguna hingga menemukan website:
    * `kkn vidya vardhana` -> Posisi 1, 150 klik.
    * `kkn unusia 2026 kelompok 7` -> Posisi 1, 80 klik.
    * `desa binaan kkn vidya vardhana` -> Posisi 2, 45 klik.

### URL Inspection (Inspeksi URL) ⭐ *(Sangat Vital)*
* **Fungsi:** Alat diagnostik satuan URL untuk menguji status perayapan Googlebot, memeriksa kesesuaian render kode JavaScript, dan meminta Google mengindeks halaman secara instan (*Request Indexing*).
* **Contoh Nyata di Web KKN:**
  * Saat tim publikasi KKN baru saja merilis artikel baru: `https://vidyavardhana.my.id/berita/penutupan-program-kerja-kkn`, masukkan URL tersebut ke kolom pencarian URL Inspection, lalu klik tombol **"Request Indexing"** agar artikel tersebut muncul di Google dalam hitungan beberapa jam saja.

---

## 🗂️ 2. Kelompok Indexing (Pengindeksan Halaman)

### Pages (Halaman)
* **Fungsi:** Laporan lengkap seluruh URL web yang **berhasil masuk indeks** (*Indexed*) vs URL yang **dikecualikan/gagal masuk indeks** (*Not Indexed*) beserta alasannya (misal: *Page with redirect*, *Not found 404*, atau *Blocked by robots.txt*).
* **Contoh Nyata di Web KKN:**
  * Halaman `/login` akan terdaftar di kategori *Not Indexed*, dan ini benar karena halaman admin posko tidak boleh diindeks publik.
  * Jika ada URL artikel lama yang salah ketik atau dihapus, Anda bisa melihat apakah Google menemukan error 404 di menu ini.

### Videos (Video)
* **Fungsi:** Mendeteksi elemen video yang disematkan (*embed*) di dalam halaman web serta memeriksa apakah video tersebut memenuhi syarat untuk tampil di tab Google Video.
* **Contoh Nyata di Web KKN:**
  * Pada halaman Galeri Media dan detail artikel KKN terdapat video dokumentasi YouTube dan Instagram Reels. Googlebot akan mendeteksi video-video tersebut dan menampilkannya di hasil penelusuran video Google.

### Sitemaps (Peta Situs) ⭐ *(Sangat Vital)*
* **Fungsi:** Tempat mendaftarkan alamat file peta situs XML (`https://vidyavardhana.my.id/sitemap.xml`) agar bot Google secara berkala dan otomatis menyerap seluruh daftar URL artikel baru tanpa harus di-submit manual satu per satu.
* **Contoh Nyata di Web KKN:**
  * Ketika status sitemap bertuliskan hijau **"Success"** dengan *Discovered pages* berisi angka (misal: 9 halaman), artinya Google secara otomatis telah memetakan Beranda, Profil Posko, Galeri Media, Berita, dan seluruh artikel KKN Anda.

### Removals (Penghapusan Sementara)
* **Fungsi:** Meminta Google untuk mencabut/menghapus URL tertentu dari hasil pencarian secara instan dalam kurun waktu cepat (berlaku darurat selama ~6 bulan).
* **Contoh Nyata di Web KKN:**
  * Jika ada artikel KKN yang tidak sengaja memuat data privasi warga desa (misal: dokumen KTP/KK posko atau nomor telepon personal warga), URL dapat segera ditutup dari hasil pencarian Google melalui menu ini sambil artikelnya diperbaiki di dashboard web.

---

## 📱 3. Kelompok Experience (Pengalaman Pengguna)

### Core Web Vitals (Kecepatan & Kestabilan Web)
* **Fungsi:** Tolok ukur kecepatan dan kenyamanan interaksi pengguna nyata (*Real-User Metrics*) berdasarkan 3 standar emas Google:
  * **LCP (*Largest Contentful Paint*)**: Kecepatan memuat banner atau gambar utama (target: < 2.5 detik).
  * **INP (*Interaction to Next Paint*)**: Kecepatan web merespons saat tombol/menu diklik (target: < 200 milidetik).
  * **CLS (*Cumulative Layout Shift*)**: Kestabilan tata letak web agar tampilan tidak bergeser/lompat saat memuat (target: < 0.1).
* **Contoh Nyata di Web KKN:**
  * Memastikan bahwa galeri video masonry dan foto-foto kegiatan KKN tidak membebani kuota atau membuat lemot ponsel warga yang membuka web melalui jaringan seluler 4G.

### HTTPS
* **Fungsi:** Memverifikasi keamanan enkripsi SSL website Anda.
* **Contoh Nyata di Web KKN:**
  * Memastikan protokol `https://vidyavardhana.my.id` 100% terlindungi sehingga browser Chrome tidak menampilkan label bahaya *"Not Secure / Tidak Aman"* kepada pembaca berita KKN.

---

## 🛡️ 4. Keamanan & Penalti (Security & Manual Actions)

### Manual Actions (Tindakan Manual)
* **Fungsi:** Memberitahukan jika website menerima penalti manual dari tim pengawas Google akibat pelanggaran pedoman webmaster (misal: manipulasi kata kunci berlebihan, menyalin artikel web lain secara ilegal, atau konten spam).
* **Target Status:** Harus selalu berstatus centang hijau **"No issues detected"** (Kondisi web KKN saat ini).

### Security Issues (Masalah Keamanan)
* **Fungsi:** Mendeteksi serangan siber, indikasi peretasan (*hack*), skrip malware, atau injeksi tautan berbahaya (*spam injection*).
* **Target Status:** Harus selalu berstatus centang hijau **"No issues detected"**.

---

## 🔗 5. Otoritas & Pengaturan Lanjutan

### Links (Tautan & Backlink)
* **Fungsi:** Menampilkan laporan tautan yang mengarah ke website:
  * **External Links (Backlink)**: Situs luar yang menautkan ke web KKN (misal: web kampus UNUSIA, linktree media sosial, atau blog pengabdian masyarakat).
  * **Internal Links**: Struktur tautan navigasi di dalam website Anda sendiri.
* **Contoh Nyata di Web KKN:**
  * Memantau backlink dari akun resmi Instagram `@kknvidyavardhana` dan kanal YouTube `@KKNVidyaVardhana`. Semakin banyak backlink berkualitas yang terdata di sini, semakin kuat posisi web KKN di urutan #1 Google.

### Achievements (Pencapaian)
* **Fungsi:** Fitur apresiasi dari Google berupa lencana penghargaan ketika web mencapai rekor kunjungan tertentu.
* **Contoh Nyata di Web KKN:**
  * Muncul kartu penghargaan: *"Selamat! Web Anda telah mencapai 500 klik pertama dari Google Search!"*.

### Settings (Pengaturan)
* **Fungsi:** Mengelola konfigurasi kepemilikan domain (*Ownership verification*), menambahkan email rekan tim KKN agar bisa ikut memantau Search Console, serta melihat identitas crawler bot Google (Desktop atau Mobile).
* **Contoh Nyata di Web KKN:**
  * Menambahkan email Ketua Kelompok atau Divisi Kominfo KKN ke daftar pengguna (*Users and permissions*) dengan hak akses *Full* atau *Restricted*.

---

## 💡 6. 3 Menu Paling Penting untuk Pengelolaan Harian

Dalam operasional harian website KKN Vidya Vardhana, Anda tidak perlu memeriksa semua menu setiap hari. Cukup fokus pada **3 menu utama** ini:

| Menu | Kapan Digunakan? | Tindakan yang Dilakukan |
| :--- | :--- | :--- |
| **URL Inspection** | Setiap kali selesai mempublikasikan artikel atau rilis berita baru. | Masukkan URL artikel baru -> Klik **Request Indexing** agar artikel cepat terindeks dalam hitungan jam. |
| **Performance** | Seminggu sekali atau saat evaluasi program KKN. | Melihat jumlah pembaca, artikel paling populer, dan kata kunci pencarian warga. |
| **Sitemaps** | Cukup sebulan sekali atau saat ada pembaruan struktur web besar. | Memastikan status sitemap tetap hijau (*Success*) dan jumlah URL terus bertambah seiring bertambahnya berita. |

---

*Dokumentasi disusun untuk tim pengembang & pengelola Web KKN Kelompok 7 Vidya Vardhana UNUSIA.*
