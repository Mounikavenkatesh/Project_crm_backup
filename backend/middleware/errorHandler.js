import { errorResponse } from '../utils/apiResponse.js';

/**
 * Global Express error handling middleware.
 */
export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Server error';
  let errors = null;

  // Clone details for development inspection
  const errorObj = { ...err };
  errorObj.message = err.message;
  errorObj.stack = err.stack;

  // 1. Mongoose Validation Error (validation fails on schema level)
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    errors = Object.keys(err.errors).map((key) => ({
      field: key,
      message: err.errors[key].message,
    }));
  }

  // 2. Mongoose Cast Error (invalid ObjectId formatting)
  else if (err.name === 'CastError') {
    statusCode = 404;
    message = 'Resource not found';
  }

  // 3. MongoDB Duplicate Key Error (e.g. duplicate email registration)
  else if (err.code === 11000) {
    statusCode = 409;
    const duplicatedField = Object.keys(err.keyValue || {})[0] || 'field';
    message = `${duplicatedField.charAt(0).toUpperCase() + duplicatedField.slice(1)} already exists`;
    errors = [
      {
        field: duplicatedField,
        message: `${duplicatedField.charAt(0).toUpperCase() + duplicatedField.slice(1)} is already registered`,
      },
    ];
  }

  // 4. JWT Validation Errors
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Token is invalid';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token has expired, please login again';
  }

  // Log server errors for debugging in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error Intercepted by Global Handler:', err);
    return res.status(statusCode).json({
      success: false,
      message,
      errors: errors || undefined,
      stack: err.stack,
    });
  }

  // Production response (no stack trace)
  return res.status(statusCode).json({
    success: false,
    message,
    errors: errors || undefined,
  });
};
