import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { sendError } from "../utils/apiResponse.js";

// Verifies Bearer token from header or fallback cookie.
export const verifyToken = (req, res, next) => {
  let token = null;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return sendError(res, "Please login to continue", 401);
  }

  try {
    req.user = jwt.verify(token, env.jwtSecret);
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return sendError(res, "Access token expired", 401, { expired: true });
    }
    return sendError(res, "Session invalid. Please login again", 401);
  }
};

export const requireAuth = verifyToken;

// Centralized role-based access control (RBAC).
export const restrictTo =
  (...allowedRoles) =>
  (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return sendError(res, "You are not authorized for this action", 403);
    }
    next();
  };

export const requireRole = restrictTo;
