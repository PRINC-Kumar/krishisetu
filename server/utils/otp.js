import crypto from "crypto";

export const generateOtp = () => String(crypto.randomInt(100000, 1000000));

export const hashValue = (value) =>
  crypto.createHash("sha256").update(value).digest("hex");

export const generateResetToken = () => crypto.randomBytes(32).toString("hex");
