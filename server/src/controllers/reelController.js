import Reel from "../models/Reel.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listReels = asyncHandler(async (_req, res) => {
  const reels = await Reel.find({ isActive: true }).populate("product").sort("-createdAt");
  res.json({ success: true, reels });
});

export const createReel = asyncHandler(async (req, res) => {
  const reel = await Reel.create(req.body);
  res.status(201).json({ success: true, reel });
});

export const interactReel = asyncHandler(async (req, res) => {
  const field = req.body.action === "save" ? "saves" : "likes";
  const reel = await Reel.findById(req.params.id);
  const exists = reel[field].some((id) => id.equals(req.user._id));
  reel[field] = exists ? reel[field].filter((id) => !id.equals(req.user._id)) : [...reel[field], req.user._id];
  await reel.save();
  res.json({ success: true, reel, active: !exists });
});

export const shareReel = asyncHandler(async (req, res) => {
  const reel = await Reel.findByIdAndUpdate(req.params.id, { $inc: { shares: 1 } }, { new: true });
  res.json({ success: true, reel });
});
