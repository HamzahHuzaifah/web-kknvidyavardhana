-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Waktu pembuatan: 15 Sep 2026 pada 22.39
-- Versi server: 10.4.32-MariaDB
-- Versi PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `db_kkn`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `articles`
--

CREATE TABLE `articles` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `category` varchar(50) DEFAULT 'berita',
  `file_url` varchar(255) DEFAULT NULL,
  `author_id` int(11) DEFAULT NULL,
  `author_name` varchar(100) DEFAULT NULL,
  `abstract` longtext DEFAULT NULL,
  `keywords` varchar(255) DEFAULT NULL,
  `authors_meta` text DEFAULT NULL,
  `doi_or_reg` varchar(100) DEFAULT NULL,
  `views_count` int(11) DEFAULT 0,
  `downloads_count` int(11) DEFAULT 0,
  `publisher` varchar(150) DEFAULT 'KKN Vidya Vardhana'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `articles`
--

INSERT INTO `articles` (`id`, `title`, `slug`, `content`, `image_url`, `created_at`, `category`, `file_url`, `author_id`, `author_name`, `abstract`, `keywords`, `authors_meta`, `doi_or_reg`, `views_count`, `downloads_count`, `publisher`) VALUES
(1, 'Sosialisasi Literasi Digital & Pengenalan Website Desa Ciasihan', 'sosialisasi-literasi-digital-dan-pengenalan-website-desa-ciasihan', '<p>Mahasiswa KKN Vidya Vardhana sukses menggelar sosialisasi literasi digital dan pengenalan portal website desa bersama aparatur serta masyarakat Desa Ciasihan. Kegiatan ini bertujuan mempercepat transformasi digital pedesaan dan memudahkan akses informasi publik.</p>', NULL, '2026-09-11 22:01:37', 'berita', NULL, NULL, 'Tim KKN', NULL, NULL, NULL, NULL, 0, 0, 'KKN Vidya Vardhana'),
(2, 'Laporan Pengabdian: Pemetaan Potensi UMKM Lokal Desa Ciasihan', 'laporan-pengabdian-pemetaan-potensi-umkm-lokal-desa-ciasihan', '<p>Hasil observasi dan riset lapangan tim mahasiswa mengenai rantai pasok komoditas pertanian dan kerajinan warga di Desa Ciasihan. Publikasi ini merangkum strategi digital marketing dan perluasan pasar produk lokal.</p>', NULL, '2026-09-11 22:01:37', 'publikasi', NULL, NULL, 'Divisi Ekonomi & UMKM', NULL, NULL, NULL, NULL, 0, 0, 'KKN Vidya Vardhana'),
(3, 'Buku Saku & Modul Panduan Pengelolaan Sampah Mandiri Tingkat RT', 'buku-saku-dan-modul-panduan-pengelolaan-sampah-mandiri-tingkat-rt', '<p>Modul praktis yang disusun mahasiswa KKN Vidya Vardhana mengenai teknik pemilahan sampah organik dan anorganik, pembuatan kompos sederhana skala rumah tangga, dan pembentukan bank sampah lingkungan.</p>', NULL, '2026-09-11 22:01:37', 'modul', NULL, NULL, 'Divisi Lingkungan Hidup', NULL, NULL, NULL, NULL, 0, 0, 'KKN Vidya Vardhana'),
(4, 'Pemberdayaan UMKM Pengrajin Bambu Melalui Digital Marketing di Desa Ciasihan', 'pemberdayaan-umkm-pengrajin-bambu-melalui-digital-marketing-di-desa-ciasihan-8402', '<p>Program pengabdian masyarakat ini bertujuan untuk meningkatkan kapasitas pemasaran digital para pengrajin bambu lokal Desa Ciasihan melalui pembuatan katalog digital dan optimalisasi media sosial.</p>', NULL, '2026-09-12 16:15:48', 'publikasi', NULL, 1, 'admin', 'Pengrajin bambu di Desa Ciasihan memiliki potensi ekonomi yang tinggi namun masih terkendala dalam jangkauan pasar. Pengabdian ini mengimplementasikan strategi digital marketing terpadu.', 'KKN; UMKM; Digital Marketing; Pengrajin Bambu; Ciasihan', 'Hamzah Huzaifah (UPN Veteran Jakarta), Tim KKN Vidya Vardhana', 'LPPM-KKN/2026/08/VV-01', 1, 1, 'KKN Vidya Vardhana & LPPM'),
(5, 'Pembuatan Website Profil Desa dan Kebun Gizi sebagai Pemberdayaan Masyarakat dalam Program KKN Reguler', 'pembuatan-website-profil-desa-dan-kebun-gizi-sebagai-pemberdayaan-masyarakat-dalam-program-kkn-reguler-9017', '<p><em style=\"background-color: rgb(255, 255, 255); color: rgba(0, 0, 0, 0.87);\">Program&nbsp;KKN&nbsp;Reguler&nbsp;Universitas&nbsp;Teuku&nbsp;Umar&nbsp;tahun&nbsp;2025&nbsp;dilaksanakan&nbsp;di&nbsp;Kabupaten&nbsp;Aceh&nbsp;Barat,&nbsp;di&nbsp;mana&nbsp;kelompok&nbsp;kami&nbsp;ditempatkan&nbsp;di&nbsp;Desa&nbsp;Panton,&nbsp;Kecamatan&nbsp;Woyla,&nbsp;Kabupaten&nbsp;Aceh&nbsp;Barat&nbsp;dengan&nbsp;tujuan&nbsp;mengatasi&nbsp;keterbatasan&nbsp;akses&nbsp;informasi&nbsp;digital&nbsp;dan&nbsp;rendahnya&nbsp;ketahanan&nbsp;pangan&nbsp;masyarakat.&nbsp;Metode&nbsp;pelaksanaan&nbsp;menggunakan&nbsp;pendekatan&nbsp;partisipatif&nbsp;yang&nbsp;melibatkan&nbsp;seluruh&nbsp;elemen&nbsp;masyarakat&nbsp;dalam&nbsp;identifikasi&nbsp;masalah,&nbsp;perencanaan,&nbsp;pelaksanaan,&nbsp;dan&nbsp;evaluasi&nbsp;program.&nbsp;Program&nbsp;utama&nbsp;meliputi&nbsp;pengembangan&nbsp;website&nbsp;profil&nbsp;desa&nbsp;menggunakan&nbsp;teknologi&nbsp;PHP&nbsp;dan&nbsp;Bootstrap&nbsp;untuk&nbsp;meningkatkan&nbsp;transparansi&nbsp;informasi,&nbsp;serta&nbsp;pembangunan&nbsp;kebun&nbsp;gizi&nbsp;komunitas&nbsp;melalui&nbsp;pemanfaatan&nbsp;lahan&nbsp;kosong&nbsp;untuk&nbsp;budidaya&nbsp;sayuran&nbsp;organik.&nbsp;Website&nbsp;profil&nbsp;desa&nbsp;berhasil&nbsp;menjadi&nbsp;platform&nbsp;resmi&nbsp;penyebaran&nbsp;informasi&nbsp;desa&nbsp;yang&nbsp;dilengkapi&nbsp;fitur&nbsp;layanan&nbsp;administrasi&nbsp;daring.&nbsp;Program&nbsp;kebun&nbsp;gizi&nbsp;menghasilkan&nbsp;sayuran&nbsp;segar&nbsp;seperti&nbsp;bayam,&nbsp;kangkung,&nbsp;dan&nbsp;sawi&nbsp;yang&nbsp;mengurangi&nbsp;ketergantungan&nbsp;masyarakat&nbsp;terhadap&nbsp;pasar&nbsp;mingguan.&nbsp;Keberhasilan&nbsp;program&nbsp;tercermin&nbsp;dari&nbsp;peningkatan&nbsp;literasi&nbsp;digital&nbsp;masyarakat&nbsp;dan&nbsp;penguatan&nbsp;modal&nbsp;sosial&nbsp;melalui&nbsp;kegiatan&nbsp;kolaboratif.&nbsp;Program&nbsp;ini&nbsp;mencapai&nbsp;solusi&nbsp;berkelanjutan&nbsp;sesuai&nbsp;kebutuhan&nbsp;masyarakat&nbsp;serta&nbsp;membentuk&nbsp;kapasitas&nbsp;lokal&nbsp;dalam&nbsp;pengelolaan&nbsp;teknologi&nbsp;informasi&nbsp;dan&nbsp;ketahanan&nbsp;pangan.</em></p>', '/uploads/1789232078952-180685411.png', '2026-09-12 16:54:39', 'modul', '/uploads/1789232078996-948943111.pdf', 1, 'admin', 'Test', 'Website desa, Kebun gizi, Pemberdayaan Masyarakat, KKN Reguler, Ketahanan pangan', 'Hamzah Huzaifah', 'https://doi.org/10.59837/jpmba.v3i7.3100', 6, 0, 'KKN Vidya Vardhana');

