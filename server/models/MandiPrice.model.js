import mongoose from "mongoose";

const mandiPriceSchema = new mongoose.Schema(
  {
    cropName: { type: String, required: true },
    market: { type: String, required: true },
    date: { type: Date, required: true },
    minPrice: { type: Number, required: true },
    modalPrice: { type: Number, required: true },
    maxPrice: { type: Number, required: true },
  },
  { timestamps: true },
);

export const MandiPrice = mongoose.model("MandiPrice", mandiPriceSchema);
