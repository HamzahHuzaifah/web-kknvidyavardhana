const express = require('express');
const cors = require('cors');
const { initDB } = require('./config/db');
const { uploadDir, syncExistingUploads } = require('./utils/fileHelper');

// Modular Route Handlers
const authRoutes = require('./routes/authRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const articleRoutes = require('./routes/articleRoutes');
const fileRoutes = require('./routes/fileRoutes');
const profileRoutes = require('./routes/profileRoutes');
const mediaRoutes = require('./routes/mediaRoutes');

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
app.use('/api', attendanceRoutes);
app.use('/api', articleRoutes);
app.use('/api', fileRoutes);
app.use('/api', profileRoutes);
app.use('/api', mediaRoutes);

// Root healthcheck
app.get('/', (req, res) => {
  res.send('API KKN Vidya Vardhana is running cleanly.');
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running cleanly on http://localhost:${PORT}`);
});
