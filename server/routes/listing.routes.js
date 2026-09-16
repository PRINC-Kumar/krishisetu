import express from "express";
import { body } from "express-validator";
import {
  createListing,
  deleteListing,
  getListingById,
  getListings,
  getMyListings,
  updateListing,
} from "../controllers/listing.controller.js";
import { restrictTo, verifyToken } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";
import { validate } from "../middleware/validate.middleware.js";

const router = express.Router();

router.get("/", getListings);
router.get("/mine", verifyToken, restrictTo("farmer"), getMyListings);
router.get("/:id", getListingById);
router.post(
  "/",
  verifyToken,
  restrictTo("farmer"),
  upload.single("photo"),
  body("cropName").notEmpty(),
  body("quantity").isNumeric(),
  body("unit").isIn(["kg", "quintal", "ton"]),
  body("pricePerUnit").isNumeric(),
  validate,
  createListing,
);
router.put(
  "/:id",
  verifyToken,
  restrictTo("farmer"),
  upload.single("photo"),
  updateListing,
);
router.delete("/:id", verifyToken, restrictTo("farmer"), deleteListing);

export default router;
