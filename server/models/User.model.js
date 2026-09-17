import mongoose from "mongoose";

const locationSchema = new mongoose.Schema(
  {
    state: { type: String, required: true },
    district: { type: String, required: true },
  },
  { _id: false },
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      sparse: true,
      unique: true,
    },
    phone: { type: String, required: true, unique: true, trim: true },
    password: { type: String, select: false },
    role: { type: String, enum: ["farmer", "buyer", "admin"], required: true },
    businessName: String,
    farmSize: String,
    location: locationSchema,
    isVerified: { type: Boolean, default: false },
    otpHash: { type: String, select: false },
    otpExpiresAt: Date,
    otpAttempts: { type: Number, default: 0 },
    otpResendAt: Date,
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpiresAt: Date,
    refreshTokenHash: { type: String, select: false },
  },
  { timestamps: true },
);

export const User = mongoose.model("User", userSchema);
