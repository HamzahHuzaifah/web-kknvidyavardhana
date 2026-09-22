const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Default fallback data jika database kosong atau sedang tidak dapat diakses
const DEFAULT_FOOTER_DATA = {
  id: 1,
  brand_title: 'KKN Vidya Vardhana',
  brand_tagline: 'Inisiatif Pengabdian Mahasiswa untuk Pemberdayaan Desa & Transformasi Digital.',
  about_text: 'KKN Vidya Vardhana berfokus pada inovasi pendidikan, pengembangan potensi lokal desa, serta publikasi ilmiah dan kegiatan kemasyarakatan di Desa Ciasihan.',
  address: 'Kantor Balai Desa Ciasihan, Kec. Pamijahan, Kabupaten Bogor, Jawa Barat 16810',
  email: 'kkn.vidyavardhana@gmail.com',
  phone: '+62 812-3456-7890',
  operational_hours: 'Senin - Sabtu: 08:00 - 17:00 WIB',
  copyright_text: '© 2024-2026 KKN Vidya Vardhana. Seluruh Hak Cipta Dilindungi.',
  quick_links: [
    { label: 'Beranda', url: '/' },
    { label: 'Profil Desa & Tim', url: '/profile' },
    { label: 'Media & Galeri', url: '/media' },
    { label: 'Berita & Publikasi', url: '/berita' },
    { label: 'Panel Akun', url: '/login' }
  ],
  show_social_links: 1,
  show_map_link: 1,
  map_url: 'https://maps.google.com/?q=Balai+Desa+Ciasihan+Pamijahan',
  bottom_bar_text: 'Bersama Mewujudkan Kemajuan Berkelanjutan di Desa Ciasihan',
  logo_url: null,
  social_links: []
};

// Helper untuk parsing quick_links yang aman dari crash
const safeParseQuickLinks = (val) => {
  if (!val) return DEFAULT_FOOTER_DATA.quick_links;
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {
      console.warn('Gagal mem-parse quick_links JSON:', e.message);
    }
  }
  return DEFAULT_FOOTER_DATA.quick_links;
};

// API: Get Footer Info (Public)
router.get('/footer-info', async (req, res) => {
  try {
    // Ambil data footer_info, logo profil, dan media sosial
    let footerRow = null;
    let logoUrl = null;
    let socialLinks = [];

    try {
      const [rows] = await pool.query('SELECT * FROM footer_info WHERE id = 1');
      if (rows && rows.length > 0) {
        footerRow = rows[0];
      }
    } catch (dbErr) {
      console.warn('Gagal membaca tabel footer_info:', dbErr.message);
    }

    try {
      const [pRows] = await pool.query('SELECT logo_url FROM profile_info WHERE id = 1');
      if (pRows && pRows.length > 0 && pRows[0].logo_url) {
        logoUrl = pRows[0].logo_url;
      }
    } catch (pErr) {
      // Abaikan jika profile_info belum siap
    }

    try {
      const [sRows] = await pool.query('SELECT * FROM social_links ORDER BY id ASC');
      if (Array.isArray(sRows)) {
        socialLinks = sRows;
      }
    } catch (sErr) {
      // Abaikan jika social_links belum siap
    }

    // Jika baris footer_info belum ada di database, gunakan data default
    const mergedData = {
      ...DEFAULT_FOOTER_DATA,
      ...(footerRow || {}),
      logo_url: logoUrl || footerRow?.logo_url || null,
      social_links: socialLinks.length > 0 ? socialLinks : DEFAULT_FOOTER_DATA.social_links
    };

    mergedData.quick_links = safeParseQuickLinks(mergedData.quick_links);
    mergedData.show_social_links = Number(mergedData.show_social_links ?? 1);
    mergedData.show_map_link = Number(mergedData.show_map_link ?? 1);

    return res.json(mergedData);
  } catch (err) {
    console.error('Error in /api/footer-info:', err);
    // Selalu kirim fallback data dengan status 200 agar frontend TIDAK PERNAH blank putih
    return res.json({
      ...DEFAULT_FOOTER_DATA,
      _isFallback: true
    });
  }
});

