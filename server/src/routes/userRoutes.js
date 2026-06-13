import express from "express";
import { deleteAddress, listAddresses, rewardSummary, saveAddress, updateProfile } from "../controllers/userController.js";
import { notifications } from "../controllers/miscController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.put("/profile", updateProfile);
router.get("/rewards", rewardSummary);
router.get("/addresses", listAddresses);
router.post("/addresses", saveAddress);
router.delete("/addresses/:id", deleteAddress);
router.get("/notifications", notifications);

export default router;
