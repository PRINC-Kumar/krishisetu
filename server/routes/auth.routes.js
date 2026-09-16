import express from "express";
import { body } from "express-validator";
import {
  forgotPassword,
  loginWithPassword,
  logout,
  me,
  refreshToken,
  register,
  requestFarmerOtp,
  resetPassword,
  verifyFarmerOtp,
} from "../controllers/auth.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";

const router = express.Router();

router.post(
  "/register",
  body("name").notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("phone").notEmpty().withMessage("Phone is required"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  body("role").isIn(["farmer", "buyer"]).withMessage("Role must be farmer or buyer"),
  validate,
  register,
);

router.post(
  "/login",
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
  body("role").isIn(["farmer", "buyer", "admin"]).withMessage("Role must be farmer, buyer, or admin"),
  validate,
  loginWithPassword,
);

router.post("/refresh", refreshToken);

router.post(
  "/farmer/request-otp",
  body("phone").notEmpty().withMessage("Phone is required"),
  validate,
  requestFarmerOtp,
);

router.post(
  "/farmer/verify-otp",
  body("phone").notEmpty().withMessage("Phone is required"),
  body("otp").isLength({ min: 6, max: 6 }).withMessage("OTP must be 6 digits"),
  validate,
  verifyFarmerOtp,
);

router.post(
  "/forgot-password",
  body("email").isEmail().withMessage("Valid email is required"),
  validate,
  forgotPassword,
);

router.post(
  "/reset-password",
  body("token").notEmpty().withMessage("Reset token is required"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  validate,
  resetPassword,
);

router.get("/me", verifyToken, me);
router.post("/logout", logout);

export default router;
