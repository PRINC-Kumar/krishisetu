import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import { env } from "./config/env.js";
import { errorHandler, notFound } from "./middleware/error.middleware.js";
import authRoutes from "./routes/auth.routes.js";
import listingRoutes from "./routes/listing.routes.js";
import orderRoutes from "./routes/order.routes.js";
import offerRoutes from "./routes/offer.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import mandiPriceRoutes from "./routes/mandiPrice.routes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const app = express();

app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/api/health", (req, res) =>
  res.json({ success: true, message: "KrishiSetu API is healthy", data: null }),
);
app.use("/api/auth", authRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/offers", offerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/mandi-prices", mandiPriceRoutes);
app.use(notFound);
app.use(errorHandler);
