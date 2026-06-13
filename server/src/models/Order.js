import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        name: String,
        image: String,
        price: Number,
        quantity: Number
      }
    ],
    shippingAddress: {
      name: String,
      phone: String,
      line1: String,
      line2: String,
      city: String,
      state: String,
      pincode: String,
      country: { type: String, default: "India" }
    },
    subtotal: Number,
    discount: { type: Number, default: 0 },
    rewardPointsUsed: { type: Number, default: 0 },
    rewardDiscount: { type: Number, default: 0 },
    rewardPointsEarned: { type: Number, default: 0 },
    shippingFee: { type: Number, default: 0 },
    total: Number,
    payment: {
      provider: { type: String, default: "razorpay" },
      method: { type: String, enum: ["razorpay", "upi_scanner", "cod"], default: "razorpay" },
      upiReference: String,
      razorpayOrderId: String,
      razorpayPaymentId: String,
      razorpaySignature: String,
      status: { type: String, enum: ["pending", "paid", "failed", "refunded"], default: "pending" }
    },
    orderStatus: {
      type: String,
      enum: ["placed", "confirmed", "packed", "shipped", "out_for_delivery", "delivered", "cancelled"],
      default: "placed"
    },
    delivery: {
      courier: { type: String, default: "BartanBazaar Logistics" },
      trackingId: String,
      estimatedDeliveryDate: Date,
      etaDays: { type: Number, default: 5 }
    },
    tracking: [
      {
        label: String,
        location: String,
        at: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
