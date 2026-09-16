export const sendSuccess = (res, message, data = null, statusCode = 200) =>
  res.status(statusCode).json({ success: true, message, data });

export const sendError = (res, message, statusCode = 500, data = null) =>
  res.status(statusCode).json({ success: false, message, data });
