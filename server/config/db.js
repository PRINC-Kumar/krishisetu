import mongoose from "mongoose";
import dns from "node:dns";
import { env } from "./env.js";
import { logger } from "../utils/logger.js";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

export const connectDB = async () => {
  await mongoose.connect(env.mongoUri);
  logger.info("MongoDB connected");
};
