import { Readable } from "stream";
import cloudinary from "../config/cloudinary.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const uploadAsset = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, "File is required");
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    throw new ApiError(503, "Cloudinary is not configured");
  }
  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "bartanbazaar", resource_type: "auto" },
      (error, uploaded) => (error ? reject(error) : resolve(uploaded))
    );
    Readable.from(req.file.buffer).pipe(stream);
  });
  res.status(201).json({ success: true, asset: { url: result.secure_url, publicId: result.public_id } });
});
