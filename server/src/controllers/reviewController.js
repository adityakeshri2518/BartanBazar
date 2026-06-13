import Product from "../models/Product.js";
import Review from "../models/Review.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createReview = asyncHandler(async (req, res) => {
  const review = await Review.findOneAndUpdate(
    { user: req.user._id, product: req.params.productId },
    { ...req.body, user: req.user._id, product: req.params.productId },
    { upsert: true, new: true, runValidators: true }
  );
  const stats = await Review.aggregate([
    { $match: { product: review.product } },
    { $group: { _id: "$product", rating: { $avg: "$rating" }, count: { $sum: 1 } } }
  ]);
  await Product.findByIdAndUpdate(review.product, {
    rating: Number((stats[0]?.rating || 0).toFixed(1)),
    reviewsCount: stats[0]?.count || 0
  });
  res.status(201).json({ success: true, review });
});
