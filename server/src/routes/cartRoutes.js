import express from "express";
import { addToCart, applyCoupon, removeCartItem, updateCartItem, viewCart } from "../controllers/cartController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.get("/", viewCart);
router.post("/", addToCart);
router.patch("/:productId", updateCartItem);
router.delete("/:productId", removeCartItem);
router.post("/coupon", applyCoupon);

export default router;
