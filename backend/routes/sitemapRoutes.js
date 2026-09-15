const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

router.get('/sitemap.xml', async (req, res) => {
  try {
    const baseUrl = 'https://vidyavardhana.my.id';
    
    // Static Routes
    const staticRoutes = [
      '',
      '/profile',
      '/media',
      '/berita',
      '/login'
    ];

    // Fetch dynamic article routes
    const [articles] = await pool.query('SELECT slug, created_at FROM articles ORDER BY created_at DESC');

    // Start XML string
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // Add static routes
    staticRoutes.forEach((route) => {
      sitemap += `
  <url>
    <loc>${baseUrl}${route}</loc>
    <changefreq>weekly</changefreq>
    <priority>${route === '' ? '1.0' : '0.8'}</priority>
  </url>`;
    });

    // Add dynamic article routes
    articles.forEach((article) => {
      const lastModDate = article.created_at ? new Date(article.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      sitemap += `
  <url>
    <loc>${baseUrl}/berita/${article.slug}</loc>
    <lastmod>${lastModDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
    });

    // End XML string
    sitemap += `
</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(sitemap);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
});

module.exports = router;
