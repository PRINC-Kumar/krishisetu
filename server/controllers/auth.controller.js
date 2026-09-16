import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { User } from "../models/User.model.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";
import {
  cookieOptions,
  refreshCookieOptions,
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateToken.js";
import { generateOtp, hashOtp, verifyOtp } from "../services/otp.service.js";
import { env } from "../config/env.js";

export const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  businessName: user.businessName,
  farmSize: user.farmSize,
  location: user.location,
  isVerified: user.isVerified,
});

// Registers users with passwords for all roles.
export const register = async (req, res, next) => {
  try {
    const {
      role,
      name,
      email,
      phone,
      password,
      confirmPassword,
      businessName,
      farmSize,
      location,
    } = req.body;

    if (!["farmer", "buyer"].includes(role)) {
      return sendError(res, "Only farmers and buyers can self-register", 400);
    }
    if (!password || password !== confirmPassword) {
      return sendError(res, "Passwords do not match or are missing", 400);
    }
    if (password.length < 6) {
      return sendError(res, "Password must be at least 6 characters", 400);
    }

    const trimmedEmail = email?.trim().toLowerCase();
    const trimmedPhone = phone?.trim();

    const existing = await User.findOne({
      $or: [{ phone: trimmedPhone }, ...(trimmedEmail ? [{ email: trimmedEmail }] : [])],
    });
    if (existing) {
      return sendError(
        res,
        "An account already exists with this phone or email",
        409,
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      role,
      name: name?.trim(),
      email: trimmedEmail,
      phone: trimmedPhone,
      password: hashedPassword,
      businessName: role === "buyer" ? businessName : undefined,
      farmSize: role === "farmer" ? farmSize : undefined,
      location: location || { state: "Maharashtra", district: "Pune" },
      isVerified: role === "buyer", // Farmers require admin approval for verification
    });

    sendSuccess(res, "Registration successful", publicUser(user), 201);
  } catch (error) {
    next(error);
  }
};

// Logs in users using email, password, and explicit role verification.
export const loginWithPassword = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;
    const trimmedEmail = email?.trim().toLowerCase();

    const user = await User.findOne({ email: trimmedEmail }).select(
      "+password +refreshTokenHash",
    );
    if (!user) {
      return sendError(res, "Invalid credentials", 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return sendError(res, "Invalid credentials", 401);
    }

    // Role Verification: Compare selected role with actual database role
    if (role && user.role !== role) {
      return sendError(
        res,
        `Role mismatch: Your account is registered as a ${user.role}, not ${role}`,
        403,
      );
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await user.save();

    res.cookie("refreshToken", refreshToken, refreshCookieOptions);
    res.cookie("token", accessToken, cookieOptions);

    sendSuccess(res, "Login successful", {
      ...publicUser(user),
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

// Refreshes the short-lived access token using the HttpOnly refresh token cookie.
export const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      return sendError(res, "No refresh token provided", 401);
    }

    let decoded;
    try {
      decoded = jwt.verify(token, env.jwtRefreshSecret);
    } catch {
      return sendError(res, "Invalid or expired refresh token", 401);
    }

    const user = await User.findById(decoded.id).select("+refreshTokenHash");
    if (!user || !user.refreshTokenHash) {
      return sendError(res, "Session revoked or user not found", 401);
    }

    const isMatch = await bcrypt.compare(token, user.refreshTokenHash);
    if (!isMatch) {
      return sendError(res, "Invalid refresh token", 401);
    }

    const newAccessToken = generateAccessToken(user);
    res.cookie("token", newAccessToken, cookieOptions);

    sendSuccess(res, "Token refreshed", {
      accessToken: newAccessToken,
      user: publicUser(user),
    });
  } catch (error) {
    next(error);
  }
};

// Sends a development OTP for farmer login.
export const requestFarmerOtp = async (req, res, next) => {
  try {
    const { phone } = req.body;
    const user = await User.findOne({ phone: phone?.trim(), role: "farmer" }).select(
      "+otpHash",
    );
    if (!user) return sendError(res, "Farmer not found with this phone number", 404);

    const otp = generateOtp();
    user.otpHash = await hashOtp(otp);
    user.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    sendSuccess(
      res,
      "OTP sent. Development OTP is included for testing",
      { phone, devOtp: otp },
    );
  } catch (error) {
    next(error);
  }
};

// Verifies the farmer OTP and issues access & refresh tokens.
export const verifyFarmerOtp = async (req, res, next) => {
  try {
    const { phone, otp } = req.body;
    const user = await User.findOne({ phone: phone?.trim(), role: "farmer" }).select(
      "+otpHash +refreshTokenHash",
    );
    if (!user || !user.otpHash || user.otpExpiresAt < new Date()) {
      return sendError(res, "OTP expired or invalid", 401);
    }

    const isMatch = await verifyOtp(otp, user.otpHash);
    if (!isMatch) return sendError(res, "Invalid OTP", 401);

    user.otpHash = undefined;
    user.otpExpiresAt = undefined;

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await user.save();

    res.cookie("refreshToken", refreshToken, refreshCookieOptions);
    res.cookie("token", accessToken, cookieOptions);

    sendSuccess(res, "Farmer login successful", {
      ...publicUser(user),
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

// Restores the logged-in session.
export const me = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return sendError(res, "User not found", 404);
    sendSuccess(res, "Session restored", publicUser(user));
  } catch (error) {
    next(error);
  }
};

// Invalidates refresh token and clears all auth cookies.
export const logout = async (req, res) => {
  try {
    if (req.user?.id) {
      await User.findByIdAndUpdate(req.user.id, { refreshTokenHash: null });
    } else if (req.cookies?.refreshToken) {
      try {
        const decoded = jwt.verify(req.cookies.refreshToken, env.jwtRefreshSecret);
        if (decoded?.id) {
          await User.findByIdAndUpdate(decoded.id, { refreshTokenHash: null });
        }
      } catch {
        // Ignore jwt verification errors on logout
      }
    }
  } catch {
    // Continue cookie cleanup even if db call fails
  }

  res.clearCookie("refreshToken", refreshCookieOptions);
  res.clearCookie("token", cookieOptions);
  sendSuccess(res, "Logged out successfully");
};

// Creates a reset token for accounts.
export const forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({
      email: req.body.email?.trim().toLowerCase(),
    });
    if (!user) return sendError(res, "No account found with this email", 404);

    const rawToken = crypto.randomBytes(24).toString("hex");
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");
    user.resetPasswordExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    sendSuccess(res, "Reset token created for testing", {
      resetToken: rawToken,
    });
  } catch (error) {
    next(error);
  }
};

// Applies a new password after validating the reset token.
export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    if (!token || !password || password.length < 6) {
      return sendError(res, "Valid token and password (min 6 characters) are required", 400);
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpiresAt: { $gt: new Date() },
    }).select("+password +resetPasswordToken");

    if (!user) return sendError(res, "Reset token expired or invalid", 401);

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;
    user.refreshTokenHash = null; // Revoke existing sessions on password change
    await user.save();

    sendSuccess(res, "Password reset successful");
  } catch (error) {
    next(error);
  }
};
