import mongoose from "mongoose";

const offerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subtitle: String,
    banner: String,
    couponCode: String,
    startsAt: Date,
    endsAt: Date,
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model("Offer", offerSchema);
