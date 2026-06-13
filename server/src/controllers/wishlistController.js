import Wishlist from "../models/Wishlist.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getWishlist = (userId) =>
  Wishlist.findOneAndUpdate({ user: userId }, { $setOnInsert: { products: [] } }, { upsert: true, new: true }).populate(
    "products"
  );

export const viewWishlist = asyncHandler(async (req, res) => {
  res.json({ success: true, wishlist: await getWishlist(req.user._id) });
});

export const toggleWishlist = asyncHandler(async (req, res) => {
  const wishlist = await getWishlist(req.user._id);
  const exists = wishlist.products.some((product) => product._id.equals(req.body.productId));
  wishlist.products = exists
    ? wishlist.products.filter((product) => !product._id.equals(req.body.productId))
    : [...wishlist.products.map((product) => product._id), req.body.productId];
  await wishlist.save();
  await wishlist.populate("products");
  res.json({ success: true, wishlist, saved: !exists });
});
