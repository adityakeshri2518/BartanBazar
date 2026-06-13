import slugify from "slugify";
import Category from "../models/Category.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listCategories = asyncHandler(async (_req, res) => {
  const categories = await Category.find().sort("name");
  res.json({ success: true, categories });
});

export const createCategory = asyncHandler(async (req, res) => {
  const category = await Category.create({
    ...req.body,
    slug: req.body.slug || slugify(req.body.name, { lower: true, strict: true })
  });
  res.status(201).json({ success: true, category });
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!category) throw new ApiError(404, "Category not found");
  res.json({ success: true, category });
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) throw new ApiError(404, "Category not found");
  res.json({ success: true });
});
