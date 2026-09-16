import { sendError } from "../utils/apiResponse.js";
import { logger } from "../utils/logger.js";

export const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

export const errorHandler = (err, req, res, next) => {
  logger.error(err.message, err.stack);
  sendError(res, err.message || "Server error", err.statusCode || 500);
};
