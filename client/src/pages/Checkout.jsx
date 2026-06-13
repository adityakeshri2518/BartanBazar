import { Banknote, CreditCard, QrCode, Truck, WalletCards } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useShop } from "../context/ShopContext";
import { api, unwrap } from "../services/api";

const upiId = import.meta.env.VITE_UPI_ID || "bartanbazaar@upi";

export default function Checkout() {
  const { cart, summary, refreshCart } = useShop();
  const [address, setAddress] = useState({ name: "", phone: "", line1: "", city: "", state: "", pincode: "" });
  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [rewards, setRewards] = useState({ points: 0, rupeeValue: 0 });
  const [useRewards, setUseRewards] = useState(false);
  const [rewardPoints, setRewardPoints] = useState(0);
  const [scannerOrder, setScannerOrder] = useState(null);
  const [upiReference, setUpiReference] = useState("");

  useEffect(() => {
    unwrap(api.get("/users/rewards")).then((data) => setRewards(data.rewards)).catch(() => {});
  }, []);

  const redeemValue = useMemo(() => (useRewards ? Math.min(Number(rewardPoints) || 0, rewards.points, summary.subtotal) : 0), [useRewards, rewardPoints, rewards.points, summary.subtotal]);
  const payable = Math.max(summary.total - redeemValue, 0);
  const codEligible = summary.subtotal >= 499;
  const freeDeliveryRemaining = Math.max(999 - summary.subtotal, 0);
  const upiUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent("BartanBazaar")}&am=${payable}&cu=INR&tn=${encodeURIComponent("BartanBazaar order")}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(upiUrl)}`;

  useEffect(() => {
    if (paymentMethod === "cod" && !codEligible) setPaymentMethod("razorpay");
  }, [codEligible, paymentMethod]);

  const createOrder = async () =>
    unwrap(
      api.post("/orders", {
        shippingAddress: address,
        paymentMethod,
        useRewardPoints: useRewards,
        rewardPoints: redeemValue
      })
    );

  const pay = async (event) => {
    event.preventDefault();
    try {
      const data = await createOrder();
      if (paymentMethod === "cod") {
        toast.success("Cash on Delivery order placed");
        refreshCart().catch(() => {});
        return;
      }
      if (paymentMethod === "upi_scanner") {
        setScannerOrder(data.order);
        toast.info("Scan the QR and confirm payment");
        return;
      }
      if (window.Razorpay && data.razorpayOrder) {
        const rz = new window.Razorpay({
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: data.razorpayOrder.amount,
          currency: "INR",
          name: "BartanBazaar",
          order_id: data.razorpayOrder.id,
          handler: async (response) => {
            await unwrap(api.post("/orders/verify-payment", { ...response, orderId: data.order._id }));
            toast.success("Order confirmed");
          }
        });
        rz.open();
      } else {
        toast.success("Order created in demo mode");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Checkout failed. Login and try again.");
    }
  };

  const confirmScannerPayment = async () => {
    try {
      await unwrap(api.post("/orders/verify-scanner-payment", { orderId: scannerOrder._id, upiReference }));
      toast.success("Scanner payment confirmed");
      setScannerOrder(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not confirm scanner payment");
    }
  };

  return (
    <main className="section py-8">
      <h1 className="text-3xl font-black">Checkout</h1>
      <form onSubmit={pay} className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
        <section className="grid gap-5">
          <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-xl font-black">Shipping Address</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {["name", "phone", "line1", "city", "state", "pincode"].map((field) => (
                <input key={field} className="input" placeholder={field.replace("line1", "Address line")} value={address[field]} onChange={(e) => setAddress({ ...address, [field]: e.target.value })} required />
              ))}
            </div>
          </div>

          <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="flex items-center gap-2 text-xl font-black"><WalletCards /> Redeem Points</h2>
            <p className="mt-1 text-sm text-stone-500">Available: {rewards.points} points. 1 point = Rs. 1.</p>
            <div className="mt-4 grid gap-3 md:grid-cols-[auto_1fr]">
              <label className="flex items-center gap-2 font-semibold">
                <input type="checkbox" checked={useRewards} onChange={(e) => setUseRewards(e.target.checked)} className="h-4 w-4 accent-blue-600" />
                Use points
              </label>
              <input className="input" type="number" min="0" max={rewards.points} value={rewardPoints} onChange={(e) => setRewardPoints(e.target.value)} disabled={!useRewards} placeholder="Points to redeem" />
            </div>
          </div>

          <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-5 flex items-start gap-3 border border-gold/30 bg-gold/10 p-3 text-sm">
              <Truck className="mt-0.5 shrink-0 text-gold" size={18} />
              <p className="font-semibold text-premium dark:text-white">
                Delivery charge is Rs. 79 below Rs. 999. {freeDeliveryRemaining > 0 ? `Add Rs. ${freeDeliveryRemaining} more for free delivery.` : "You unlocked free delivery."} COD is available above Rs. 499.
              </p>
            </div>
            <h2 className="text-xl font-black">Payment Method</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <button type="button" onClick={() => setPaymentMethod("razorpay")} className={`rounded-sm border p-4 text-left ${paymentMethod === "razorpay" ? "border-gold bg-stone-50 dark:bg-slate-800" : "border-slate-200 dark:border-slate-700"}`}>
                <CreditCard className="text-gold" />
                <p className="mt-2 font-black">Razorpay</p>
                <p className="text-sm text-stone-500">Cards, UPI, net banking</p>
              </button>
              <button type="button" onClick={() => setPaymentMethod("upi_scanner")} className={`rounded-sm border p-4 text-left ${paymentMethod === "upi_scanner" ? "border-gold bg-stone-50 dark:bg-slate-800" : "border-slate-200 dark:border-slate-700"}`}>
                <QrCode className="text-gold" />
                <p className="mt-2 font-black">Payment Scanner</p>
                <p className="text-sm text-stone-500">Scan QR with any UPI app</p>
              </button>
              <button
                type="button"
                onClick={() => codEligible ? setPaymentMethod("cod") : toast.info("COD is available above Rs. 499")}
                className={`rounded-sm border p-4 text-left ${paymentMethod === "cod" ? "border-gold bg-stone-50 dark:bg-slate-800" : "border-slate-200 dark:border-slate-700"} ${!codEligible ? "cursor-not-allowed opacity-60" : ""}`}
              >
                <Banknote className="text-gold" />
                <p className="mt-2 font-black">Cash on Delivery</p>
                <p className="text-sm text-stone-500">{codEligible ? "Pay when your order arrives" : "Available above Rs. 499"}</p>
              </button>
            </div>
          </div>
        </section>

        <aside className="h-max rounded-sm border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-xl font-black">Order Summary</h2>
          <div className="mt-3 grid gap-2 text-sm">
            {cart.items.map((item) => <div key={item.product._id} className="flex justify-between gap-3"><span>{item.product.name} x {item.quantity}</span><span>Rs. {item.product.price * item.quantity}</span></div>)}
          </div>
          <div className="mt-4 grid gap-2 border-t pt-4 text-sm">
            <Row label="Subtotal" value={summary.subtotal} />
            <Row label="Shipping" value={summary.shippingFee} />
            <Row label="Redeem points" value={-redeemValue} />
            <div className="flex justify-between text-lg font-black"><span>Total</span><span>Rs. {payable}</span></div>
          </div>
          <button className="btn-primary mt-5 w-full">{paymentMethod === "upi_scanner" ? "Generate Scanner" : paymentMethod === "cod" ? "Place COD Order" : "Pay with Razorpay"}</button>
        </aside>
      </form>

      {scannerOrder && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-sm bg-white p-5 text-center shadow-2xl dark:bg-slate-900">
            <QrCode className="mx-auto text-gold" />
            <h2 className="mt-2 text-xl font-black">Scan to Pay</h2>
            <p className="mt-1 text-sm text-stone-500">Pay Rs. {scannerOrder.total} to {upiId}</p>
            <img src={qrUrl} alt="UPI payment scanner" className="mx-auto mt-4 h-60 w-60 rounded-md border border-stone-200 p-2" />
            <input className="input mt-4" placeholder="UPI reference number optional" value={upiReference} onChange={(e) => setUpiReference(e.target.value)} />
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button type="button" className="btn-secondary" onClick={() => setScannerOrder(null)}>Cancel</button>
              <button type="button" className="btn-primary" onClick={confirmScannerPayment}>I Have Paid</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function Row({ label, value }) {
  return <div className="flex justify-between"><span>{label}</span><span>Rs. {value}</span></div>;
}
