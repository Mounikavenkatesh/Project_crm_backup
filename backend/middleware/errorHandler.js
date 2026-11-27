/**
 * Global Express error handling middleware for Prisma + JWT + API errors.
 */
export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Server error';
  let errors = null;

  // 1. Prisma Known Request Errors (unique constraints, not found, foreign keys)
  if (err.code === 'P2002') {
    statusCode = 409;
    const target = Array.isArray(err.meta?.target)
      ? err.meta.target[0]
      : err.meta?.target || 'field';
    const label = String(target).charAt(0).toUpperCase() + String(target).slice(1);
    message = `${label} already exists`;
    errors = [{ field: String(target), message: `${label} is already registered` }];
  } else if (err.code === 'P2025') {
    statusCode = 404;
    message = 'Resource not found';
  } else if (err.code === 'P2003') {
    statusCode = 400;
    message = 'Invalid reference provided';
  } else if (err.name === 'PrismaClientValidationError') {
    statusCode = 400;
    message = 'Invalid request data';
  }
  // 2. JWT Validation Errors
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Token is invalid';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token has expired, please login again';
  }
  // 3. CORS / explicit HTTP errors
  else if (err.message === 'Not allowed by CORS') {
    statusCode = 403;
  }

  if (process.env.NODE_ENV === 'development') {
    console.error('Error Intercepted by Global Handler:', err);
    return res.status(statusCode).json({
      success: false,
      message,
      errors: errors || undefined,
      stack: err.stack,
    });
  }

  return res.status(statusCode).json({
    success: false,
    message,
    errors: errors || undefined,
  });
};
