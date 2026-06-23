const jwt = require('jsonwebtoken');
const User = require('../models/UserPostgres');

// Protect routes - require authentication
exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route',
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');

    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'No user found with this token',
      });
    }

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route',
    });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `User role ${req.user.role} is not authorized to access this route`,
      });
    }
    next();
  };
};

// Check specific permissions
exports.checkPermission = (module, action) => {
  return (req, res, next) => {
    // Admin users get full access across modules.
    const role = String(req.user.role || '').toLowerCase();
    if (['admin', 'super admin', 'super-admin', 'superadmin'].includes(role)) {
      return next();
    }

    let userPermissions = req.user.permissions || [];
    if (typeof userPermissions === 'string') {
      try {
        userPermissions = JSON.parse(userPermissions);
      } catch (_err) {
        userPermissions = [];
      }
    }
    if (!Array.isArray(userPermissions)) {
      userPermissions = [];
    }

    const modulePermission = userPermissions.find(p => p.module === module);

    if (!modulePermission || !modulePermission.actions.includes(action)) {
      return res.status(403).json({
        success: false,
        error: `User does not have ${action} permission for ${module}`,
      });
    }
    next();
  };
};