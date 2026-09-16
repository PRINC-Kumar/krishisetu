import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    quantity: { type: Number, required: true, min: 1 },
    offeredPrice: { type: Number, min: 0 },
    paymentMethod: {
      type: String,
      enum: ["COD", "Pay Offline"],
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Accepted", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },
    dispute: {
      status: {
        type: String,
        enum: ["none", "flagged", "resolved"],
        default: "none",
      },
      adminNote: { type: String, default: "" },
    },
  },
  { timestamps: true },
);

export const Order = mongoose.model("Order", orderSchema);
