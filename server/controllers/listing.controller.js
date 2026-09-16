import { Listing } from "../models/Listing.model.js";
import { User } from "../models/User.model.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";

const escapeRegex = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Creates a listing only for approved farmers so buyers see trusted supply.
export const createListing = async (req, res, next) => {
  try {
    const farmer = await User.findById(req.user.id);
    if (!farmer.isVerified) {
      return sendError(
        res,
        "Admin approval is required before creating listings. Please contact admin.",
        403,
      );
    }
    const location = req.body.location || {
      state: req.body["location[state]"] || farmer.location?.state,
      district: req.body["location[district]"] || farmer.location?.district,
    };

    const listing = await Listing.create({
      cropName: req.body.cropName,
      quantity: Number(req.body.quantity),
      unit: req.body.unit,
      pricePerUnit: Number(req.body.pricePerUnit),
      location,
      farmer: req.user.id,
      photoUrl: req.file ? `/uploads/${req.file.filename}` : undefined,
    });
    sendSuccess(res, "Listing created", listing, 201);
  } catch (error) {
    next(error);
  }
};

// Lists active crops with search, filters, and pagination for marketplace browsing.
export const getListings = async (req, res, next) => {
  try {
    const {
      search,
      cropName,
      state,
      district,
      minPrice,
      maxPrice,
      page = 1,
      limit = 12,
    } = req.query;

    const filter = { status: "active" };

    const term = (search || cropName)?.trim();
    if (term) {
      filter.cropName = { $regex: escapeRegex(term), $options: "i" };
    }
    if (state?.trim()) filter["location.state"] = state.trim();
    if (district?.trim()) filter["location.district"] = district.trim();

    if (minPrice !== undefined && minPrice !== "" || maxPrice !== undefined && maxPrice !== "") {
      filter.pricePerUnit = {};
      if (minPrice !== undefined && minPrice !== "") {
        filter.pricePerUnit.$gte = Number(minPrice);
      }
      if (maxPrice !== undefined && maxPrice !== "") {
        filter.pricePerUnit.$lte = Number(maxPrice);
      }
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Number(limit));
    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      Listing.find(filter)
        .populate("farmer", "name isVerified phone location")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Listing.countDocuments(filter),
    ]);

    sendSuccess(res, "Listings fetched", {
      items,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    next(error);
  }
};

// Returns a single listing with farmer trust details.
export const getListingById = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id).populate(
      "farmer",
      "name phone isVerified location email",
    );
    if (!listing) return sendError(res, "Listing not found", 404);
    sendSuccess(res, "Listing fetched", listing);
  } catch (error) {
    next(error);
  }
};

// Shows farmers their own listings.
export const getMyListings = async (req, res, next) => {
  try {
    const listings = await Listing.find({ farmer: req.user.id }).sort({
      createdAt: -1,
    });
    sendSuccess(res, "My listings fetched", listings);
  } catch (error) {
    next(error);
  }
};

// Updates only the current farmer's listing.
export const updateListing = async (req, res, next) => {
  try {
    const update = { ...req.body };
    if (req.body["location[state]"] || req.body["location[district]"]) {
      update.location = {
        state: req.body["location[state]"],
        district: req.body["location[district]"],
      };
      delete update["location[state]"];
      delete update["location[district]"];
    }
    if (req.file) update.photoUrl = `/uploads/${req.file.filename}`;

    const listing = await Listing.findOneAndUpdate(
      { _id: req.params.id, farmer: req.user.id },
      update,
      { new: true },
    );
    if (!listing) return sendError(res, "Listing not found or not yours", 404);
    sendSuccess(res, "Listing updated", listing);
  } catch (error) {
    next(error);
  }
};

// Soft deletes a listing by setting status to inactive.
export const deleteListing = async (req, res, next) => {
  try {
    const listing = await Listing.findOneAndUpdate(
      { _id: req.params.id, farmer: req.user.id },
      { status: "inactive" },
      { new: true },
    );
    if (!listing) return sendError(res, "Listing not found or not yours", 404);
    sendSuccess(res, "Listing removed", listing);
  } catch (error) {
    next(error);
  }
};
