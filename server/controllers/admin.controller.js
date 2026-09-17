import bcrypt from "bcryptjs";
import { User } from "../models/User.model.js";
import { Listing } from "../models/Listing.model.js";
import { Order } from "../models/Order.model.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";

// Gives admins a quick health view for the platform.
export const getDashboard = async (req, res, next) => {
  try {
    const [users, listings, orders, pendingFarmers] = await Promise.all([
      User.countDocuments(),
      Listing.countDocuments(),
      Order.countDocuments(),
      User.countDocuments({ role: "farmer", isVerified: false }),
    ]);
    sendSuccess(res, "Admin stats fetched", {
      users,
      listings,
      orders,
      pendingFarmers,
    });
  } catch (error) {
    next(error);
  }
};

// Lists users so admins can verify farmers and audit buyer accounts.
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    sendSuccess(res, "Users fetched", users);
  } catch (error) {
    next(error);
  }
};

// Approves or unapproves a farmer account.
export const verifyFarmer = async (req, res, next) => {
  try {
    const user = await User.findOneAndUpdate(
      { _id: req.params.id, role: "farmer" },
      { isVerified: req.body.isVerified },
      { new: true },
    );
    if (!user) return sendError(res, "Farmer not found", 404);
    sendSuccess(res, "Farmer verification updated", user);
  } catch (error) {
    next(error);
  }
};

// Creates admin accounts without allowing public self-registration.
export const createAdmin = async (req, res, next) => {
  try {
    const trimmedEmail = req.body.email?.trim().toLowerCase();
    const trimmedPhone = req.body.phone?.trim();

    // Guard against duplicate email or phone
    const existing = await User.findOne({
      $or: [
        ...(trimmedEmail ? [{ email: trimmedEmail }] : []),
        ...(trimmedPhone ? [{ phone: trimmedPhone }] : []),
      ],
    });
    if (existing) {
      return sendError(
        res,
        "An account with this email or phone already exists",
        409,
      );
    }

    const user = await User.create({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      name: req.body.name?.trim(),
      email: trimmedEmail,
      phone: trimmedPhone,
      password: await bcrypt.hash(req.body.password, 10),
      role: "admin",
      location: req.body.location,
      location: req.body.location || { state: "Maharashtra", district: "Pune" },
      isVerified: true,
    });
    sendSuccess(res, "Admin created", user, 201);
  } catch (error) {
    next(error);
  }
};

// Shows all listings and orders for oversight screens.
export const getAllListings = async (req, res, next) => {
  try {
    const listings = await Listing.find()
      .populate("farmer", "name isVerified")
      .sort({ createdAt: -1 });
    sendSuccess(res, "All listings fetched", listings);
  } catch (error) {
    next(error);
  }
};

export const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate("listing buyer farmer")
      .sort({ createdAt: -1 });
    sendSuccess(res, "All orders fetched", orders);
  } catch (error) {
    next(error);
  }
};

// Flags or resolves disputes while saving the admin's note.
export const updateDispute = async (req, res, next) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        dispute: {
          status: req.body.status,
          adminNote: req.body.adminNote || "",
        },
      },
      { new: true },
    );
    if (!order) return sendError(res, "Order not found", 404);
    sendSuccess(res, "Dispute updated", order);
  } catch (error) {
    next(error);
  }
};
