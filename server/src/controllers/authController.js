import crypto from "crypto";
import { body } from "express-validator";
import User from "../models/User.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendToken } from "../utils/tokens.js";

export const authValidation = {
  signup: [
    body("name").trim().notEmpty(),
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 6 }),
    body("phone").optional().trim()
  ],
  login: [body("email").isEmail().normalizeEmail(), body("password").notEmpty()]
};

export const signup = asyncHandler(async (req, res) => {
  const exists = await User.findOne({ email: req.body.email });
  if (exists) throw new ApiError(409, "Email is already registered");
  const user = await User.create(req.body);
  sendToken(res, user, 201);
});

export const login = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email }).select("+password");
  if (!user || !(await user.comparePassword(req.body.password))) {
    throw new ApiError(401, "Invalid email or password");
  }
  sendToken(res, user);
});

export const me = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) throw new ApiError(404, "No account found for this email");
  const code = String(crypto.randomInt(100000, 999999));
  user.otp = { code, expiresAt: new Date(Date.now() + 10 * 60 * 1000), verified: false };
  await user.save();
  res.json({
    success: true,
    message: "OTP generated. Connect email/SMS provider in production.",
    devOtp: process.env.NODE_ENV === "production" ? undefined : code
  });
});

export const verifyOtp = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user || user.otp?.code !== req.body.otp || user.otp.expiresAt < new Date()) {
    throw new ApiError(400, "Invalid or expired OTP");
  }
  user.otp.verified = true;
  await user.save();
  res.json({ success: true, message: "OTP verified" });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email }).select("+password");
  if (!user?.otp?.verified) throw new ApiError(400, "Please verify OTP first");
  user.password = req.body.password;
  user.otp = undefined;
  await user.save();
  sendToken(res, user);
});

export const updatePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("+password");
  if (!(await user.comparePassword(req.body.currentPassword))) {
    throw new ApiError(401, "Current password is incorrect");
  }
  user.password = req.body.newPassword;
  await user.save();
  sendToken(res, user);
});
