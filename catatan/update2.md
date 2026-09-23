# 📝 Changelog & Laporan Pembaruan (Update 2)

Dokumen ini merangkum seluruh pekerjaan perombakan desain antarmuka (*UI/UX Redesign*), optimasi tampilan ramah perangkat seluler (*Mobile Responsiveness*), standardisasi komponen visual motif geometris, serta cara pemecahan masalah (*troubleshooting*) yang dihadapi pada fase pengembangan **KKN Vidya Vardhana**.

---

## 🎨 1. Perombakan Halaman Login, Berita, & Media (Neo-Brutalism)

### A. Redesign Halaman Login
* **Masalah Awal**: Tampilan form login sebelumnya terasa kaku, berukuran sempit dengan border ganda yang membatasi ruang pandang pengguna, serta kurang mencerminkan identitas desain web utama.
* **Solusi & Implementasi**:
  1. **Full-Bleed / Kanvas Penuh**: Menghilangkan batasan card sempit dan mengubahnya menjadi tata letak modern yang leluasa.
  2. **Pelebaran & Proporsi Form**: Melebarkan kontainer input agar pengguna nyaman saat mengetik akun di desktop maupun tablet.
  3. **Integrasi Google Login & Manual Form**: Memadukan tombol Google Sign-In dan form email/sandi konvensional dengan pemisah (*divider*) bergaris tegas bertuliskan "ATAU".
  4. **Penyelarasan Teks & Elemen**: Menyesuaikan tipografi, badge status, dan tombol aksi dengan estetika *Neo-Brutalist* (border gelap `#0f172a`, shadow tebal, dan warna aksen khas).

### B. Harmonisasi Halaman Berita & Media
* **Masalah Awal**: Ukuran card berita, thumbnail dokumentasi foto/video, serta filter kategori belum terintegrasi rapi dengan alur navbar dan tema besar.
* **Solusi**:
  1. Merapikan grid artikel dan modal pop-up detail berita.
  2. Menyesuaikan posisi dan perataan tulisan *branding* (seperti `Hello VidyaVardhana!`) di navbar agar sejajar (*aligned*) secara presisi dengan logo resmi KKN.

---

## 📱 2. Audit & Optimasi Ramah HP (Mobile-First Responsiveness)

Saat melakukan pengujian menyeluruh pada layar berukuran smartphone (390px - 430px), ditemukan beberapa kendala antarmuka dan telah diselesaikan dengan langkah berikut:

### A. Masalah Video Iframe yang Terlalu Tinggi / Meluap
* **Gejala Masalah**: Di halaman Media/Dokumentasi, frame pemutar video memiliki tinggi statis atau terlalu besar sehingga menutupi seluruh layar HP dan menyebabkan tata letak terdistorsi.
* **Pemecahan Masalah**:
  * Mengganti tinggi statis dengan kelas utilitas Tailwind responsif bertingkat:
    ```jsx
    // Sebelum: h-[450px] statis
    // Sesudah:
    className="w-full h-60 sm:h-80 md:h-[450px] rounded-xl border-3 border-slate-900 shadow-[4px_4px_0px_#0f172a]"
    ```
  * Menambahkan `overflow-hidden` pada pembungkus (*wrapper*) agar sudut border dan shadow tetap rapi saat video diputar.

### B. Scrollbar Horizontal Buruk pada Kategori/Filter Media
* **Gejala Masalah**: Tombol filter media (Semua, Video, Foto, dll.) atau tag berita yang panjang menimbulkan scrollbar default browser yang tebal dan merusak keindahan desain di perangkat sentuh.
* **Pemecahan Masalah**:
  * Membuat kelas utilitas khusus `.no-scrollbar` di file `frontend/src/index.css`:
    ```css
    @layer utilities {
      /* Sembunyikan scrollbar untuk Chrome, Safari, dan Opera */
      .no-scrollbar::-webkit-scrollbar {
        display: none;
      }
      /* Sembunyikan scrollbar untuk IE, Edge, dan Firefox */
      .no-scrollbar {
        -ms-overflow-style: none;  /* IE and Edge */
        scrollbar-width: none;  /* Firefox */
      }
    }
    ```
  * Menerapkan tombol filter dengan pembungkus `flex-nowrap overflow-x-auto no-scrollbar` atau `flex-wrap gap-2` sehingga fleksibel saat dioperasikan dengan jari.

