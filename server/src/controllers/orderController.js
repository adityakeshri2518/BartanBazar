import crypto from "crypto";
import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import { razorpay } from "../config/razorpay.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const orderTotals = (items, rewardPoints = 0) => {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee = subtotal > 999 ? 0 : 79;
  const rewardDiscount = Math.min(Number(rewardPoints) || 0, subtotal);
  const total = Math.max(subtotal - rewardDiscount + shippingFee, 0);
  return { subtotal, shippingFee, discount: 0, rewardDiscount, rewardPointsUsed: rewardDiscount, total };
};

const money = (value) => `Rs. ${Number(value || 0).toFixed(2)}`;

const formatDate = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const cleanPdfText = (value, max = 90) => {
  const text = String(value ?? "")
    .replace(/[\\()]/g, "\\$&")
    .replace(/[^\x20-\x7E]/g, " ");
  return text.length > max ? `${text.slice(0, max - 3)}...` : text;
};

const buildPdf = (content) => {
  const stream = content.join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
    `<< /Length ${Buffer.byteLength(stream, "latin1")} >>\nstream\n${stream}\nendstream`
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf, "latin1"));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = Buffer.byteLength(pdf, "latin1");
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return Buffer.from(pdf, "latin1");
};

const text = (content, value, x, y, size = 10, bold = false, color = "0.13 0.19 0.17") => {
  content.push(`q ${color} rg BT /${bold ? "F2" : "F1"} ${size} Tf ${x} ${y} Td (${cleanPdfText(value)}) Tj ET Q`);
};

const line = (content, x1, y1, x2, y2, color = "0.78 0.70 0.55") => {
  content.push(`q ${color} RG 0.8 w ${x1} ${y1} m ${x2} ${y2} l S Q`);
};

const fillRect = (content, x, y, width, height, color) => {
  content.push(`q ${color} rg ${x} ${y} ${width} ${height} re f Q`);
};

const buildInvoicePdf = (order) => {
  const content = [];
  const address = order.shippingAddress || {};
  const addressLines = [
    address.name,
    address.line1,
    address.line2,
    [address.city, address.state, address.pincode].filter(Boolean).join(", "),
    address.country || "India",
    address.phone ? `Phone: ${address.phone}` : ""
  ].filter(Boolean);
  const invoiceNo = `BB-${String(order._id).slice(-8).toUpperCase()}`;
  const eta = order.delivery?.estimatedDeliveryDate ? formatDate(order.delivery.estimatedDeliveryDate) : `${order.delivery?.etaDays || 5} days`;

  fillRect(content, 0, 792, 595, 50, "0.13 0.19 0.17");
  text(content, "BartanBazaar", 40, 812, 22, true, "1 1 1");
  text(content, "Premium utensils, crockery and kitchenware marketplace", 40, 797, 9, false, "0.91 0.82 0.63");
  text(content, "TAX INVOICE", 455, 812, 16, true, "1 1 1");
  text(content, invoiceNo, 455, 797, 9, false, "0.91 0.82 0.63");

  text(content, "Invoice Details", 40, 758, 12, true);
  text(content, `Invoice No: ${invoiceNo}`, 40, 740);
  text(content, `Order ID: ${order._id}`, 40, 724);
  text(content, `Invoice Date: ${formatDate(new Date())}`, 40, 708);
  text(content, `Order Date: ${formatDate(order.createdAt)}`, 40, 692);

  text(content, "Customer", 330, 758, 12, true);
  text(content, order.user?.name || address.name || "Customer", 330, 740);
  text(content, order.user?.email || "-", 330, 724);
  addressLines.slice(1).forEach((entry, index) => text(content, entry, 330, 708 - index * 16));

  line(content, 40, 656, 555, 656);
  text(content, "Delivery & Payment", 40, 632, 12, true);
  text(content, `Status: ${String(order.orderStatus || "placed").replaceAll("_", " ")}`, 40, 614);
  text(content, `Courier: ${order.delivery?.courier || "BartanBazaar Logistics"}`, 40, 598);
  text(content, `Tracking ID: ${order.delivery?.trackingId || "Preparing"}`, 40, 582);
  text(content, `Expected Delivery: ${eta}`, 40, 566);
  text(content, `Payment Method: ${order.payment?.method || "-"}`, 330, 614);
  text(content, `Payment Status: ${order.payment?.status || "-"}`, 330, 598);
  text(content, `UPI/Razorpay Ref: ${order.payment?.upiReference || order.payment?.razorpayPaymentId || "-"}`, 330, 582);

  fillRect(content, 40, 520, 515, 28, "0.91 0.82 0.63");
  text(content, "Product", 50, 530, 10, true);
  text(content, "Qty", 330, 530, 10, true);
  text(content, "Price", 385, 530, 10, true);
  text(content, "Amount", 480, 530, 10, true);

  let y = 494;
  const visibleItems = order.items.slice(0, 10);
  visibleItems.forEach((item, index) => {
    if (index % 2 === 0) fillRect(content, 40, y - 7, 515, 24, "0.97 0.96 0.93");
    const amount = Number(item.price || 0) * Number(item.quantity || 0);
    text(content, item.name, 50, y, 9);
    text(content, item.quantity, 334, y, 9);
    text(content, money(item.price), 385, y, 9);
    text(content, money(amount), 480, y, 9);
    y -= 26;
  });
  if (order.items.length > visibleItems.length) {
    text(content, `${order.items.length - visibleItems.length} more item(s) included in this order`, 50, y, 9);
    y -= 26;
  }

  line(content, 40, y + 8, 555, y + 8);
  const totalsX = 380;
  text(content, "Subtotal", totalsX, y - 12, 10);
  text(content, money(order.subtotal), 480, y - 12, 10);
  text(content, "Shipping", totalsX, y - 30, 10);
  text(content, money(order.shippingFee), 480, y - 30, 10);
  text(content, "Reward Discount", totalsX, y - 48, 10);
  text(content, `- ${money(order.rewardDiscount)}`, 480, y - 48, 10);
  fillRect(content, 370, y - 82, 185, 24, "0.13 0.19 0.17");
  text(content, "Grand Total", totalsX, y - 74, 11, true, "1 1 1");
  text(content, money(order.total), 480, y - 74, 11, true, "1 1 1");

  text(content, "Thank you for shopping with BartanBazaar.", 40, 86, 11, true);
  text(content, "For support: support@bartanbazaar.com | Return and refund as per store policy.", 40, 68, 9);
  text(content, "This is a computer generated invoice.", 40, 50, 8);

  return buildPdf(content);
};

