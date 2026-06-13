import express from "express";
import { toggleWishlist, viewWishlist } from "../controllers/wishlistController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.get("/", viewWishlist);
router.post("/toggle", toggleWishlist);

export default router;
