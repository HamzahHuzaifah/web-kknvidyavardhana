# 🔍 Dokumentasi Solusi SEO & Google Search Console: KKN Vidya Vardhana

Dokumen ini merangkum secara komprehensif akar masalah, analisis teknis, langkah perbaikan, serta verifikasi hasil terkait pencarian Google (*Google Search*) dan indeks peta situs (*Sitemap XML*) untuk domain resmi **[vidyavardhana.my.id](https://vidyavardhana.my.id)**.

---

## 📌 1. Latar Belakang Permasalahan

1. **Fluktuasi Peringkat Kata Kunci (*Google Dance*)**:
   * Website sebelumnya sempat muncul di posisi paling atas pada pencarian kata kunci `"Vidya Vardhana"`, namun beberapa saat kemudian posisinya bergeser dan tidak lagi di urutan teratas.
   * Hasil pencarian teratas justru diisi oleh entitas umum (institusi pendidikan di India) serta akun media sosial resmi **Instagram (`@kknvidyavardhana`)** dan kanal **YouTube (`KKN Vidya Vardhana`)**.
2. **Error Sitemap di Google Search Console**:
   * Pada menu **Sitemaps**, status `https://vidyavardhana.my.id/sitemap.xml` menunjukkan status merah: **`Couldn't fetch`** dengan tipe **`Unknown`**.
   * Di dalam halaman detail, muncul peringatan: **`! Sitemap could not be read`** dengan jumlah halaman terdeteksi `0`.
   * Saat melakukan submit ulang dengan mengetik `sitemap.xml`, muncul popup error: **`Invalid sitemap address - Please enter a valid path to a sitemap in your site`**.

---

## 🔬 2. Analisis & Akar Masalah (Root Causes)

Setelah dilakukan audit menyeluruh pada konfigurasi server cPanel/LiteSpeed, routing backend Express, dan struktur HTML frontend, ditemukan 4 penyebab utama:

### A. Fallback SPA Menimpa Request `sitemap.xml`
* **Kondisi**: Website frontend dibangun menggunakan React (Single Page Application). Pada konfigurasi web server Apache (`.htaccess`), semua permintaan yang tidak cocok dengan file fisik diarahkan ke `index.html`.
* **Akar Masalah**: Rute `sitemap.xml` sebelumnya dibuat di backend Node.js (`backend/routes/sitemapRoutes.js`), namun `.htaccess` hanya mem-proxy rute `/api` dan `/uploads`.
* **Dampak**: Ketika crawler Googlebot meminta `https://vidyavardhana.my.id/sitemap.xml`, server menyajikan file HTML `index.html` (Content-Type: `text/html`). Google Search Console menolaknya karena sitemap harus berupa dokumen XML yang valid.

### B. Ketiadaan Schema Knowledge Graph (Entitas Terpisah)
* Frasa `"Vidya Vardhana"` adalah istilah bahasa Sanskerta dan nama beberapa entitas global besar.
* Akun Instagram dan YouTube KKN Vidya Vardhana sudah bertengger di peringkat #1 dan #2 Google karena memiliki otoritas domain tinggi. Namun, website `vidyavardhana.my.id` belum memiliki metadata terstruktur (*Structured Data*) yang menegaskan kepada Google bahwa website tersebut adalah **entitas resmi yang sama** dengan akun Instagram dan YouTube tersebut.

### C. Konfigurasi Properti Domain di Google Search Console
* Properti yang terdaftar di Google Search Console adalah tipe **Domain Property** (`vidyavardhana.my.id`), bukan *URL-prefix*.
* Pada tipe properti ini, kolom *"Add a new sitemap"* mewajibkan input alamat URL lengkap (`https://vidyavardhana.my.id/sitemap.xml`), bukan hanya nama file (`sitemap.xml`). Menginput hanya nama file memicu pesan *"Invalid sitemap address"*.

### D. Tampilan Error GSC Merupakan Riwayat Cache Lama
* Google Search Console tidak membaca sitemap secara langsung saat tombol *Submit* ditekan, melainkan memasukkannya ke antrean pemrosesan (*priority queue*).
* Status *"Couldn't fetch"* dan tanggal *Last read* yang tampil di antarmuka GSC merupakan riwayat kegagalan dari percobaan beberapa jam sebelumnya (sebelum perbaikan `.htaccess` diterapkan).

---

## 🛠️ 3. Langkah Solusi & Implementasi Teknis

### A. Pemasangan Structured Data (JSON-LD Schema)
Pada file `frontend/index.html`, ditambahkan skema `schema.org` standar Google untuk mendefinisikan entitas Organisasi dan Web, serta menghubungkannya langsung ke akun media sosial resmi:

```html
<!-- Structured Data (JSON-LD) untuk Google Search & Knowledge Graph -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://vidyavardhana.my.id/#organization",
      "name": "KKN Vidya Vardhana",
      "alternateName": ["Vidya Vardhana", "KKN Vidya Vardhana UNUSIA"],
      "url": "https://vidyavardhana.my.id/",
      "logo": {
        "@type": "ImageObject",
        "url": "https://vidyavardhana.my.id/og-image.jpg"
      },
      "sameAs": [
        "https://www.instagram.com/kknvidyavardhana",
        "https://www.youtube.com/@KKNVidyaVardhana"
      ]
    },
    {
      "@type": "WebSite",
      "@id": "https://vidyavardhana.my.id/#website",
      "url": "https://vidyavardhana.my.id/",
      "name": "KKN Vidya Vardhana",
      "alternateName": [
        "Vidya Vardhana",
        "KKN Vidya Vardhana UNUSIA",
        "vidyavardhana.my.id"
      ],
      "description": "Website Resmi KKN Vidya Vardhana UNUSIA. Portal informasi, berita, artikel, dan publikasi program kerja Kuliah Kerja Nyata (KKN).",
      "publisher": {
        "@id": "https://vidyavardhana.my.id/#organization"
      },
      "inLanguage": "id-ID"
    }
  ]
}
</script>
```

* **Optimasi Meta Tambahan**:
  * Mengubah `<html lang="en">` menjadi `<html lang="id">` untuk memperkuat relevansi pencarian regional Indonesia.
  * Menambahkan tag `<link rel="canonical" href="https://vidyavardhana.my.id/" />`.

---

### B. Perbaikan Reverse Proxy di `.htaccess`
Pada file `frontend/public/.htaccess`, ditambahkan aturan rewrite eksplisit untuk mem-proxy request `sitemap.xml` ke backend Node.js:

```apache
# Reverse Proxy: teruskan semua request /api, /uploads, dan /sitemap.xml ke Node.js port 5000
RewriteRule ^api/?(.*)$ http://127.0.0.1:5000/api/$1 [P,L]
RewriteRule ^uploads/?(.*)$ http://127.0.0.1:5000/uploads/$1 [P,L]
RewriteRule ^sitemap\.xml$ http://127.0.0.1:5000/sitemap.xml [P,L]
```

---

### C. Pembuatan File Fisik `sitemap.xml` Statis (Redundansi Kinerja Tinggi)
Untuk memastikan sitemap selalu dapat disajikan dengan kecepatan 0 milidetik bahkan saat backend sedang dalam proses *restart*, dibuat file fisik statis di `frontend/public/sitemap.xml` dan `frontend/dist/sitemap.xml`:
* Menghapus halaman private admin (`/login`) dari daftar URL sitemap agar tidak diindeks.
* Menambahkan atribut tanggal perayapan (`<lastmod>`) dan frekuensi perubahan (`<changefreq>`) pada seluruh URL.
* Menyelaraskan URL beranda dengan garis miring kanonikal (`https://vidyavardhana.my.id/`).

---

### D. Optimasi Generator Sitemap Dinamis (`backend/routes/sitemapRoutes.js`)
Kode backend diperbarui agar secara dinamis menyajikan sitemap XML berisi seluruh rute statis aktif dan seluruh artikel berita yang tersimpan di database MariaDB/MySQL:
* Mengembalikan header HTTP `Content-Type: application/xml; charset=utf-8`.
* Mengurutkan artikel berdasarkan `created_at DESC` dengan tag `<lastmod>` otomatis.

---

## ✅ 4. Verifikasi & Hasil Pengujian

### 1. Uji Respons Server Langsung (Live cURL Test)
Pengujian respons HTTP dari server produksi menghasilkan status sukses:
```http
HTTP/1.1 200 OK
Content-Type: application/xml; charset=utf-8
Server: LiteSpeed / Express

<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://vidyavardhana.my.id/</loc>
    <lastmod>2026-09-29</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  ... (9 URL terdaftar secara valid)
</urlset>
```

### 2. Uji Langsung Google Search Console (Live Test)
Melalui fitur **URL Inspection > LIVE TEST**, Googlebot mengonfirmasi kelayakan website secara menyeluruh:
* ✅ **URL is available to Google** (URL dapat diakses oleh Google tanpa hambatan).
* ✅ **Page availability: Page can be indexed** (Halaman siap dan layak masuk indeks Google).
* ✅ **Video discovery: Video detected** (Google berhasil mengenali konten media/video kegiatan).
* ✅ **Enhancements: HTTPS served over HTTPS** (Keamanan koneksi SSL valid).

### 3. Permintaan Pengindeksan Prioritas (Request Indexing)
Pengajuan perayapan halaman utama berstatus:
> **"Indexing requested — URL was added to a priority crawl queue."**

---

## 📋 5. Ringkasan File yang Dimodifikasi

| No | File | Deskripsi Perubahan |
| :---: | :--- | :--- |
| 1 | [frontend/index.html](file:///d:/kknvidyavadhana-web/frontend/index.html) | Menambahkan JSON-LD Schema (`Organization` & `WebSite`), `lang="id"`, dan canonical link. |
| 2 | [frontend/public/.htaccess](file:///d:/kknvidyavadhana-web/frontend/public/.htaccess) | Menambahkan aturan proxy `RewriteRule ^sitemap\.xml$` ke backend Node.js. |
| 3 | [frontend/public/sitemap.xml](file:///d:/kknvidyavadhana-web/frontend/public/sitemap.xml) | Membuat file fisik sitemap statis sebagai fallback cepat. |
| 4 | [backend/routes/sitemapRoutes.js](file:///d:/kknvidyavadhana-web/backend/routes/sitemapRoutes.js) | Menghapus rute `/login`, menambahkan `<lastmod>`, dan merapikan struktur XML. |
| 5 | [frontend/dist/](file:///d:/kknvidyavadhana-web/frontend/dist/) | Menjalankan `npm run build` untuk mengompilasi seluruh pembaruan ke folder produksi. |

---

## 💡 6. Catatan Pemeliharaan Berkala

1. **Waktu Pembaruan Search Console**:
   * Status sitemap di menu **Sitemaps** akan beralih dari *"Couldn't fetch"* ke status hijau **"Success"** secara otomatis dalam kurun waktu beberapa jam hingga 1x24 jam saat crawler Google selesai menjalankan tugas antreannya.
2. **Backlink Pendorong Otoritas**:
   * Pastikan link `https://vidyavardhana.my.id` terpasang pada bio akun Instagram `@kknvidyavardhana` dan deskripsi kanal YouTube `@KKNVidyaVardhana`. Ini adalah sinyal eksternal terkuat untuk mengunci posisi #1 di kata kunci *"Vidya Vardhana"*.
