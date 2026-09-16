import express from "express";
import { body } from "express-validator";
import {
  createOffer,
  decideOffer,
  getOfferThread,
} from "../controllers/offer.controller.js";
import { restrictTo, verifyToken } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";

const router = express.Router();

router.get("/", verifyToken, restrictTo("buyer", "farmer"), getOfferThread);
router.post(
  "/",
  verifyToken,
  restrictTo("buyer", "farmer"),
  body("listingId").notEmpty(),
  body("pricePerUnit").isNumeric(),
  body("quantity").isNumeric(),
  validate,
  createOffer,
);
router.patch(
  "/:id/decision",
  verifyToken,
  restrictTo("buyer", "farmer"),
  body("status").isIn(["accepted", "rejected"]),
  validate,
  decideOffer,
);

export default router;
