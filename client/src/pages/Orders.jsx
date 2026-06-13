import { CheckCircle2, Clock, Download, MessageSquare, Package, Star, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { api, unwrap } from "../services/api";

const steps = ["placed", "confirmed", "packed", "shipped", "out_for_delivery", "delivered"];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [feedback, setFeedback] = useState({});
  const [busyInvoice, setBusyInvoice] = useState("");
  const [busyReview, setBusyReview] = useState("");

  useEffect(() => {
    unwrap(api.get("/orders")).then((data) => setOrders(data.orders)).catch(() => {});
  }, []);

  const downloadInvoice = async (order) => {
    try {
      setBusyInvoice(order._id);
      const response = await api.get(`/orders/${order._id}/invoice`, { responseType: "blob" });
      const blob = new Blob([response.data], { type: response.headers["content-type"] || "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `BartanBazaar-Invoice-${order._id.slice(-8)}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(error.response?.data?.message || "Invoice download failed");
    } finally {
      setBusyInvoice("");
    }
  };

  const updateFeedback = (key, field, value) => {
    setFeedback((previous) => ({
      ...previous,
      [key]: { rating: 5, title: "", comment: "", ...previous[key], [field]: value }
    }));
  };

  const submitFeedback = async (item, key) => {
    const productId = item.product?._id || item.product;
    const value = feedback[key] || {};
    if (!productId) {
      toast.error("Product detail missing for this order item");
      return;
    }
    if (!value.comment?.trim()) {
      toast.error("Please write a short feedback message");
      return;
    }
    try {
      setBusyReview(key);
      await unwrap(api.post(`/products/${productId}/reviews`, {
        rating: Number(value.rating || 5),
        title: value.title?.trim() || `Feedback for ${item.name}`,
        comment: value.comment.trim()
      }));
      toast.success("Feedback submitted");
      setFeedback((previous) => ({
        ...previous,
        [key]: { ...previous[key], title: "", comment: "" }
      }));
    } catch (error) {
      toast.error(error.response?.data?.message || "Feedback failed");
    } finally {
      setBusyReview("");
    }
  };

  return (
    <main className="section py-8">
      <p className="premium-kicker">My Orders</p>
      <h1 className="mt-1 text-3xl font-black">Order Tracking</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-500">
        See every product you purchased, download invoices, track delivery progress, and review your latest order.
      </p>
      <div className="mt-6 grid gap-5">
        {orders.length === 0 && <div className="premium-card p-8">No orders yet.</div>}
        {orders.map((order, index) => (
          <OrderCard
            key={order._id}
            order={order}
            isRecent={index === 0}
            feedback={feedback}
            busyInvoice={busyInvoice === order._id}
            busyReview={busyReview}
            downloadInvoice={downloadInvoice}
            updateFeedback={updateFeedback}
            submitFeedback={submitFeedback}
          />
        ))}
      </div>
    </main>
  );
}

function OrderCard({ order, isRecent, feedback, busyInvoice, busyReview, downloadInvoice, updateFeedback, submitFeedback }) {
  const currentIndex = steps.indexOf(order.orderStatus);
  const eta = order.delivery?.estimatedDeliveryDate ? new Date(order.delivery.estimatedDeliveryDate).toLocaleDateString() : `${order.delivery?.etaDays || 5} days`;

  return (
    <article className="premium-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-black">Order #{order._id.slice(-8)}</h2>
          <p className="mt-1 capitalize text-stone-500">{order.orderStatus?.replaceAll("_", " ")}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black">Rs. {order.total}</p>
          <p className="text-sm text-stone-500">ETA: {eta}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-[1fr_280px]">
        <div>
          <div className="grid gap-3 sm:grid-cols-2">
            {order.items?.map((item) => (
              <div key={`${order._id}-${item.name}`} className="flex gap-3 bg-stone-100 p-3 dark:bg-slate-800">
                <img src={item.image} alt={item.name} className="h-16 w-16 object-cover" />
                <div>
                  <p className="font-bold">{item.name}</p>
                  <p className="text-sm text-stone-500">Qty {item.quantity} - Rs. {item.price}</p>
                </div>
              </div>
            ))}
          </div>
          <TrackingTimeline status={order.orderStatus} />
          {isRecent && (
            <FeedbackPanel
              order={order}
              feedback={feedback}
              busyReview={busyReview}
              updateFeedback={updateFeedback}
              submitFeedback={submitFeedback}
            />
          )}
        </div>

        <aside className="bg-premium p-4 text-white">
          <Truck className="text-gold" />
          <h3 className="mt-3 font-black">Delivery Details</h3>
          <p className="mt-2 text-sm leading-6 text-stone-300">Courier: {order.delivery?.courier || "BartanBazaar Logistics"}</p>
          <p className="text-sm leading-6 text-stone-300">Tracking ID: {order.delivery?.trackingId || "Preparing"}</p>
          <p className="text-sm leading-6 text-stone-300">Expected in: {eta}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" className="btn-secondary bg-white px-3 py-2 text-premium" onClick={() => downloadInvoice(order)} disabled={busyInvoice}>
              <Download size={15} /> {busyInvoice ? "Downloading" : "Invoice"}
            </button>
          </div>
        </aside>
      </div>
    </article>
  );
}

function FeedbackPanel({ order, feedback, busyReview, updateFeedback, submitFeedback }) {
  return (
    <section className="mt-6 border border-gold/30 bg-white p-4 shadow-sm dark:bg-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 font-black">
            <MessageSquare size={18} className="text-gold" /> Feedback for recent order
          </h3>
          <p className="mt-1 text-sm text-stone-500">Rate the products you bought and help other customers choose better.</p>
        </div>
        <span className="bg-gold/10 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-gold">Recent</span>
      </div>

      <div className="mt-4 grid gap-4">
        {order.items?.map((item) => {
          const key = `${order._id}-${item.product?._id || item.product || item.name}`;
          const value = feedback[key] || { rating: 5, title: "", comment: "" };
          return (
            <div key={key} className="grid gap-3 border border-stone-200 bg-stone-50 p-3 dark:border-slate-700 dark:bg-slate-800 md:grid-cols-[180px_1fr]">
              <div className="flex items-center gap-3">
                <img src={item.image} alt={item.name} className="h-14 w-14 object-cover" />
                <div>
                  <p className="text-sm font-black">{item.name}</p>
                  <p className="text-xs text-stone-500">Purchased qty {item.quantity}</p>
                </div>
              </div>
              <div className="grid gap-2">
                <div className="grid gap-2 sm:grid-cols-[120px_1fr]">
                  <label className="flex items-center gap-2 border border-stone-200 bg-white px-3 py-2 text-sm font-bold dark:border-slate-700 dark:bg-slate-900">
                    <Star size={15} className="text-gold" />
                    <select value={value.rating} onChange={(event) => updateFeedback(key, "rating", event.target.value)} className="w-full bg-transparent outline-none">
                      {[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating}</option>)}
                    </select>
                  </label>
                  <input
                    value={value.title}
                    onChange={(event) => updateFeedback(key, "title", event.target.value)}
                    placeholder="Short title"
                    className="border border-stone-200 bg-white px-3 py-2 text-sm font-medium outline-none focus:border-gold dark:border-slate-700 dark:bg-slate-900"
                  />
                </div>
                <textarea
                  value={value.comment}
                  onChange={(event) => updateFeedback(key, "comment", event.target.value)}
                  placeholder="Write feedback about quality, packaging, or delivery..."
                  rows={2}
                  className="resize-none border border-stone-200 bg-white px-3 py-2 text-sm font-medium outline-none focus:border-gold dark:border-slate-700 dark:bg-slate-900"
                />
                <div className="flex justify-end">
                  <button type="button" className="btn-primary px-4 py-2 text-sm" onClick={() => submitFeedback(item, key)} disabled={busyReview === key}>
                    {busyReview === key ? "Submitting" : "Submit Feedback"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function TrackingTimeline({ status }) {
  const currentIndex = steps.indexOf(status);
  return (
    <div className="mt-6">
      <h3 className="mb-4 flex items-center gap-2 font-black"><Package size={18} className="text-gold" /> Tracking Timeline</h3>
      <div className="grid gap-3 md:grid-cols-6">
        {steps.map((step, index) => {
          const done = currentIndex >= index;
          return (
            <div key={step} className={`border p-3 ${done ? "border-gold bg-gold/10" : "border-stone-200 bg-white/60"}`}>
              {done ? <CheckCircle2 size={18} className="text-gold" /> : <Clock size={18} className="text-stone-400" />}
              <p className="mt-2 text-xs font-bold capitalize">{step.replaceAll("_", " ")}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
