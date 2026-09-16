import { validationResult } from "express-validator";
import { sendError } from "../utils/apiResponse.js";

// Converts validation library errors into the API's standard response shape.
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return sendError(
      res,
      "Please fix the highlighted fields",
      422,
      errors.array(),
    );
  next();
};
