import Address from "../models/Address.js";
import User from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      name: req.body.name,
      phone: req.body.phone,
      avatar: req.body.avatar,
      dateOfBirth: req.body.dateOfBirth,
      gender: req.body.gender
    },
    { new: true, runValidators: true }
  ).select("-password");
  res.json({ success: true, user });
});

export const rewardSummary = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("rewardPoints rewardHistory");
  res.json({
    success: true,
    rewards: {
      points: user.rewardPoints,
      rupeeValue: user.rewardPoints,
      history: user.rewardHistory.sort((a, b) => b.at - a.at)
    }
  });
});

export const listAddresses = asyncHandler(async (req, res) => {
  const addresses = await Address.find({ user: req.user._id }).sort("-isDefault -createdAt");
  res.json({ success: true, addresses });
});

export const saveAddress = asyncHandler(async (req, res) => {
  if (req.body.isDefault) await Address.updateMany({ user: req.user._id }, { isDefault: false });
  const address = await Address.create({ ...req.body, user: req.user._id });
  res.status(201).json({ success: true, address });
});

export const deleteAddress = asyncHandler(async (req, res) => {
  await Address.deleteOne({ _id: req.params.id, user: req.user._id });
  res.json({ success: true });
});
