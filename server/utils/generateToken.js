import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const generateAccessToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, env.jwtSecret, {
    expiresIn: env.jwtAccessExpiresIn,
  });

export const generateRefreshToken = (user) =>
  jwt.sign({ id: user._id }, env.jwtRefreshSecret, {
    expiresIn: env.jwtRefreshExpiresIn,
  });

export const generateToken = generateAccessToken;

export const cookieOptions = {
  httpOnly: true,
  secure: env.cookieSecure,
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/",
};

export const refreshCookieOptions = {
  httpOnly: true,
  secure: env.cookieSecure,
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/",
};