const completePaidOrder = async (order, userId, paymentUpdate = {}) => {
  if (order.payment.status === "paid") throw new ApiError(400, "Order is already paid");
  const user = await User.findById(userId).select("rewardPoints");
  if (order.rewardPointsUsed > user.rewardPoints) throw new ApiError(400, "Not enough redeem points");
  const earned = Math.floor(order.total / 100);
  const paidOrder = await Order.findOneAndUpdate(
    { _id: order._id, user: userId },
    {
      $set: {
        ...paymentUpdate,
        "payment.status": "paid",
        orderStatus: "confirmed",
        rewardPointsEarned: earned
      },
      $push: { tracking: { label: "Payment confirmed", location: order.payment.method === "upi_scanner" ? "UPI scanner" : "Razorpay" } }
    },
    { new: true }
  );
  if (!paidOrder) throw new ApiError(404, "Order not found");
  const rewardPush = [];
  if (paidOrder.rewardPointsUsed > 0) {
    rewardPush.push({ type: "redeemed", points: paidOrder.rewardPointsUsed, note: "Used during purchase", order: paidOrder._id });
  }
  if (earned > 0) {
    rewardPush.push({ type: "earned", points: earned, note: "Earned from purchase", order: paidOrder._id });
  }
  await User.findByIdAndUpdate(userId, {
    $inc: { rewardPoints: earned - paidOrder.rewardPointsUsed },
    $push: { rewardHistory: { $each: rewardPush } }
  });
  await Cart.findOneAndUpdate({ user: userId }, { items: [], coupon: null });
  await Product.bulkWrite(
    paidOrder.items.map((item) => ({
      updateOne: { filter: { _id: item.product }, update: { $inc: { sold: item.quantity, stock: -item.quantity } } }
    }))
  );
  return paidOrder;
};

const completeCodOrder = async (order, userId) => {
  const earned = Math.floor(order.total / 100);
  const rewardPush = [];
  if (order.rewardPointsUsed > 0) {
    rewardPush.push({ type: "redeemed", points: order.rewardPointsUsed, note: "Used during COD purchase", order: order._id });
  }
  if (earned > 0) {
    rewardPush.push({ type: "earned", points: earned, note: "Earned from COD purchase", order: order._id });
  }
  await User.findByIdAndUpdate(userId, {
    $inc: { rewardPoints: earned - order.rewardPointsUsed },
    $push: { rewardHistory: { $each: rewardPush } }
  });
  await Cart.findOneAndUpdate({ user: userId }, { items: [], coupon: null });
  await Product.bulkWrite(
    order.items.map((item) => ({
      updateOne: { filter: { _id: item.product }, update: { $inc: { sold: item.quantity, stock: -item.quantity } } }
    }))
  );
  return Order.findByIdAndUpdate(
    order._id,
    {
      $set: { rewardPointsEarned: earned },
      $push: { tracking: { label: "COD order confirmed", location: "BartanBazaar Fulfilment" } }
    },
    { new: true }
  );
};

