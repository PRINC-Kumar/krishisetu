import express from "express";
import { body } from "express-validator";
import {
  createAdmin,
  getAllListings,
  getAllOrders,
  getAllUsers,
  getDashboard,
  updateDispute,
  verifyFarmer,
} from "../controllers/admin.controller.js";
import { restrictTo, verifyToken } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";

const router = express.Router();

router.use(verifyToken, restrictTo("admin"));
router.get("/dashboard", getDashboard);
router.get("/users", getAllUsers);
router.patch(
  "/farmers/:id/verify",
  body("isVerified").isBoolean().withMessage("isVerified must be a boolean"),
  validate,
  verifyFarmer,
);
router.post(
  "/admins",
  body("name").notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("phone").notEmpty().withMessage("Phone number is required"),
  body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
  validate,
  createAdmin,
);
router.get("/listings", getAllListings);
router.get("/orders", getAllOrders);
router.patch(
  "/orders/:id/dispute",
  body("status").isIn(["none", "flagged", "resolved"]).withMessage("Invalid dispute status"),
  validate,
  updateDispute,
);

export default router;
