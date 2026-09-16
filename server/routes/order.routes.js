import express from "express";
import { body } from "express-validator";
import {
  createOrder,
  disputeOrder,
  getMyOrders,
  updateOrderStatus,
} from "../controllers/order.controller.js";
import { restrictTo, verifyToken } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";

const router = express.Router();

router.post(
  "/",
  verifyToken,
  restrictTo("buyer"),
  body("listingId").notEmpty().withMessage("Listing ID is required"),
  body("quantity").isNumeric().withMessage("Quantity must be numeric"),
  body("paymentMethod").isIn(["COD", "Pay Offline"]).withMessage("Invalid payment method"),
  validate,
  createOrder,
);

router.get("/mine", verifyToken, restrictTo("buyer", "farmer"), getMyOrders);

router.patch(
  "/:id/status",
  verifyToken,
  restrictTo("buyer", "farmer", "admin"),
  body("status").isIn([
    "Pending",
    "Accepted",
    "Shipped",
    "Delivered",
    "Cancelled",
  ]).withMessage("Invalid status value"),
  validate,
  updateOrderStatus,
);

router.patch(
  "/:id/dispute",
  verifyToken,
  restrictTo("buyer", "farmer"),
  disputeOrder,
);

export default router;
