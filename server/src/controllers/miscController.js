import Notification from "../models/Notification.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const subscribeNewsletter = asyncHandler(async (req, res) => {
  res.status(201).json({ success: true, message: `${req.body.email} subscribed to BartanBazaar offers` });
});

export const contact = asyncHandler(async (req, res) => {
  res.status(201).json({ success: true, message: "Thanks for contacting BartanBazaar. We will reply soon." });
});

export const notifications = asyncHandler(async (req, res) => {
  const items = await Notification.find({ user: req.user._id }).sort("-createdAt").limit(20);
  res.json({ success: true, notifications: items });
});