### C. Dropdown Menu & Stacking Context (Z-Index) Navbar Mobile
* **Gejala Masalah**: Saat menu hamburger di klik pada HP, menu navigasi berpotensi tertimpa atau menimpa elemen dekoratif di belakangnya.
* **Pemecahan Masalah**:
  * Menetapkan urutan tumpukan (*stacking order*) yang jelas:
    * Background / Motif: `z-0` dengan `pointer-events-none`.
    * Konten Utama / Card: `z-10`.
    * Sticky Navbar: `z-40`.
    * Mobile Menu Overlay: `z-50`.
  * Memastikan interaksi klik/tap tidak terhalang oleh elemen visual latar belakang.

### D. Analisis Dampak Perubahan (Frontend vs Backend)
* **Kekhawatiran Pengguna**: Apakah perubahan besar ini dapat memicu *bug* atau kegagalan sistem pada backend/frontend?
* **Hasil Verifikasi**:
  * **Backend**: **100% Aman & Tanpa Gangguan**. Seluruh perombakan ini berada di ranah *presentational/styling* (CSS & JSX). Tidak ada perubahan pada skema database MySQL, model, maupun endpoint API (`/api/auth`, `/api/articles`, dll.).
  * **Frontend**: State logika formulir, token autentikasi Google, maupun *hook* data fetching tetap berjalan normal.

---

## 🔮 3. Motif Desain Geometris & Polkadot (Abstract Geometric System)

### A. Asal-Usul & Konsep Motif
Pengguna tertarik dengan ornamen lingkaran konsentris abstrak (*Abstract Geometric*) dan pola titik-titik melingkar (*polkadot pattern*) yang awalnya terpasang di halaman Login.
* **Berasal dari mana?**:
  * Motif tersebut **bukan file gambar eksternal (bukan PNG/JPG)**, melainkan diciptakan menggunakan **Pure Vector (Inline SVG)** dan **Procedural CSS Gradients**.
  * **Keunggulan**:
    1. **Super Ringan (0 KB Image Request)**: Tidak membebani kuota pengguna dan memuat instan tanpa jeda.
    2. **Ultra Tajam**: Format vektor SVG tidak pernah pecah atau buram di layar resolusi tinggi (Retina display / 4K).
    3. **Mudah Dikustomisasi**: Warna, transparansi (*opacity*), dan sudut rotasi dapat diubah melalui parameter kode.

### B. Masalah Redudansi & Solusi Ekstraksi Komponen
* **Masalah**: Awalnya kode SVG motif abstrak tersebut ditulis langsung di dalam `Login.jsx`. Jika ingin dipakai di halaman lain, menyalin puluhan baris SVG berkali-kali akan membuat kode kotor, sulit dirawat, dan rentan salah ketik.
* **Solusi**: Dibuatkan komponen independen baru bernama **`frontend/src/components/AbstractGeometric.jsx`**.

```jsx
// frontend/src/components/AbstractGeometric.jsx
import React from 'react';

export default function AbstractGeometric({ 
  className = "w-64 h-64 text-amber-500/20", 
  rotation = "0deg" 
}) {
  return (
    <div 
      className={`pointer-events-none select-none ${className}`}
      style={{ transform: `rotate(${rotation})` }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Lingkaran konsentris & busur geometris */}
        <circle cx="100" cy="100" r="90" stroke="currentColor" strokeWidth="2" strokeDasharray="4 6" />
        <circle cx="100" cy="100" r="70" stroke="currentColor" strokeWidth="3" />
        <circle cx="100" cy="100" r="50" stroke="currentColor" strokeWidth="1.5" strokeDasharray="8 8" />
        <circle cx="100" cy="100" r="30" stroke="currentColor" strokeWidth="2" />
        <circle cx="100" cy="100" r="10" fill="currentColor" />
        {/* Sinar aksen diagonal */}
        <path d="M100 0V200M0 100H200" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5" />
        <path d="M29.29 29.29L170.71 170.71M29.29 170.71L170.71 29.29" stroke="currentColor" strokeWidth="1" strokeDasharray="2 4" strokeOpacity="0.5" />
      </svg>
    </div>
  );
}
```

