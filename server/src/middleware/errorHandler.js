import { sendError } from '../utils/apiResponse.js';

export const errorHandler = (err, req, res, next) => {
  console.error(`[Error] ${req.method} ${req.url}:`, err.stack || err.message);

  const statusCode = err.statusCode || res.statusCode === 200 ? 500 : res.statusCode;
  const message = err.message || 'Internal Server Error';

  return sendError(res, message, statusCode, err.errors || null);
};

export const notFoundHandler = (req, res, next) => {
  return sendError(res, `Route not found: ${req.originalUrl}`, 404);
};