export const createOrder = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
  if (!cart?.items.length) throw new ApiError(400, "Cart is empty");
  const items = cart.items.map((item) => ({
    product: item.product._id,
    name: item.product.name,
    image: item.product.images?.[0]?.url,
    price: item.product.price,
    quantity: item.quantity
  }));
  const user = await User.findById(req.user._id).select("rewardPoints");
  const requestedPoints = req.body.useRewardPoints ? Number(req.body.rewardPoints || 0) : 0;
  if (requestedPoints > user.rewardPoints) throw new ApiError(400, "Not enough redeem points");
  const paymentMethod = req.body.paymentMethod || "razorpay";
  const totals = orderTotals(items, requestedPoints);
  if (paymentMethod === "cod" && totals.subtotal < 499) {
    throw new ApiError(400, "Cash on Delivery is available only on orders above Rs. 499");
  }
  let razorpayOrder = null;
  if (paymentMethod === "razorpay" && razorpay) {
    razorpayOrder = await razorpay.orders.create({
      amount: totals.total * 100,
      currency: "INR",
      receipt: `bb_${Date.now()}`
    });
  }
  const order = await Order.create({
    user: req.user._id,
    items,
    shippingAddress: req.body.shippingAddress,
    ...totals,
    payment: {
      method: paymentMethod,
      provider: paymentMethod === "upi_scanner" ? "upi" : paymentMethod === "cod" ? "cod" : "razorpay",
      razorpayOrderId: razorpayOrder?.id,
      status: "pending"
    },
    orderStatus: paymentMethod === "cod" ? "confirmed" : "placed",
    delivery: {
      courier: "BartanBazaar Logistics",
      trackingId: `BB${Date.now()}`,
      estimatedDeliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      etaDays: 5
    },
    tracking: [{ label: "Order placed", location: "BartanBazaar" }]
  });
  const finalOrder = paymentMethod === "cod" ? await completeCodOrder(order, req.user._id) : order;
  res.status(201).json({ success: true, order: finalOrder, razorpayOrder });
});

export const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;
  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
    .update(body)
    .digest("hex");
  if (process.env.RAZORPAY_KEY_SECRET && expected !== razorpay_signature) {
    throw new ApiError(400, "Invalid payment signature");
  }
  const order = await Order.findOne({ _id: orderId, user: req.user._id });
  if (!order) throw new ApiError(404, "Order not found");
  const paidOrder = await completePaidOrder(order, req.user._id, {
    "payment.provider": "razorpay",
    "payment.method": "razorpay",
    "payment.razorpayOrderId": razorpay_order_id,
    "payment.razorpayPaymentId": razorpay_payment_id,
    "payment.razorpaySignature": razorpay_signature
  });
  res.json({ success: true, order: paidOrder });
});

export const verifyScannerPayment = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.body.orderId, user: req.user._id, "payment.method": "upi_scanner" });
  if (!order) throw new ApiError(404, "UPI scanner order not found");
  const paidOrder = await completePaidOrder(order, req.user._id, {
    "payment.upiReference": req.body.upiReference || "customer-confirmed"
  });
  res.json({ success: true, order: paidOrder });
});

export const myOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort("-createdAt");
  res.json({ success: true, orders });
});

export const orderDetails = asyncHandler(async (req, res) => {
  const query = req.user.role === "admin" ? { _id: req.params.id } : { _id: req.params.id, user: req.user._id };
  const order = await Order.findOne(query).populate("user", "name email");
  if (!order) throw new ApiError(404, "Order not found");
  res.json({ success: true, order });
});

export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id, orderStatus: { $nin: ["shipped", "delivered", "cancelled"] } },
    {
      $set: { orderStatus: "cancelled" },
      $push: { tracking: { label: "Order cancelled", location: "Customer request" } }
    },
    { new: true }
  );
  if (!order) throw new ApiError(400, "Order cannot be cancelled");
  res.json({ success: true, order });
});

export const invoice = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id }).populate("user", "name email");
  if (!order) throw new ApiError(404, "Order not found");
  const pdf = buildInvoicePdf(order);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="BartanBazaar-Invoice-${String(order._id).slice(-8)}.pdf"`);
  res.setHeader("Content-Length", pdf.length);
  res.send(pdf);
});
