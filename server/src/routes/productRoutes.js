import express from "express";
import {
  featuredProducts,
  listProducts,
  productDetails,
  recommendations,
  searchSuggestions
} from "../controllers/productController.js";
import { createReview } from "../controllers/reviewController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", listProducts);
router.get("/featured", featuredProducts);
router.get("/suggestions", searchSuggestions);
router.get("/recommendations", recommendations);
router.get("/:slug", productDetails);
router.post("/:productId/reviews", protect, createReview);

export default router;
