import { Listing } from "../models/Listing.model.js";
import { Order } from "../models/Order.model.js";
import { canMoveOrder } from "../services/order.service.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";

// Creates a buyer order request against an active listing with inventory validation.
export const createOrder = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.body.listingId);
    if (!listing || listing.status !== "active") {
      return sendError(res, "Listing is not available", 404);
    }

    // Guard: Prevent farmer from buying their own listing
    if (String(listing.farmer) === req.user.id) {
      return sendError(res, "You cannot purchase your own listing", 400);
    }

    // Inventory validation: Ensure stock is sufficient
    const requestedQty = Number(req.body.quantity);
    if (requestedQty <= 0) {
      return sendError(res, "Quantity must be greater than zero", 400);
    }
    if (requestedQty > listing.quantity) {
      return sendError(
        res,
        `Requested quantity exceeds available stock (${listing.quantity} ${listing.unit} available)`,
        400,
      );
    }

    const order = await Order.create({
      listing: listing._id,
      buyer: req.user.id,
      farmer: listing.farmer,
      quantity: requestedQty,
      offeredPrice: Number(req.body.offeredPrice) || listing.pricePerUnit,
      paymentMethod: req.body.paymentMethod,
    });

    sendSuccess(res, "Order request placed successfully", order, 201);
  } catch (error) {
    next(error);
  }
};

// Lists orders scoped to the logged-in role.
export const getMyOrders = async (req, res, next) => {
  try {
    const field = req.user.role === "buyer" ? "buyer" : "farmer";
    const orders = await Order.find({ [field]: req.user.id })
      .populate("listing", "cropName photoUrl unit pricePerUnit location")
      .populate("buyer farmer", "name phone email")
      .sort({ createdAt: -1 });
    sendSuccess(res, "Orders fetched", orders);
  } catch (error) {
    next(error);
  }
};

// Moves an order through the approved status flow with strict RBAC & stock adjustment.
export const updateOrderStatus = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return sendError(res, "Order not found", 404);

    const isFarmer = String(order.farmer) === req.user.id;
    const isBuyer = String(order.buyer) === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isFarmer && !isBuyer && !isAdmin) {
      return sendError(res, "You are not authorized to update this order", 403);
    }

    const nextStatus = req.body.status;
    const previousStatus = order.status;

    if (!canMoveOrder(previousStatus, nextStatus, req.user.role)) {
      return sendError(
        res,
        `Invalid status transition from ${previousStatus} to ${nextStatus} for role ${req.user.role}`,
        400,
      );
    }

    // Role-specific actor constraints
    if (["Accepted", "Shipped"].includes(nextStatus) && !isFarmer && !isAdmin) {
      return sendError(
        res,
        "Only the seller/farmer can accept or ship an order",
        403,
      );
    }

    // Inventory deduction upon acceptance
    if (previousStatus === "Pending" && nextStatus === "Accepted") {
      const listing = await Listing.findById(order.listing);
      if (listing) {
        if (listing.quantity < order.quantity) {
          return sendError(
            res,
            `Cannot accept order: Available quantity (${listing.quantity}) is less than order quantity (${order.quantity})`,
            400,
          );
        }
        listing.quantity -= order.quantity;
        if (listing.quantity <= 0) {
          listing.quantity = 0;
          listing.status = "sold";
        }
        await listing.save();
      }
    }

    // Inventory restoration if an accepted order is cancelled
    if (previousStatus === "Accepted" && nextStatus === "Cancelled") {
      const listing = await Listing.findById(order.listing);
      if (listing) {
        listing.quantity += order.quantity;
        if (listing.status === "sold") {
          listing.status = "active";
        }
        await listing.save();
      }
    }

    order.status = nextStatus;
    await order.save();
    sendSuccess(res, `Order status updated to ${nextStatus}`, order);
  } catch (error) {
    next(error);
  }
};

// Allows buyer or farmer to flag a dispute on an order.
export const disputeOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return sendError(res, "Order not found", 404);

    const isFarmer = String(order.farmer) === req.user.id;
    const isBuyer = String(order.buyer) === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isFarmer && !isBuyer && !isAdmin) {
      return sendError(res, "Not authorized to dispute this order", 403);
    }

    order.dispute = {
      status: "flagged",
      adminNote: req.body.reason ? `Flagged by ${req.user.role}: ${req.body.reason}` : `Flagged by ${req.user.role}`,
    };

    await order.save();
    sendSuccess(res, "Dispute reported to administrators", order);
  } catch (error) {
    next(error);
  }
};
