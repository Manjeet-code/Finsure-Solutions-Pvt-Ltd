import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'finsure-dev-jwt-secret-key-dev');

      // Get user from token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'User associated with token no longer exists' });
      }

      return next();
    } catch (error) {
      console.error('[Auth Error]', error.message);
      return res.status(401).json({ message: 'Not authorized, invalid or expired token' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no authorization token provided' });
  }
};

// Flexible Role-Based Access Control (RBAC) middleware
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized, user missing' });
    }

    const rawRole = (req.user.role || '').trim();
    const normalizeRole = (r) => {
      const u = r.toUpperCase();
      if (u === 'ADMIN' || u === 'SUPER ADMIN') return 'ADMIN';
      if (u === 'BRANCH MANAGER' || u === 'BRANCH_MANAGER') return 'BRANCH_MANAGER';
      if (u === 'CITIZEN' || u === 'USER') return 'USER';
      return u;
    };

    const userRoleNormalized = normalizeRole(rawRole);
    const allowedRolesNormalized = roles.map(normalizeRole);

    if (!allowedRolesNormalized.includes(userRoleNormalized)) {
      return res.status(403).json({
        message: `Access denied: Role '${rawRole}' is not authorized to access this resource`
      });
    }

    next();
  };
};

// Legacy role helpers for backwards compatibility
export const admin = (req, res, next) => authorize('ADMIN')(req, res, next);
export const manager = (req, res, next) => authorize('BRANCH_MANAGER', 'ADMIN')(req, res, next);
