import { Listing } from "../models/Listing.model.js";
import { Offer } from "../models/Offer.model.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";

// Fetches saved negotiation history for listing / user pairs.
export const getOfferThread = async (req, res, next) => {
  try {
    const { listingId, buyerId } = req.query;
    const query = {};

    if (listingId) {
      query.listing = listingId;
    }

    if (req.user.role === "buyer") {
      query.buyer = req.user.id;
    } else if (req.user.role === "farmer") {
      query.farmer = req.user.id;
      if (buyerId) query.buyer = buyerId;
    }

    const offers = await Offer.find(query)
      .populate("sender", "name role")
      .populate("buyer farmer", "name phone email")
      .populate("listing", "cropName unit pricePerUnit")
      .sort({ createdAt: 1 });

    sendSuccess(res, "Offer thread fetched", offers);
  } catch (error) {
    next(error);
  }
};

// Creates an offer with role and recipient checks.
export const createOffer = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.body.listingId);
    if (!listing) return sendError(res, "Listing not found", 404);

    const isBuyer = req.user.role === "buyer";
    const buyer = isBuyer ? req.user.id : req.body.buyerId;
    const farmer = listing.farmer;

    if (!buyer) {
      return sendError(res, "Buyer ID is required when counter-offering as farmer", 400);
    }

    const offer = await Offer.create({
      listing: listing._id,
      buyer,
      farmer,
      sender: req.user.id,
      pricePerUnit: Number(req.body.pricePerUnit),
      quantity: Number(req.body.quantity),
      message: req.body.message || "",
    });

    const populatedOffer = await Offer.findById(offer._id).populate(
      "sender",
      "name role",
    );

    sendSuccess(res, "Offer saved", populatedOffer, 201);
  } catch (error) {
    next(error);
  }
};

// Marks an offer as accepted or rejected with authorization checks.
export const decideOffer = async (req, res, next) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) return sendError(res, "Offer not found", 404);

    const isParty =
      String(offer.buyer) === req.user.id ||
      String(offer.farmer) === req.user.id;
    if (!isParty && req.user.role !== "admin") {
      return sendError(res, "Not authorized to decide this offer", 403);
    }

    // Guard: The sender of the offer cannot accept or reject their own offer
    if (String(offer.sender) === req.user.id) {
      return sendError(res, "You cannot decide on your own offer", 400);
    }

    offer.status = req.body.status;
    await offer.save();

    sendSuccess(res, `Offer ${req.body.status}`, offer);
  } catch (error) {
    next(error);
  }
};
