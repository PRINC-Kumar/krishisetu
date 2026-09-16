export const logger = {
  info: (message) => console.log(`[info] ${message}`),
  error: (message, details = "") =>
    console.error(`[error] ${message}`, details),
};
