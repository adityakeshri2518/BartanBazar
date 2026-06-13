import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import Coupon from "../models/Coupon.js";
import Offer from "../models/Offer.js";
import Reel from "../models/Reel.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const periodStart = (period = "month") => {
  const now = new Date();
  const start = new Date(now);
  if (period === "day") start.setHours(0, 0, 0, 0);
  else if (period === "week") start.setDate(now.getDate() - 7);
  else if (period === "year") start.setFullYear(now.getFullYear(), 0, 1), start.setHours(0, 0, 0, 0);
  else start.setDate(1), start.setHours(0, 0, 0, 0);
  return start;
};

export const dashboard = asyncHandler(async (req, res) => {
  const period = req.query.period || "month";
  const start = periodStart(period);
  const [orders, revenue, customers, products, recentOrders, periodRevenue, lowStock, outOfStock, topProducts] = await Promise.all([
    Order.countDocuments(),
    Order.aggregate([{ $match: { "payment.status": "paid" } }, { $group: { _id: null, total: { $sum: "$total" } } }]),
    User.countDocuments({ role: "customer" }),
    Product.countDocuments({ status: "active" }),
    Order.find().populate("user", "name email").sort("-createdAt").limit(8),
    Order.aggregate([
      { $match: { "payment.status": "paid", createdAt: { $gte: start } } },
      { $group: { _id: null, total: { $sum: "$total" }, orders: { $sum: 1 } } }
    ]),
    Product.countDocuments({ status: "active", stock: { $gt: 0, $lte: 10 } }),
    Product.countDocuments({ status: "active", stock: { $lte: 0 } }),
    Order.aggregate([
      { $match: { "payment.status": "paid" } },
      { $unwind: "$items" },
      { $group: { _id: "$items.product", name: { $first: "$items.name" }, quantity: { $sum: "$items.quantity" }, revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } } } },
      { $sort: { quantity: -1 } },
      { $limit: 5 }
    ])
  ]);
  res.json({
    success: true,
    stats: {
      orders,
      revenue: revenue[0]?.total || 0,
      customers,
      products,
      period,
      periodRevenue: periodRevenue[0]?.total || 0,
      periodOrders: periodRevenue[0]?.orders || 0,
      lowStock,
      outOfStock
    },
    recentOrders,
    topProducts
  });
});

export const listAdminProducts = asyncHandler(async (req, res) => {
  const products = await Product.find(req.query.all === "true" ? {} : { status: { $ne: "archived" } })
    .populate("category", "name")
    .sort("-createdAt");
  res.json({ success: true, products });
});

export const listCustomers = asyncHandler(async (_req, res) => {
  const customers = await User.find({ role: "customer" }).select("-password").sort("-createdAt");
  res.json({ success: true, customers });
});

export const listOrders = asyncHandler(async (_req, res) => {
  const orders = await Order.find().populate("user", "name email").sort("-createdAt");
  res.json({ success: true, orders });
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const etaDays = Number(req.body.etaDays || 0);
  const deliveryUpdate = {};
  if (etaDays > 0) {
    deliveryUpdate["delivery.etaDays"] = etaDays;
    deliveryUpdate["delivery.estimatedDeliveryDate"] = new Date(Date.now() + etaDays * 24 * 60 * 60 * 1000);
  }
  if (req.body.courier) deliveryUpdate["delivery.courier"] = req.body.courier;
  if (req.body.trackingId) deliveryUpdate["delivery.trackingId"] = req.body.trackingId;
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    {
      $set: { orderStatus: req.body.status, ...deliveryUpdate },
      $push: { tracking: { label: req.body.status, location: req.body.location || "Admin update" } }
    },
    { new: true }
  );
  if (!order) throw new ApiError(404, "Order not found");
  res.json({ success: true, order });
});

export const createCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.create(req.body);
  res.status(201).json({ success: true, coupon });
});

export const listCoupons = asyncHandler(async (_req, res) => {
  const coupons = await Coupon.find().sort("-createdAt");
  res.json({ success: true, coupons });
});

export const createOffer = asyncHandler(async (req, res) => {
  const offer = await Offer.create(req.body);
  res.status(201).json({ success: true, offer });
});

export const listOffers = asyncHandler(async (_req, res) => {
  const offers = await Offer.find().sort("-createdAt");
  res.json({ success: true, offers });
});

export const salesReport = asyncHandler(async (_req, res) => {
  const report = await Order.aggregate([
    { $match: { "payment.status": "paid" } },
    { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, revenue: { $sum: "$total" }, orders: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);
  res.json({ success: true, report });
});

export const revenueReport = asyncHandler(async (req, res) => {
  const period = req.query.period || "month";
  const start = periodStart(period);
  const format = period === "year" ? "%Y-%m" : "%Y-%m-%d";
  const report = await Order.aggregate([
    { $match: { "payment.status": "paid", createdAt: { $gte: start } } },
    { $group: { _id: { $dateToString: { format, date: "$createdAt" } }, revenue: { $sum: "$total" }, orders: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);
  res.json({ success: true, period, report });
});

export const inventoryReport = asyncHandler(async (_req, res) => {
  const [lowStock, outOfStock, remaining] = await Promise.all([
    Product.find({ status: "active", stock: { $gt: 0, $lte: 10 } }).select("name brand categoryName stock price images").sort("stock"),
    Product.find({ status: "active", stock: { $lte: 0 } }).select("name brand categoryName stock price images").sort("stock"),
    Product.find({ status: "active", stock: { $gt: 10 } }).select("name brand categoryName stock price images").sort("stock").limit(20)
  ]);
  res.json({ success: true, lowStock, outOfStock, remaining });
});

export const topPurchasedProducts = asyncHandler(async (req, res) => {
  const start = periodStart(req.query.period || "year");
  const products = await Order.aggregate([
    { $match: { "payment.status": "paid", createdAt: { $gte: start } } },
    { $unwind: "$items" },
    { $group: { _id: "$items.product", name: { $first: "$items.name" }, image: { $first: "$items.image" }, quantity: { $sum: "$items.quantity" }, revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } } } },
    { $sort: { quantity: -1 } },
    { $limit: 10 }
  ]);
  res.json({ success: true, products });
});

export const listAdminReels = asyncHandler(async (_req, res) => {
  const reels = await Reel.find().populate("product").sort("-createdAt");
  res.json({ success: true, reels });
});
