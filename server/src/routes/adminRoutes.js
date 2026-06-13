import express from "express";
import { body } from "express-validator";
import {
  createCoupon,
  createOffer,
  dashboard,
  inventoryReport,
  listAdminProducts,
  listAdminReels,
  listCoupons,
  listCustomers,
  listOffers,
  listOrders,
  salesReport,
  revenueReport,
  topPurchasedProducts,
  updateOrderStatus
} from "../controllers/adminController.js";
import { createCategory, deleteCategory, updateCategory } from "../controllers/categoryController.js";
import { createProduct, deleteProduct, updateProduct } from "../controllers/productController.js";
import { createReel } from "../controllers/reelController.js";
import { uploadAsset } from "../controllers/uploadController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/errorMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.use(protect, authorize("admin"));
router.get("/dashboard", dashboard);
router.get("/products", listAdminProducts);
router.get("/customers", listCustomers);
router.get("/orders", listOrders);
router.patch("/orders/:id/status", updateOrderStatus);
router.post("/products", createProduct);
router.put("/products/:id", updateProduct);
router.delete("/products/:id", deleteProduct);
router.post("/categories", createCategory);
router.put("/categories/:id", updateCategory);
router.delete("/categories/:id", deleteCategory);
router.get("/coupons", listCoupons);
router.post("/coupons", body("code").notEmpty(), validate, createCoupon);
router.get("/offers", listOffers);
router.post("/offers", createOffer);
router.get("/reels", listAdminReels);
router.post("/reels", createReel);
router.get("/reports/sales", salesReport);
router.get("/reports/revenue", revenueReport);
router.get("/reports/inventory", inventoryReport);
router.get("/reports/top-products", topPurchasedProducts);
router.post("/upload", upload.single("asset"), uploadAsset);

export default router;