-- --------------------------------------------------------

--
-- Struktur dari tabel `attendance`
--

CREATE TABLE `attendance` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `latitude` decimal(10,8) NOT NULL,
  `longitude` decimal(11,8) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `attendance`
--

INSERT INTO `attendance` (`id`, `user_id`, `latitude`, `longitude`, `created_at`) VALUES
(1, 1, -6.67228384, 106.64584487, '2026-09-12 06:43:32');

-- --------------------------------------------------------

--
-- Struktur dari tabel `media_files`
--

CREATE TABLE `media_files` (
  `id` int(11) NOT NULL,
  `filename` varchar(255) NOT NULL,
  `original_name` varchar(255) NOT NULL,
  `file_url` varchar(255) NOT NULL,
  `file_type` varchar(50) NOT NULL,
  `mime_type` varchar(100) DEFAULT NULL,
  `file_size` int(11) DEFAULT 0,
  `uploaded_by` varchar(100) DEFAULT 'Admin',
  `source` varchar(50) DEFAULT 'direct_upload',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `media_files`
--

INSERT INTO `media_files` (`id`, `filename`, `original_name`, `file_url`, `file_type`, `mime_type`, `file_size`, `uploaded_by`, `source`, `created_at`) VALUES
(1, '1789229059685-689054940.png', 'Logo KKN Vidya Vardhana (1).png', '/uploads/1789229059685-689054940.png', 'image', 'image/png', 2189367, 'admin', 'logo', '2026-09-12 16:04:19'),
(2, '1789232078952-180685411.png', 'cover_issue_31_en_US.png', '/uploads/1789232078952-180685411.png', 'image', 'image/png', 1874358, 'admin', 'article', '2026-09-12 16:54:39'),
(3, '1789232078996-948943111.pdf', '136.+Production+Dwi+Vandela.pdf', '/uploads/1789232078996-948943111.pdf', 'document', 'application/pdf', 712727, 'admin', 'article', '2026-09-12 16:54:39');

-- --------------------------------------------------------

--
-- Struktur dari tabel `media_items`
--

CREATE TABLE `media_items` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `platform` varchar(50) NOT NULL,
  `url` text NOT NULL,
  `caption` text DEFAULT NULL,
  `is_autoplay` tinyint(1) DEFAULT 1,
  `display_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `media_items`
--

INSERT INTO `media_items` (`id`, `title`, `platform`, `url`, `caption`, `is_autoplay`, `display_order`, `created_at`) VALUES
(1, 'Keseruan Divisi KKN', 'youtube', 'https://youtube.com/shorts/DxSZ9Hm2Cc0?si=yGIYX43bAkROJtOF', 'Divisi KKN', 1, 1, '2026-09-11 21:53:24'),
(2, 'Kolaborasi Kesehatan: Dukungan Sponsorship untuk Posyandu', 'instagram', 'https://www.instagram.com/reel/Dc_4KLtT3z0/?utm_source=ig_web_copy_link&stkn=MzRlODBiNWFlZA==', 'Dukungan sponsorship dari Buku Kesehatan Online untuk membantu\nkelancaran administrasi di Posyandu setempat', 1, 2, '2026-09-11 21:53:24'),
(3, 'Poster untuk Anak Anak', 'tiktok', 'https://www.tiktok.com/@kkn.vidyavardhana/video/7683855125743488276?is_from_webapp=1&sender_device=pc', 'Bagus Banger', 1, 3, '2026-09-11 22:37:37');

-- --------------------------------------------------------

--
-- Struktur dari tabel `profile_info`
--

CREATE TABLE `profile_info` (
  `id` int(11) NOT NULL,
  `about_title` varchar(255) DEFAULT NULL,
  `about_description` text DEFAULT NULL,
  `vision` text DEFAULT NULL,
  `mission` text DEFAULT NULL,
  `village_name` varchar(255) DEFAULT NULL,
  `village_description` text DEFAULT NULL,
  `village_population` varchar(50) DEFAULT NULL,
  `village_rtrw` varchar(50) DEFAULT NULL,
  `village_area` varchar(50) DEFAULT NULL,
  `village_latitude` decimal(10,8) DEFAULT NULL,
  `village_longitude` decimal(11,8) DEFAULT NULL,
  `village_map_label` varchar(255) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `logo_url` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `profile_info`
--

INSERT INTO `profile_info` (`id`, `about_title`, `about_description`, `vision`, `mission`, `village_name`, `village_description`, `village_population`, `village_rtrw`, `village_area`, `village_latitude`, `village_longitude`, `village_map_label`, `updated_at`, `logo_url`) VALUES
(1, 'KKN Vidya Vardhana', 'KKN Vidya Vardhana adalah inisiatif pengabdian mahasiswa yang berfokus pada pemberdayaan pendidikan, teknologi informasi, dan pengembangan potensi lokal desa demi kemajuan masyarakat.', 'Mewujudkan masyarakat desa yang berdaya saing, melek teknologi digital, dan mandiri secara ekonomi berlandaskan kearifan lokal.', '1. Menyelenggarakan program edukasi dan literasi digital berkelanjutan.\n2. Mendorong digitalisasi potensi UMKM dan pariwisata desa.\n3. Menjalin sinergi harmonis antara akademisi, aparat desa, dan warga.', 'Desa Ciasihan', 'Desa Ciasihan terletak di kawasan perbukitan Kecamatan Pamijahan, Kabupaten Bogor. Dikelilingi udara sejuk, bentang alam hijau yang asri, serta warga yang ramah dan memegang teguh semangat gotong royong.', '5,420 Jiwa', '12 RT / 04 RW', '3.2 km²', -6.65780000, 106.66690000, 'Balai Desa Ciasihan, Pamijahan', '2026-09-12 16:04:19', '/uploads/1789229059685-689054940.png');

-- --------------------------------------------------------

--
-- Struktur dari tabel `social_links`
--

CREATE TABLE `social_links` (
  `id` int(11) NOT NULL,
  `platform` varchar(50) NOT NULL,
  `username_handle` varchar(100) NOT NULL,
  `url` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `social_links`
--

INSERT INTO `social_links` (`id`, `platform`, `username_handle`, `url`, `created_at`) VALUES
(1, 'instagram', '@kkn_vidyavardhana', 'https://instagram.com', '2026-09-11 21:53:24'),
(2, 'youtube', 'KKN Vidya Vardhana Official', 'https://youtube.com', '2026-09-11 21:53:24'),
(3, 'tiktok', '@kkn.vidyavardhana', 'https://tiktok.com', '2026-09-11 21:53:24');

-- --------------------------------------------------------

--
-- Struktur dari tabel `team_members`
--

CREATE TABLE `team_members` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `role` varchar(100) NOT NULL,
  `major` varchar(100) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `display_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `team_members`
--

INSERT INTO `team_members` (`id`, `name`, `role`, `major`, `image_url`, `display_order`, `created_at`) VALUES
(1, 'M. Arya Pratama', 'Ketua Kelompok', 'Teknik Informatika', NULL, 1, '2026-09-11 21:48:18'),
(2, 'Siti Nurhaliza', 'Sekretaris', 'Ilmu Komunikasi', NULL, 2, '2026-09-11 21:48:18'),
(3, 'Budi Santoso', 'Bendahara', 'Akuntansi', NULL, 3, '2026-09-11 21:48:18'),
(4, 'Rina Wijaya', 'Koordinator Lapangan', 'Sosiologi', NULL, 4, '2026-09-11 21:48:18'),
(5, 'Fajar Hidayat', 'Divisi Kominfo & Media', 'Sistem Informasi', NULL, 5, '2026-09-11 21:48:18'),
(6, 'Dewi Lestari', 'Divisi Pendidikan & Sosial', 'Pendidikan Guru', NULL, 6, '2026-09-11 21:48:18');

-- --------------------------------------------------------

--
-- Struktur dari tabel `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(20) DEFAULT 'user',
  `status` varchar(20) DEFAULT 'pending',
  `google_id` varchar(255) DEFAULT NULL,
  `active_token` varchar(500) DEFAULT NULL,
  `last_active` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `role`, `status`, `created_at`) VALUES
(1, 'admin', '$2b$10$EOsP4xdfu3HJqXFWnKPZuuHmoAH3wnQWeDVIFDIpCQf1r9lWtHX/O', 'admin', 'approved', '2026-09-11 21:41:47'),
(2, 'Hamzah.Huzaifah', '$2b$10$VR1hzzugTSz.0xLTn9ovUOtNhUbqWbvRvziqM2yl3W0Q20XuLJWSG', 'user', 'approved', '2026-09-11 21:42:51'),
(3, 'Wahidun', '$2b$10$Tpb83DKUIOfMVX7Ze.hSsOKDYL.VerOk9Qg8xBB0QaM.9TH2AF/ii', 'user', 'pending', '2026-09-12 15:22:34');

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `articles`
--
ALTER TABLE `articles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- Indeks untuk tabel `attendance`
--
ALTER TABLE `attendance`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indeks untuk tabel `media_files`
--
ALTER TABLE `media_files`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `media_items`
--
ALTER TABLE `media_items`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `profile_info`
--
ALTER TABLE `profile_info`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `social_links`
--
ALTER TABLE `social_links`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `team_members`
--
ALTER TABLE `team_members`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `articles`
--
ALTER TABLE `articles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT untuk tabel `attendance`
--
ALTER TABLE `attendance`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT untuk tabel `media_files`
--
ALTER TABLE `media_files`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT untuk tabel `media_items`
--
ALTER TABLE `media_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT untuk tabel `social_links`
--
ALTER TABLE `social_links`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT untuk tabel `team_members`
--
ALTER TABLE `team_members`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT untuk tabel `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `attendance`
--
ALTER TABLE `attendance`
  ADD CONSTRAINT `attendance_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

-- --------------------------------------------------------

--
-- Struktur dari tabel `footer_info`
--

CREATE TABLE IF NOT EXISTS `footer_info` (
  `id` int(11) NOT NULL,
  `brand_title` varchar(255) DEFAULT 'KKN Vidya Vardhana',
  `brand_tagline` text DEFAULT NULL,
  `about_text` text DEFAULT NULL,
  `address` text DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `operational_hours` varchar(150) DEFAULT NULL,
  `copyright_text` varchar(255) DEFAULT NULL,
  `quick_links` longtext DEFAULT NULL,
  `show_social_links` tinyint(1) DEFAULT 1,
  `show_map_link` tinyint(1) DEFAULT 1,
  `map_url` text DEFAULT NULL,
  `bottom_bar_text` varchar(255) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `footer_info`
--

INSERT INTO `footer_info` (`id`, `brand_title`, `brand_tagline`, `about_text`, `address`, `email`, `phone`, `operational_hours`, `copyright_text`, `quick_links`, `show_social_links`, `show_map_link`, `map_url`, `bottom_bar_text`) VALUES
(1, 'KKN Vidya Vardhana', 'Inisiatif Pengabdian Mahasiswa untuk Pemberdayaan Desa & Transformasi Digital.', 'KKN Vidya Vardhana berfokus pada dedikasi dan kontribusi nyata dalam pendidikan, teknologi informasi, serta penguatan potensi lokal masyarakat Desa Ciasihan.', 'Kantor Balai Desa Ciasihan, Kec. Pamijahan, Kabupaten Bogor, Jawa Barat 16810', 'kkn.vidyavardhana@gmail.com', '+62 812-3456-7890', 'Senin - Sabtu: 08:00 - 17:00 WIB', '© 2024-2026 KKN Vidya Vardhana. Seluruh Hak Cipta Dilindungi.', '[{\"label\":\"Beranda\",\"url\":\"/\"},{\"label\":\"Profil Desa & Tim\",\"url\":\"/profile\"},{\"label\":\"Media & Galeri\",\"url\":\"/media\"},{\"label\":\"Berita & Publikasi\",\"url\":\"/berita\"},{\"label\":\"Panel Akun\",\"url\":\"/login\"}]', 1, 1, 'https://maps.google.com/?q=Balai+Desa+Ciasihan+Pamijahan', 'Bersama Mewujudkan Kemajuan Berkelanjutan di Desa Ciasihan')
ON DUPLICATE KEY UPDATE `id`=`id`;

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
