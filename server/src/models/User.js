import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
    avatar: { type: String, default: "" },
    dateOfBirth: Date,
    gender: { type: String, enum: ["", "female", "male", "non_binary", "prefer_not_to_say"], default: "" },
    rewardPoints: { type: Number, default: 250 },
    rewardHistory: [
      {
        type: { type: String, enum: ["earned", "redeemed"], required: true },
        points: { type: Number, required: true },
        note: String,
        order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
        at: { type: Date, default: Date.now }
      }
    ],
    otp: {
      code: String,
      expiresAt: Date,
      verified: { type: Boolean, default: false }
    },
    preferences: {
      darkMode: { type: Boolean, default: false },
      categories: [String]
    }
  },
  { timestamps: true }
);

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model("User", userSchema);
