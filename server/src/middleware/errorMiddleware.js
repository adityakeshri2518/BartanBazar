import { validationResult } from "express-validator";
import { ApiError } from "../utils/apiError.js";

export const validate = (req, _res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ApiError(422, "Validation failed", errors.array()));
  }
  next();
};

export const notFound = (req, _res, next) => {
  next(new ApiError(404, `Route not found: ${req.originalUrl}`));
};

export const errorHandler = (err, _req, res, _next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Server error",
    details: err.details || null,
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack
  });
};
