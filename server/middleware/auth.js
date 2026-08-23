const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');

    // Look up user in MongoDB — supports both string ids (legacy) and ObjectIds
    let user = null;
    try {
      user = await User.findById(decoded.id).lean();
    } catch (e) {
      // decoded.id might not be a valid ObjectId in legacy tokens — treat as not found
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid token.' });
    }

    // Normalize: expose `id` as a string for all route handlers
    req.user = {
      ...user,
      id: user._id.toString(),
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Invalid token.' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Access denied. Please authenticate.' });
    }

    if (!roles.includes(req.user.userType)) {
      return res.status(403).json({
        message: `Access denied. Required role: ${roles.join(' or ')}`
      });
    }

    next();
  };
};

const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
      try {
        const user = await User.findById(decoded.id).lean();
        if (user) {
          req.user = { ...user, id: user._id.toString() };
        }
      } catch (e) {
        // Not a valid ObjectId — skip optional auth
      }
    }

    next();
  } catch (error) {
    // Continue without authentication for optional auth
    next();
  }
};

module.exports = { auth, authorize, optionalAuth };
