import bcrypt from "bcryptjs";
import crypto from "crypto";
import express from "express";
import { body } from "express-validator";
import { User } from "../models/User.model.js";
import { validate } from "../middleware/validate.middleware.js";
import { sendError, sendSuccess } from "../utils/apiResponse.js";
import { generateOtp, generateResetToken, hashValue } from "../utils/otp.js";
import { sendPasswordResetOtp } from "../services/emailService.js";

const router = express.Router();
const OTP_EXPIRY_MS = 5 * 60 * 1000;
const RESET_TOKEN_EXPIRY_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;
const genericMessage = "If account exists, OTP sent.";

const normalizeEmail = (email) => email.trim().toLowerCase();
const hashesMatch = (value, expectedHash) => {
  const actual = Buffer.from(hashValue(value), "hex");
  const expected = Buffer.from(expectedHash, "hex");
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
};

router.post(
  "/forgot-password",
  body("email").isEmail().withMessage("Valid email is required"),
  validate,
  async (req, res, next) => {
    try {
      const email = normalizeEmail(req.body.email);
      const user = await User.findOne({ email }).select("+otpHash");

      if (!user) return sendSuccess(res, genericMessage);

      if (user.otpResendAt && user.otpResendAt > new Date()) {
        return sendSuccess(res, genericMessage);
      }

      const otp = generateOtp();
      await sendPasswordResetOtp(email, otp);
      user.otpHash = hashValue(otp);
      user.otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MS);
      user.otpAttempts = 0;
      user.otpResendAt = new Date(Date.now() + RESEND_COOLDOWN_MS);
      await user.save();

      return sendSuccess(res, genericMessage);
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  "/verify-otp",
  body("email").isEmail().withMessage("Valid email is required"),
  body("otp")
    .matches(/^[0-9]{6}$/)
    .withMessage("OTP must be 6 digits"),
  validate,
  async (req, res, next) => {
    try {
      const user = await User.findOne({ email: normalizeEmail(req.body.email) }).select(
        "+otpHash",
      );

      if (!user || !user.otpHash || !user.otpExpiresAt || user.otpExpiresAt <= new Date()) {
        return sendError(res, "OTP expired or invalid", 401);
      }

      if ((user.otpAttempts || 0) >= MAX_OTP_ATTEMPTS) {
        return sendError(res, "Maximum OTP attempts exceeded", 429);
      }

      if (!hashesMatch(req.body.otp, user.otpHash)) {
        user.otpAttempts = (user.otpAttempts || 0) + 1;
        await user.save();
        return sendError(res, "Invalid OTP", 401);
      }

      const resetToken = generateResetToken();
      user.resetPasswordToken = hashValue(resetToken);
      user.resetPasswordExpiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_MS);
      user.otpHash = undefined;
      user.otpExpiresAt = undefined;
      user.otpAttempts = 0;
      user.otpResendAt = undefined;
      await user.save();

      return sendSuccess(res, "OTP verified", { resetToken });
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  "/reset-password",
  body("resetToken").trim().notEmpty().withMessage("Reset token is required"),
  body("newPassword")
    .matches(passwordPattern)
    .withMessage("Password must be at least 8 characters with upper, lower, number, and special character"),
  validate,
  async (req, res, next) => {
    try {
      const user = await User.findOne({
        resetPasswordToken: hashValue(req.body.resetToken),
        resetPasswordExpiresAt: { $gt: new Date() },
      }).select("+password +resetPasswordToken");

      if (!user) return sendError(res, "Reset token expired or invalid", 401);

      user.password = await bcrypt.hash(req.body.newPassword, 10);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpiresAt = undefined;
      user.otpHash = undefined;
      user.otpExpiresAt = undefined;
      user.otpAttempts = 0;
      user.otpResendAt = undefined;
      user.refreshTokenHash = null;
      await user.save();

      return sendSuccess(res, "Password reset successful");
    } catch (error) {
      next(error);
    }
  },
);

export default router;
