import jwt from "jsonwebtoken";
import { ApiError } from "../utils/apiError.js";
import User from "../models/User.js";

export const protect = async (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return next(new ApiError(401, "Authentication required"));
  }
  try {
    const decoded = jwt.verify(header.split(" ")[1], process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password -otp");
    if (!req.user) return next(new ApiError(401, "User not found"));
    next();
  } catch (_error) {
    next(new ApiError(401, "Invalid or expired token"));
  }
};

export const authorize = (...roles) => (req, _res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new ApiError(403, "You do not have permission for this action"));
  }
  next();
};
