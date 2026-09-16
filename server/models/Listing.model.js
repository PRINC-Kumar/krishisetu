import mongoose from "mongoose";

const listingSchema = new mongoose.Schema(
  {
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    cropName: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 0 },
    unit: { type: String, enum: ["kg", "quintal", "ton"], required: true },
    pricePerUnit: { type: Number, required: true, min: 0 },
    location: {
      state: { type: String, required: true },
      district: { type: String, required: true },
    },
    photoUrl: String,
    status: {
      type: String,
      enum: ["active", "inactive", "sold"],
      default: "active",
    },
  },
  { timestamps: true },
);

export const Listing = mongoose.model("Listing", listingSchema);
