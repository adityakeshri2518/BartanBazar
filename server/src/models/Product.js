import mongoose from "mongoose";

const imageSchema = new mongoose.Schema(
  {
    url: String,
    publicId: String,
    alt: String
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, index: "text" },
    slug: { type: String, required: true, unique: true },
    brand: { type: String, required: true, index: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    categoryName: String,
    description: { type: String, required: true },
    price: { type: Number, required: true },
    mrp: { type: Number, required: true },
    stock: { type: Number, default: 0 },
    images: [imageSchema],
    specifications: { type: Map, of: String },
    tags: [String],
    rating: { type: Number, default: 0 },
    reviewsCount: { type: Number, default: 0 },
    sold: { type: Number, default: 0 },
    isTrending: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    dealEndsAt: Date,
    status: { type: String, enum: ["active", "draft", "archived"], default: "active" }
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
