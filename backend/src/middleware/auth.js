const { getAuth } = require('../utils/firebase');
const { logger } = require('../utils/logger');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await getAuth().verifyIdToken(token);

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name || '',
      picture: decodedToken.picture || '',
      // Roles must be assigned by a trusted administrator via Firebase custom claims,
      // never accepted from a request body or client-side profile.
      role: decodedToken.role || (decodedToken.admin === true ? 'admin' : 'user')
    };

    next();
  } catch (error) {
    logger.error('Auth error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (roles.length > 0 && !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

module.exports = { authenticate, authorize };