// API: Update Footer Info (Admin Only)
router.post('/footer-info/edit', verifyToken, isAdmin, async (req, res) => {
  try {
    const {
      brand_title,
      brand_tagline,
      about_text,
      address,
      email,
      phone,
      operational_hours,
      copyright_text,
      quick_links,
      show_social_links,
      show_map_link,
      map_url,
      bottom_bar_text
    } = req.body;

    // Sanitasi & serialisasi quick_links
    let serializedLinks = JSON.stringify(DEFAULT_FOOTER_DATA.quick_links);
    if (Array.isArray(quick_links)) {
      const cleanedLinks = quick_links
        .filter(item => item && typeof item === 'object' && item.label)
        .map(item => ({
          label: String(item.label || '').trim(),
          url: String(item.url || '#').trim()
        }));
      serializedLinks = JSON.stringify(cleanedLinks.length > 0 ? cleanedLinks : DEFAULT_FOOTER_DATA.quick_links);
    } else if (typeof quick_links === 'string' && quick_links.trim()) {
      serializedLinks = quick_links;
    }

    const titleVal = (brand_title || 'KKN Vidya Vardhana').trim();
    const taglineVal = (brand_tagline || '').trim();
    const aboutVal = (about_text || '').trim();
    const addressVal = (address || '').trim();
    const emailVal = (email || '').trim();
    const phoneVal = (phone || '').trim();
    const hoursVal = (operational_hours || '').trim();
    const copyVal = (copyright_text || '© 2024-2026 KKN Vidya Vardhana. Seluruh Hak Cipta Dilindungi.').trim();
    const showSocialVal = (show_social_links === 1 || show_social_links === true || show_social_links === '1') ? 1 : 0;
    const showMapVal = (show_map_link === 1 || show_map_link === true || show_map_link === '1') ? 1 : 0;
    const mapUrlVal = (map_url || '').trim();
    const bottomBarVal = (bottom_bar_text || '').trim();

    // Check if row 1 exists
    const [existing] = await pool.query('SELECT id FROM footer_info WHERE id = 1');
    if (existing.length === 0) {
      await pool.query(`
        INSERT INTO footer_info (
          id, brand_title, brand_tagline, about_text,
          address, email, phone, operational_hours,
          copyright_text, quick_links, show_social_links,
          show_map_link, map_url, bottom_bar_text
        ) VALUES (
          1, ?, ?, ?,
          ?, ?, ?, ?,
          ?, ?, ?,
          ?, ?, ?
        )
      `, [
        titleVal, taglineVal, aboutVal,
        addressVal, emailVal, phoneVal, hoursVal,
        copyVal, serializedLinks, showSocialVal,
        showMapVal, mapUrlVal, bottomBarVal
      ]);
    } else {
      await pool.query(`
        UPDATE footer_info SET
          brand_title = ?,
          brand_tagline = ?,
          about_text = ?,
          address = ?,
          email = ?,
          phone = ?,
          operational_hours = ?,
          copyright_text = ?,
          quick_links = ?,
          show_social_links = ?,
          show_map_link = ?,
          map_url = ?,
          bottom_bar_text = ?
        WHERE id = 1
      `, [
        titleVal, taglineVal, aboutVal,
        addressVal, emailVal, phoneVal, hoursVal,
        copyVal, serializedLinks, showSocialVal,
        showMapVal, mapUrlVal, bottomBarVal
      ]);
    }

    res.json({
      message: 'Informasi Footer berhasil diperbarui!',
      data: {
        id: 1,
        brand_title: titleVal,
        brand_tagline: taglineVal,
        about_text: aboutVal,
        address: addressVal,
        email: emailVal,
        phone: phoneVal,
        operational_hours: hoursVal,
        copyright_text: copyVal,
        quick_links: safeParseQuickLinks(serializedLinks),
        show_social_links: showSocialVal,
        show_map_link: showMapVal,
        map_url: mapUrlVal,
        bottom_bar_text: bottomBarVal
      }
    });
  } catch (err) {
    console.error('Error in /api/footer-info/edit:', err);
    res.status(500).json({ error: 'Gagal memperbarui informasi footer: ' + (err.message || 'Server error') });
  }
});

module.exports = router;
