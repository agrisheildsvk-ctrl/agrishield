const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'agrishield_fallback_secret_key_2026';

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];

    // Support Admin Session auth token 'true'
    if (token === 'true') {
      req.user = { id: 0, role: 'admin', name: 'Admin' };
      return next();
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized', error: error.message });
  }
};

module.exports = authMiddleware;
