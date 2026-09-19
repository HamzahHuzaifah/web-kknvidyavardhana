const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDB } = require('./config/db');
const { uploadDir, syncExistingUploads } = require('./utils/fileHelper');

const authRoutes = require('./routes/authRoutes');
const articleRoutes = require('./routes/articleRoutes');
const fileRoutes = require('./routes/fileRoutes');
const profileRoutes = require('./routes/profileRoutes');
const mediaRoutes = require('./routes/mediaRoutes');
const jumbotronRoutes = require('./routes/jumbotronRoutes');
const sitemapRoutes = require('./routes/sitemapRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Expose static uploads folder
app.use('/uploads', express.static(uploadDir));

// Initialize Database & sync media files
initDB(syncExistingUploads);

// Register API Routes
app.use('/api', authRoutes);
app.use('/api', articleRoutes);
app.use('/api', fileRoutes);
app.use('/api', profileRoutes);
app.use('/api', mediaRoutes);
app.use('/api/jumbotron', jumbotronRoutes);

// Explicit 404 Handler untuk rute /api yang tidak terdaftar (Mencegah fallback ke index.html)
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Endpoint API tidak ditemukan.' });
});

// Register Sitemap Route
app.use('/', sitemapRoutes);

// Serve Frontend static files
const frontendDistPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendDistPath));

// Catch-all: semua route selain /api dan /uploads diarahkan ke React
app.use((req, res) => {
  res.sendFile(path.join(frontendDistPath, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running cleanly on http://localhost:${PORT}`);
});