### C. Latar Belakang Polkadot Global (Procedural CSS)
* **Masalah**: Bagian latar belakang halaman dan card berwarna putih polos terasa terlalu sepi (*flat*).
* **Solusi**: Menanamkan pola bintik melingkar (*polkadot*) di level global pada file `frontend/src/index.css`:
  ```css
  body {
    background-color: #f8fafc;
    background-image: radial-gradient(#cbd5e1 1.5px, transparent 1.5px);
    background-size: 24px 24px;
    color: #0f172a;
    font-family: 'Outfit', sans-serif;
  }
  ```
* **Hasil**: Seluruh halaman website otomatis memiliki tekstur retro-modern yang elegan tanpa perlu menambahkan elemen `div` tambahan di setiap halaman.

### D. Penerapan Motif Terpadu ke Seluruh Halaman
Komponen motif geometris telah diintegrasikan pada lokasi-lokasi strategis:
1. **`Navbar.jsx`**: Ditempatkan di sudut kanan atas navbar dengan transparansi lembut, memberikan kesan header yang berkelas.
2. **`Footer.jsx`**: Diletakkan di pojok latar belakang footer untuk mengimbangi identitas logo KKN.
3. **`Login.jsx`**: Digunakan kembali dengan memanggil `<AbstractGeometric />` yang lebih bersih dan ringkas.
4. **`Home.jsx`**: Ditanamkan pada card putih bagian *"Tentang Kami"* dengan posisi pojok kanan bawah agar card tidak terlihat hampa.
5. **`Profile.jsx`**: Ditanamkan pada card putih *"Kisah & Profil Tim"* guna mempercantik tampilan presentasi profil desa/kelompok.

---

## 📂 4. Rangkuman File yang Terlibat

| File Path | Jenis Perubahan | Deskripsi |
| :--- | :--- | :--- |
| `frontend/src/components/AbstractGeometric.jsx` | **File Baru** | Komponen motif ornamen geometris SVG serbaguna. |
| `frontend/src/index.css` | Modifikasi | Pola background radial-gradient & utilitas `.no-scrollbar`. |
| `frontend/src/components/Navbar.jsx` | Modifikasi | Penyelarasan logo, responsivitas menu, & ornamen motif. |
| `frontend/src/components/Footer.jsx` | Modifikasi | Penambahan ornamen geometris dan border Neo-Brutalist. |
| `frontend/src/pages/Login.jsx` | Refactor | Form penuh, integrasi Google Sign-In, & pemakaian komponen motif. |
| `frontend/src/pages/Home.jsx` | Modifikasi | Ornamen motif geometris pada card profil "Tentang Kami". |
| `frontend/src/pages/Profile.jsx` | Modifikasi | Ornamen motif geometris pada card cerita profil. |
| `catatan/update2.md` | **File Baru** | Dokumentasi lengkap perubahan Update 2. |

---

## 💡 5. Panduan Pemeliharaan untuk Tim Pengembang

1. **Menambahkan Motif ke Card/Section Baru**:
   Cukup impor komponen dan gunakan posisi `absolute` dengan container parent yang memiliki `relative overflow-hidden`:
   ```jsx
   import AbstractGeometric from '../components/AbstractGeometric';

   <div className="relative overflow-hidden bg-white border-3 border-slate-900 rounded-2xl p-6">
     {/* Konten Anda disini */}
     
     {/* Ornamen di sudut */}
     <div className="absolute -bottom-10 -right-10 pointer-events-none opacity-20">
       <AbstractGeometric className="w-48 h-48 text-indigo-900" rotation="45deg" />
     </div>
   </div>
   ```

2. **Memastikan Keselarasan Layar HP**:
   - Selalu sertakan `overflow-hidden` pada card yang memakai dekorasi latar belakang.
   - Gunakan `w-full` dengan padding terukur (`px-4 sm:px-6`) agar tidak terjadi kebocoran lebar (*horizontal overflow*).
   - Pastikan setiap elemen interaktif memiliki `pointer-events-auto`, sedangkan dekorasi memiliki `pointer-events-none`.

---
*Laporan ini disimpan dalam repositori sebagai acuan resmi standar desain antarmuka KKN Vidya Vardhana.*
