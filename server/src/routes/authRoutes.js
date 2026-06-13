import express from "express";
import { body } from "express-validator";
import {
  authValidation,
  forgotPassword,
  login,
  me,
  resetPassword,
  signup,
  updatePassword,
  verifyOtp
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/errorMiddleware.js";

const router = express.Router();

router.post("/signup", authValidation.signup, validate, signup);
router.post("/login", authValidation.login, validate, login);
router.get("/me", protect, me);
router.post("/forgot-password", body("email").isEmail(), validate, forgotPassword);
router.post("/verify-otp", body("email").isEmail(), body("otp").isLength({ min: 6, max: 6 }), validate, verifyOtp);
router.post("/reset-password", body("password").isLength({ min: 6 }), validate, resetPassword);
router.put("/password", protect, updatePassword);

export default router;
