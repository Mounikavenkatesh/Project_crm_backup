import jwt from 'jsonwebtoken';
import prisma from '../config/database.js';
import { errorResponse } from '../utils/apiResponse.js';
import { formatUser } from '../utils/crmEnums.js';

/**
 * Middleware to protect routes by validating incoming JWT in Authorization header.
 */
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return errorResponse(res, 'No token provided, access denied', 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      return errorResponse(res, 'User belonging to this token no longer exists', 401);
    }

    if (!user.isActive) {
      return errorResponse(res, 'Account is deactivated', 403);
    }

    req.user = formatUser(user);
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 'Token has expired, please login again', 401);
    }
    if (error.name === 'JsonWebTokenError') {
      return errorResponse(res, 'Token is invalid', 401);
    }
    return errorResponse(res, 'Not authorized to access this route', 401);
  }
};

/**
 * Role-based authorization middleware.
 * Accepts lowercase role names matching formatUser() output ('admin', 'manager', 'user').
 *
 * @param  {...string} roles
 */
export const authorize = (...roles) => {
  const allowed = roles.map((r) => String(r).toLowerCase());
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Not authorized to access this route', 401);
    }
    if (!allowed.includes(String(req.user.role || '').toLowerCase())) {
      return errorResponse(
        res,
        `Role '${req.user.role}' is not authorized to access this resource`,
        403
      );
    }
    next();
  };
};
