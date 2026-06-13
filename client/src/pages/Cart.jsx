import { Minus, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useShop } from "../context/ShopContext";

export default function Cart() {
  const { cart, summary, dispatch } = useShop();
  const commit = (items) => {
    const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    dispatch({ type: "CART", cart: { items }, summary: { subtotal, discount: 0, shippingFee: subtotal > 999 ? 0 : 79, total: subtotal + (subtotal > 999 ? 0 : 79) } });
  };
  const update = (product, quantity) => {
    commit(cart.items.map((item) => (item.product._id === product._id ? { ...item, quantity: Math.max(quantity, 1) } : item)));
  };
  const remove = (product) => commit(cart.items.filter((item) => item.product._id !== product._id));
  return (
    <main className="section py-8">
      <h1 className="text-3xl font-black">Cart</h1>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="grid gap-4">
          {cart.items.length === 0 && <div className="rounded-lg border border-stone-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">Your cart is empty.</div>}
          {cart.items.map(({ product, quantity }) => (
            <div key={product._id} className="grid gap-4 rounded-lg border border-stone-200 bg-white p-4 sm:grid-cols-[110px_1fr] dark:border-slate-800 dark:bg-slate-900">
              <img src={product.images?.[0]?.url} alt={product.name} className="h-28 w-28 rounded-md object-cover" />
              <div>
                <h2 className="font-bold">{product.name}</h2>
                <p className="text-sm text-stone-500">Rs. {product.price}</p>
                <div className="mt-3 flex items-center gap-2">
                  <button className="btn-secondary px-2" onClick={() => update(product, quantity - 1)}><Minus size={15} /></button>
                  <span className="w-8 text-center font-bold">{quantity}</span>
                  <button className="btn-secondary px-2" onClick={() => update(product, quantity + 1)}><Plus size={15} /></button>
                  <button className="btn-secondary px-2" onClick={() => remove(product)}><Trash2 size={15} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <Summary summary={summary} />
      </div>
    </main>
  );
}

function Summary({ summary }) {
  return (
    <aside className="h-max rounded-lg border border-stone-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-xl font-black">Price Summary</h2>
      <input className="input mt-4" placeholder="Coupon code e.g. BAZAAR10" />
      <div className="mt-4 grid gap-2 text-sm">
        <Row label="Subtotal" value={summary.subtotal} />
        <Row label="Discount" value={-summary.discount} />
        <Row label="Shipping" value={summary.shippingFee} />
        <div className="border-t pt-3 text-lg font-black"><Row label="Total" value={summary.total} /></div>
      </div>
      <Link to="/checkout" className="btn-primary mt-5 w-full">Checkout</Link>
    </aside>
  );
}

function Row({ label, value }) {
  return <div className="flex justify-between"><span>{label}</span><span>Rs. {value}</span></div>;
}
