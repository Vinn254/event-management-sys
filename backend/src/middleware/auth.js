const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'event-management-secret-key-2024');
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        // User not found (possibly due to mock database reset)
        // Clear the invalid token from client
        return res.status(401).json({ 
          message: 'Session expired or invalid. Please login again.',
          code: 'TOKEN_INVALID'
        });
      }
      
      next();
    } catch (error) {
      console.error('Auth error:', error.message);
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Invalid token. Please login again.', code: 'INVALID_TOKEN' });
      }
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired. Please login again.', code: 'TOKEN_EXPIRED' });
      }
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const organizer = (req, res, next) => {
  if (req.user && req.user.role === 'organizer') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as organizer' });
  }
};

module.exports = { protect, organizer };
