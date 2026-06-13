import slugify from "slugify";
import Category from "../models/Category.js";
import Product from "../models/Product.js";
import Review from "../models/Review.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const buildQuery = (query) => {
  const filter = { status: "active" };
  if (query.category) filter.categoryName = query.category;
  if (query.brand) filter.brand = { $in: String(query.brand).split(",") };
  if (query.minPrice || query.maxPrice) {
    filter.price = {};
    if (query.minPrice) filter.price.$gte = Number(query.minPrice);
    if (query.maxPrice) filter.price.$lte = Number(query.maxPrice);
  }
  if (query.search) filter.$text = { $search: query.search };
  return filter;
};

const sortMap = {
  price_low: "price",
  price_high: "-price",
  popularity: "-sold",
  rating: "-rating",
  newest: "-createdAt"
};

export const listProducts = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 12, 48);
  const filter = buildQuery(req.query);
  const sort = sortMap[req.query.sort] || "-createdAt";
  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate("category", "name slug")
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit),
    Product.countDocuments(filter)
  ]);
  res.json({ success: true, products, total, page, pages: Math.ceil(total / limit) });
});

export const featuredProducts = asyncHandler(async (_req, res) => {
  const [trending, bestSelling, newArrivals, deals] = await Promise.all([
    Product.find({ isTrending: true, status: "active" }).limit(8),
    Product.find({ isBestSeller: true, status: "active" }).sort("-sold").limit(8),
    Product.find({ isNewArrival: true, status: "active" }).sort("-createdAt").limit(8),
    Product.find({ dealEndsAt: { $gte: new Date() }, status: "active" }).limit(8)
  ]);
  res.json({ success: true, trending, bestSelling, newArrivals, deals });
});

export const productDetails = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug, status: "active" }).populate("category");
  if (!product) throw new ApiError(404, "Product not found");
  const [reviews, similar] = await Promise.all([
    Review.find({ product: product._id }).populate("user", "name avatar").sort("-createdAt"),
    Product.find({
      _id: { $ne: product._id },
      category: product.category._id,
      status: "active"
    }).limit(6)
  ]);
  res.json({ success: true, product, reviews, similar });
});

export const createProduct = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.body.category);
  if (!category) throw new ApiError(404, "Category not found");
  const product = await Product.create({
    ...req.body,
    categoryName: category.name,
    slug: slugify(req.body.name, { lower: true, strict: true }) + "-" + Date.now()
  });
  res.status(201).json({ success: true, product });
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!product) throw new ApiError(404, "Product not found");
  res.json({ success: true, product });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, { status: "archived" }, { new: true });
  if (!product) throw new ApiError(404, "Product not found");
  res.json({ success: true, product });
});

export const searchSuggestions = asyncHandler(async (req, res) => {
  const q = req.query.q || "";
  const products = await Product.find({
    status: "active",
    name: { $regex: q, $options: "i" }
  })
    .select("name slug brand categoryName")
    .limit(8);
  res.json({ success: true, suggestions: products });
});

export const recommendations = asyncHandler(async (req, res) => {
  const products = await Product.find({ status: "active" }).sort("-rating -sold").limit(10);
  res.json({ success: true, products });
});
