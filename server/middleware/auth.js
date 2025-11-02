const jwt = require('jsonwebtoken');
const User = require('../models/User');
const secret = process.env.JWT_SECRET || 'secret';

async function auth(req, res, next) {
  try {
    // Check if Authorization header exists
    const header = req.headers.authorization;
    if (!header) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'No authorization token provided'
      });
    }

    // Validate token format
    const [bearer, token] = header.split(' ');
    if (bearer !== 'Bearer' || !token) {
      return res.status(401).json({ 
        error: 'Invalid authentication format',
        message: 'Authorization header must be in format: Bearer <token>'
      });
    }

    // Verify token
    let payload;
    try {
      payload = jwt.verify(token, secret);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          error: 'Token expired',
          message: 'Your session has expired. Please login again.'
        });
      }
      return res.status(401).json({
        error: 'Invalid token',
        message: 'The provided authentication token is invalid'
      });
    }

    // Check if user exists
    const user = await User.findById(payload.id).select('-passwordHash');
    if (!user) {
      return res.status(401).json({
        error: 'User not found',
        message: 'The user associated with this token no longer exists'
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(500).json({
      error: 'Authentication error',
      message: 'An error occurred while authenticating your request'
    });
  }
}

module.exports = auth;
