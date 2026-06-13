import express from "express";
import { body } from "express-validator";
import { contact, subscribeNewsletter } from "../controllers/miscController.js";
import { validate } from "../middleware/errorMiddleware.js";

const router = express.Router();

router.post("/newsletter", body("email").isEmail(), validate, subscribeNewsletter);
router.post("/contact", body("email").isEmail(), body("message").notEmpty(), validate, contact);

export default router;
