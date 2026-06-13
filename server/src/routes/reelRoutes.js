import express from "express";
import { interactReel, listReels, shareReel } from "../controllers/reelController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", listReels);
router.post("/:id/interact", protect, interactReel);
router.post("/:id/share", shareReel);

export default router;
