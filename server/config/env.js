import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: process.env.PORT || 5001,
  mongoUri: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/krishisetu",
  jwtSecret: process.env.JWT_SECRET || "dev-secret-change-me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "15m",
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  jwtRefreshSecret:
    process.env.JWT_REFRESH_SECRET ||
    (process.env.JWT_SECRET
      ? process.env.JWT_SECRET + "-refresh"
      : "dev-refresh-secret-change-me"),
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  nodeEnv: process.env.NODE_ENV || "development",
  cookieSecure: process.env.COOKIE_SECURE === "true",
};
