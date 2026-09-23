const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');

// Potential locations for index.html (works locally, in production cPanel, and dev)
const candidatePaths = [
  path.join(__dirname, '../../frontend/dist/index.html'),
  path.join(__dirname, '../public/index.html'),
  '/home/vidt4129/public_html/index.html',
  path.join(__dirname, '../../frontend/index.html')
];

function getHtmlTemplate() {
  for (const p of candidatePaths) {
    if (fs.existsSync(p)) {
      try {
        return fs.readFileSync(p, 'utf8');
      } catch (e) {
        // continue
      }
    }
  }
  return null;
}

function stripHtml(html) {
  if (!html) return '';
  return html
    .replace(/<[^>]*>?/gm, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

async function handleShare(req, res) {
  const { category, slug } = req.params;
  const baseUrl = 'https://vidyavardhana.my.id';
  let html = getHtmlTemplate();

  if (!html) {
    return res.status(500).send('Frontend index.html template not found');
  }

  try {
    let title = 'KKN Vidya Vardhana UNUSIA';
    let description = 'Website Resmi KKN Vidya Vardhana UNUSIA. Portal informasi, berita, artikel, dan publikasi program kerja Kuliah Kerja Nyata (KKN).';
    let imageUrl = `${baseUrl}/og-image.jpg`;
    let pageUrl = `${baseUrl}/${category || 'berita'}/${slug || ''}`;
    let ogType = 'article';

    if (['portofolio', 'portfolio', 'profil'].includes(category)) {
      // Find team member profile
      let [members] = await pool.query('SELECT * FROM team_members WHERE slug = ? LIMIT 1', [slug]);
      if (members.length === 0) {
        [members] = await pool.query('SELECT * FROM team_members WHERE name LIKE ? LIMIT 1', [`%${(slug || '').replace(/-/g, ' ')}%`]);
      }

      if (members.length > 0) {
        const m = members[0];
        title = `${m.name} (${m.role}) | Tim KKN Vidya Vardhana`;
        description = `Profil anggota tim KKN Vidya Vardhana UNUSIA: ${m.name} - ${m.role}${m.major ? ` (${m.major})` : ''}. ${stripHtml(m.bio || '')}`;
        if (m.image_url) {
          imageUrl = m.image_url.startsWith('http') ? m.image_url : `${baseUrl}${m.image_url.startsWith('/') ? '' : '/'}${m.image_url}`;
        }
        ogType = 'profile';
      }
    } else {
      // Find article (berita, publikasi, modul, jurnal)
      let [articles] = await pool.query('SELECT * FROM articles WHERE slug = ? LIMIT 1', [slug]);

      // Fallback 1: match by 4+ digit suffix if URL contains random id (e.g. -8868)
      if (articles.length === 0 && slug) {
        const parts = slug.split('-');
        const lastPart = parts[parts.length - 1];
        if (/^\d{4,}$/.test(lastPart)) {
          [articles] = await pool.query('SELECT * FROM articles WHERE slug LIKE ? LIMIT 1', [`%-${lastPart}`]);
        }
      }

      // Fallback 2: match by slug prefix
      if (articles.length === 0 && slug) {
        const prefixWords = slug.split('-').slice(0, 3).join('-');
        if (prefixWords && prefixWords.length >= 6) {
          [articles] = await pool.query('SELECT * FROM articles WHERE slug LIKE ? LIMIT 1', [`${prefixWords}%`]);
        }
      }

      if (articles.length > 0) {
        const a = articles[0];
        title = a.title;
        const excerpt = a.abstract ? stripHtml(a.abstract) : stripHtml(a.content || '');
        description = excerpt ? (excerpt.length > 180 ? excerpt.slice(0, 177) + '...' : excerpt) : description;

        if (a.image_url) {
          let rawImg = a.image_url.startsWith('http') ? a.image_url : `${baseUrl}${a.image_url.startsWith('/') ? '' : '/'}${a.image_url}`;
          
          // Smart check: If image is a PNG, check if an optimized .jpg version exists on disk
          const rawBasename = path.basename((a.image_url || '').split('?')[0]);
          const jpgBasename = rawBasename.replace(/\.png$/i, '.jpg');
          const localJpg = path.join(__dirname, '../uploads', jpgBasename);
          if (rawBasename.toLowerCase().endsWith('.png') && fs.existsSync(localJpg)) {
            imageUrl = `${baseUrl}/uploads/${jpgBasename}`;
          } else {
            imageUrl = rawImg;
          }
        }
        ogType = 'article';
      }
    }

    const safeTitle = escapeHtml(title);
    const safeDesc = escapeHtml(description);
    const safeImage = escapeHtml(imageUrl);
    const safeUrl = escapeHtml(pageUrl);

    // Dynamic mime type detection for og:image:type
    const ext = path.extname((imageUrl || '').split('?')[0]).toLowerCase();
    let imageMime = 'image/jpeg';
    if (ext === '.png') imageMime = 'image/png';
    else if (ext === '.webp') imageMime = 'image/webp';
    else if (ext === '.gif') imageMime = 'image/gif';

    // Replace Title tag
    html = html.replace(/<title>.*?<\/title>/i, `<title>${safeTitle} | KKN Vidya Vardhana</title>`);

    // Clean up existing og/twitter meta to avoid duplicated tags
    html = html.replace(/<meta\s+property=["']og:[^"']*["'][^>]*>\s*/gi, '');
    html = html.replace(/<meta\s+name=["']twitter:[^"']*["'][^>]*>\s*/gi, '');
    html = html.replace(/<meta\s+name=["']description["'][^>]*>\s*/gi, '');

    const metaTags = `
    <meta name="description" content="${safeDesc}" />

    <!-- Open Graph / WhatsApp / Facebook Preview -->
    <meta property="og:type" content="${ogType}" />
    <meta property="og:site_name" content="KKN Vidya Vardhana" />
    <meta property="og:title" content="${safeTitle}" />
    <meta property="og:description" content="${safeDesc}" />
    <meta property="og:image" content="${safeImage}" />
    <meta property="og:image:secure_url" content="${safeImage}" />
    <meta property="og:image:type" content="${imageMime}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${safeTitle}" />
    <meta property="og:url" content="${safeUrl}" />

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${safeTitle}" />
    <meta name="twitter:description" content="${safeDesc}" />
    <meta name="twitter:image" content="${safeImage}" />
    `;

    html = html.replace('</head>', `${metaTags}\n  </head>`);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=600');
    return res.send(html);
  } catch (err) {
    console.error('[shareRoutes] Error processing meta tags:', err);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(html);
  }
}

// Support /share/:category/:slug (reverse proxied from Apache)
router.get('/share/:category/:slug', handleShare);

// Also direct routes if accessed directly via Node
router.get(['/berita/:slug', '/publikasi/:slug', '/modul/:slug', '/jurnal/:slug', '/portofolio/:slug', '/portfolio/:slug', '/profil/:slug'], (req, res) => {
  const parts = req.path.split('/').filter(Boolean);
  req.params.category = parts[0] || 'berita';
  req.params.slug = parts[1] || '';
  return handleShare(req, res);
});

module.exports = router;
