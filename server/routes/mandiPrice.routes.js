import express from "express";
import { getMandiPrices } from "../controllers/mandiPrice.controller.js";
import { restrictTo, verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get(
  "/",
  verifyToken,
  restrictTo("farmer", "buyer", "admin"),
  getMandiPrices,
);

export default router;
