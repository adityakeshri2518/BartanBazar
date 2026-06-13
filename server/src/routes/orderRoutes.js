import express from "express";
import { cancelOrder, createOrder, invoice, myOrders, orderDetails, verifyPayment, verifyScannerPayment } from "../controllers/orderController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.post("/", createOrder);
router.post("/verify-payment", verifyPayment);
router.post("/verify-scanner-payment", verifyScannerPayment);
router.get("/", myOrders);
router.get("/:id", orderDetails);
router.patch("/:id/cancel", cancelOrder);
router.get("/:id/invoice", invoice);

export default router;
