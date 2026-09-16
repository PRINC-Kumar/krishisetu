import { MandiPrice } from "../models/MandiPrice.model.js";
import { sendSuccess } from "../utils/apiResponse.js";

// Returns manual market reference data for dashboard charts.
export const getMandiPrices = async (req, res, next) => {
  try {
    const filter = req.query.cropName
      ? { cropName: { $regex: req.query.cropName, $options: "i" } }
      : {};
    const prices = await MandiPrice.find(filter).sort({ date: 1 });
    sendSuccess(res, "Mandi prices fetched", prices);
  } catch (error) {
    next(error);
  }
};
