const jwt = require('jsonwebtoken');
const db = require('../models');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access token required' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user exists and get their role
    let user = await db.Manager.findByPk(decoded.id);
    let role = 'manager';
    
    if (!user) {
      user = await db.Facilitator.findByPk(decoded.id);
      role = 'facilitator';
    }

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token' 
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: role
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token' 
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expired' 
      });
    }
    return res.status(500).json({ 
      success: false, 
      message: 'Authentication error' 
    });
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Insufficient permissions.' 
      });
    }

    next();
  };
};

const authorizeManager = authorizeRoles('manager');
const authorizeFacilitator = authorizeRoles('facilitator');
const authorizeManagerOrFacilitator = authorizeRoles('manager', 'facilitator');

module.exports = {
  authenticateToken,
  authorizeRoles,
  authorizeManager,
  authorizeFacilitator,
  authorizeManagerOrFacilitator
}; 