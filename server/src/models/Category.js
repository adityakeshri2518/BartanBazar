import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    image: String,
    description: String,
    isFeatured: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.model("Category", categorySchema);
