const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'kkn_vidyavardhana_secret_key_123';

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).json({ error: 'No token provided.' });

  const bearerToken = token.split(' ')[1] || token;

  jwt.verify(bearerToken, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Failed to authenticate token.' });
    req.userId = decoded.id;
    req.userRole = decoded.role;
    req.username = decoded.username;
    next();
  });
};

const isAdmin = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ error: 'Akses ditolak: Hanya Admin yang diizinkan.' });
  }
  next();
};

module.exports = { verifyToken, isAdmin, JWT_SECRET };

