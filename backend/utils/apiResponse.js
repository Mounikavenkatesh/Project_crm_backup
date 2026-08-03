/**
 * Send a success response.
 * @param {object} res Express response object.
 * @param {any} data Response payload.
 * @param {string} message Optional success message.
 * @param {number} statusCode HTTP status code (default: 200).
 */
export const successResponse = (res, data, message, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Send an error response.
 * @param {object} res Express response object.
 * @param {string} message Error message.
 * @param {number} statusCode HTTP status code (default: 500).
 * @param {any} errors Additional structured error details (e.g. validation errors).
 */
export const errorResponse = (res, message, statusCode = 500, errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};

/**
 * Send a paginated success response.
 * @param {object} res Express response object.
 * @param {array} data Paginated array of items.
 * @param {number} total Total number of items across all pages.
 * @param {number} page Current page number.
 * @param {number} limit Items per page.
 */
export const paginatedResponse = (res, data, total, page, limit) => {
  const pages = Math.ceil(total / limit) || 1;
  return res.status(200).json({
    success: true,
    data,
    pagination: {
      total,
      page,
      limit,
      pages,
      hasNext: page < pages,
      hasPrev: page > 1,
    },
  });
};
