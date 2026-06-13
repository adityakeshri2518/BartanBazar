import mongoose from "mongoose";
import app from "../src/app.js";
import { connectDB } from "../src/config/db.js";

let cachedConnection = null;

const ensureDB = async () => {
  if (mongoose.connection.readyState === 1) return;
  if (!cachedConnection) cachedConnection = connectDB();
  await cachedConnection;
};

export default async function handler(req, res) {
  await ensureDB();
  return app(req, res);
}
