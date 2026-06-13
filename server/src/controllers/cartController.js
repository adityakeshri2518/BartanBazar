import Cart from "../models/Cart.js";
import Coupon from "../models/Coupon.js";
import Product from "../models/Product.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getCart = async (userId) =>
  Cart.findOneAndUpdate({ user: userId }, { $setOnInsert: { items: [] } }, { upsert: true, new: true }).populate(
    "items.product"
  );

const summarize = async (cart) => {
  const subtotal = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  let discount = 0;
  if (cart.coupon) {
    const coupon = await Coupon.findOne({ code: cart.coupon, isActive: true });
    if (coupon && subtotal >= coupon.minCartValue && (!coupon.expiresAt || coupon.expiresAt > new Date())) {
      discount = coupon.discountType === "percent" ? Math.round((subtotal * coupon.value) / 100) : coupon.value;
    }
  }
  const shippingFee = subtotal - discount > 999 ? 0 : 79;
  return { subtotal, discount, shippingFee, total: Math.max(subtotal - discount + shippingFee, 0) };
};

export const viewCart = asyncHandler(async (req, res) => {
  const cart = await getCart(req.user._id);
  res.json({ success: true, cart, summary: await summarize(cart) });
});

export const addToCart = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.body.productId);
  if (!product) throw new ApiError(404, "Product not found");
  const cart = await getCart(req.user._id);
  const item = cart.items.find((entry) => entry.product._id.equals(product._id));
  if (item) item.quantity += Number(req.body.quantity || 1);
  else cart.items.push({ product: product._id, quantity: Number(req.body.quantity || 1) });
  await cart.save();
  await cart.populate("items.product");
  res.json({ success: true, cart, summary: await summarize(cart) });
});

export const updateCartItem = asyncHandler(async (req, res) => {
  const cart = await getCart(req.user._id);
  const item = cart.items.find((entry) => entry.product._id.equals(req.params.productId));
  if (!item) throw new ApiError(404, "Cart item not found");
  item.quantity = Math.max(Number(req.body.quantity), 1);
  await cart.save();
  await cart.populate("items.product");
  res.json({ success: true, cart, summary: await summarize(cart) });
});

export const removeCartItem = asyncHandler(async (req, res) => {
  const cart = await getCart(req.user._id);
  cart.items = cart.items.filter((entry) => !entry.product._id.equals(req.params.productId));
  await cart.save();
  res.json({ success: true, cart, summary: await summarize(cart) });
});

export const applyCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findOne({ code: String(req.body.code).toUpperCase(), isActive: true });
  if (!coupon) throw new ApiError(404, "Coupon not found");
  const cart = await getCart(req.user._id);
  cart.coupon = coupon.code;
  await cart.save();
  res.json({ success: true, cart, summary: await summarize(cart) });
});
