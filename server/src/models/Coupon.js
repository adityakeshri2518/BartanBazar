import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    description: String,
    discountType: { type: String, enum: ["percent", "flat"], default: "percent" },
    value: { type: Number, required: true },
    minCartValue: { type: Number, default: 0 },
    expiresAt: Date,
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model("Coupon", couponSchema);
