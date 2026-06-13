import { BarChart3, Boxes, Edit3, ImagePlus, MapPin, PackageCheck, Save, ShoppingBag, Truck, TrendingUp, UploadCloud, Users, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { api, unwrap } from "../services/api";

const emptyProduct = { name: "", brand: "", category: "", description: "", price: "", mrp: "", stock: "", image: "" };
const statuses = ["placed", "confirmed", "packed", "shipped", "out_for_delivery", "delivered", "cancelled"];

export default function Admin() {
  const [period, setPeriod] = useState("month");
  const [active, setActive] = useState("dashboard");
  const [dashboard, setDashboard] = useState({ stats: {}, recentOrders: [], topProducts: [] });
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [inventory, setInventory] = useState({ lowStock: [], outOfStock: [], remaining: [] });
  const [revenue, setRevenue] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [form, setForm] = useState(emptyProduct);
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [localPreview, setLocalPreview] = useState("");

  const loadAdmin = () => {
    unwrap(api.get(`/admin/dashboard?period=${period}`)).then(setDashboard).catch(() => {});
    unwrap(api.get("/admin/products")).then((data) => setProducts(data.products)).catch(() => {});
    unwrap(api.get("/admin/customers")).then((data) => setCustomers(data.customers)).catch(() => {});
    unwrap(api.get("/admin/orders")).then((data) => setOrders(data.orders)).catch(() => {});
    unwrap(api.get("/categories")).then((data) => setCategories(data.categories)).catch(() => {});
    unwrap(api.get("/admin/reports/inventory")).then((data) => setInventory(data)).catch(() => {});
    unwrap(api.get(`/admin/reports/revenue?period=${period}`)).then((data) => setRevenue(data.report)).catch(() => {});
    unwrap(api.get(`/admin/reports/top-products?period=${period}`)).then((data) => setTopProducts(data.products)).catch(() => {});
  };

  useEffect(loadAdmin, [period]);

  const stats = dashboard.stats || {};
  const currentCategory = useMemo(() => categories.find((item) => item._id === form.category), [categories, form.category]);

  const saveProduct = async (event) => {
    event.preventDefault();
    try {
      const payload = {
        name: form.name,
        brand: form.brand,
        category: form.category,
        description: form.description,
        price: Number(form.price),
        mrp: Number(form.mrp),
        stock: Number(form.stock),
        images: form.image ? [{ url: form.image, alt: form.name }] : undefined,
        categoryName: currentCategory?.name
      };
      if (editingId) await unwrap(api.put(`/admin/products/${editingId}`, payload));
      else await unwrap(api.post("/admin/products", payload));
      toast.success(editingId ? "Product updated" : "Product added");
      setForm(emptyProduct);
      setEditingId(null);
      setLocalPreview("");
      loadAdmin();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not save product");
    }
  };

  const editProduct = (product) => {
    setActive("products");
    setEditingId(product._id);
    setForm({
      name: product.name || "",
      brand: product.brand || "",
      category: product.category?._id || product.category || "",
      description: product.description || "",
      price: product.price || "",
      mrp: product.mrp || "",
      stock: product.stock || "",
      image: product.images?.[0]?.url || ""
    });
    setLocalPreview("");
  };

  const uploadProductImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    try {
      setUploading(true);
      setLocalPreview(URL.createObjectURL(file));
      const body = new FormData();
      body.append("asset", file);
      const data = await unwrap(api.post("/admin/upload", body, { headers: { "Content-Type": "multipart/form-data" } }));
      setForm((current) => ({ ...current, image: data.asset.url }));
      toast.success("Image uploaded");
    } catch (error) {
      toast.error(error.response?.data?.message || "Image upload failed. Check Cloudinary settings.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const clearProductImage = () => {
    setForm((current) => ({ ...current, image: "" }));
    setLocalPreview("");
  };

  const updateOrder = async (orderId, status, etaDays = 5) => {
    try {
      await unwrap(api.patch(`/admin/orders/${orderId}/status`, { status, etaDays, location: "BartanBazaar Fulfilment" }));
      toast.success("Order tracking updated");
      loadAdmin();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not update order");
    }
  };

  return (
    <main className="section py-8">
      <div className="rounded-sm bg-premium p-6 text-white shadow-[0_24px_70px_rgba(36,52,47,0.18)]">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="premium-kicker">Admin Control</p>
            <h1 className="mt-2 text-3xl font-black">BartanBazaar Dashboard</h1>
            <p className="mt-2 text-sm text-stone-300">Products, customers, addresses, orders, delivery tracking, revenue, and inventory.</p>
          </div>
          <select className="input max-w-44 text-premium" value={period} onChange={(event) => setPeriod(event.target.value)}>
            <option value="day">Today</option>
            <option value="week">Last 7 days</option>
            <option value="month">This month</option>
            <option value="year">This year</option>
          </select>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {["dashboard", "products", "orders", "customers", "reports", "inventory"].map((item) => (
          <button key={item} onClick={() => setActive(item)} className={`px-4 py-2 text-sm font-bold capitalize shadow-sm transition ${active === item ? "bg-premium text-white" : "border border-stone-200 bg-white/80 text-premium hover:border-gold"}`}>
            {item}
          </button>
        ))}
      </div>

      {active === "dashboard" && (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
            <Stat icon={<ShoppingBag />} label="Total Orders" value={stats.orders || 0} />
            <Stat icon={<BarChart3 />} label="Total Revenue" value={`Rs. ${stats.revenue || 0}`} />
            <Stat icon={<TrendingUp />} label={`${stats.period || period} Revenue`} value={`Rs. ${stats.periodRevenue || 0}`} />
            <Stat icon={<Users />} label="Customers" value={stats.customers || 0} />
            <Stat icon={<Boxes />} label="Products" value={stats.products || 0} />
            <Stat icon={<PackageCheck />} label="Out of Stock" value={stats.outOfStock || 0} />
          </div>
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <Panel title="Recent Purchases"><OrderTable orders={dashboard.recentOrders || []} compact /></Panel>
            <Panel title="Most Purchased Products"><TopProducts products={dashboard.topProducts || []} /></Panel>
          </div>
        </>
      )}

      {active === "products" && (
        <div className="mt-6 grid gap-6 xl:grid-cols-[420px_1fr]">
          <Panel title={editingId ? "Change Product Detail" : "Add More Product"}>
            <form onSubmit={saveProduct} className="grid gap-3">
              <input className="input" placeholder="Product name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <input className="input" placeholder="Brand" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} required />
              <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required>
                <option value="">Select category</option>
                {categories.map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}
              </select>
              <textarea className="input min-h-24" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
              <div className="grid grid-cols-3 gap-3">
                <input className="input" type="number" placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
                <input className="input" type="number" placeholder="MRP" value={form.mrp} onChange={(e) => setForm({ ...form, mrp: e.target.value })} required />
                <input className="input" type="number" placeholder="Stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} required />
              </div>
              <div className="rounded-sm border border-dashed border-gold/50 bg-gold/5 p-4">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center bg-premium text-gold">
                    <ImagePlus size={22} />
                  </span>
                  <div>
                    <p className="font-black">Product image</p>
                    <p className="text-xs text-stone-500">Upload from device or paste an image URL below.</p>
                  </div>
                </div>
                {(localPreview || form.image) && (
                  <div className="mt-4 flex items-center gap-3 rounded-sm border border-stone-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
                    <img src={localPreview || form.image} alt="Product preview" className="h-20 w-20 rounded-sm object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">{form.image || "Uploading preview..."}</p>
                      <p className="text-xs text-stone-500">{uploading ? "Uploading to Cloudinary..." : "Image ready for product"}</p>
                    </div>
                    <button type="button" onClick={clearProductImage} className="grid h-9 w-9 place-items-center border border-stone-200 text-stone-500 hover:border-gold hover:text-gold" aria-label="Remove image">
                      <X size={16} />
                    </button>
                  </div>
                )}
                <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
                  <input className="input" placeholder="Product image URL" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
                  <label className={`btn-secondary cursor-pointer justify-center px-4 ${uploading ? "pointer-events-none opacity-60" : ""}`}>
                    <UploadCloud size={16} /> {uploading ? "Uploading" : "Upload"}
                    <input type="file" accept="image/*" className="hidden" onChange={uploadProductImage} disabled={uploading} />
                  </label>
                </div>
              </div>
              <button className="btn-primary"><Save size={16} /> {editingId ? "Save Changes" : "Add Product"}</button>
            </form>
          </Panel>
          <Panel title="Manage Products"><ProductTable products={products} onEdit={editProduct} /></Panel>
        </div>
      )}

      {active === "orders" && <Panel title="All Purchasing Detail"><OrderTable orders={orders} onStatus={updateOrder} /></Panel>}
      {active === "customers" && (
        <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_420px]">
          <Panel title="All Customers"><CustomerTable customers={customers} /></Panel>
          <Panel title="Recent Delivery Addresses"><AddressList orders={orders} /></Panel>
        </div>
      )}
      {active === "reports" && (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Panel title="Revenue Report"><RevenueTable rows={revenue} /></Panel>
          <Panel title="Most Purchased by Users"><TopProducts products={topProducts} /></Panel>
        </div>
      )}
      {active === "inventory" && (
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <Panel title="Out of Stock"><StockList products={inventory.outOfStock} /></Panel>
          <Panel title="Low Stock"><StockList products={inventory.lowStock} /></Panel>
          <Panel title="Remaining Stock"><StockList products={inventory.remaining} /></Panel>
        </div>
      )}
    </main>
  );
}

function Stat({ icon, label, value }) {
  return (
    <div className="premium-card p-4">
      <div className="text-gold">{icon}</div>
      <p className="mt-3 text-xs font-bold uppercase tracking-wide text-stone-500">{label}</p>
      <p className="mt-1 text-2xl font-black">{value}</p>
    </div>
  );
}

function Panel({ title, children }) {
  return (
    <section className="premium-card mt-6 p-5">
      <h2 className="text-xl font-black">{title}</h2>
      <div className="mt-4 overflow-x-auto">{children}</div>
    </section>
  );
}

function ProductTable({ products, onEdit }) {
  return (
    <table className="min-w-full text-left text-sm">
      <thead className="bg-stone-100 text-xs uppercase text-stone-500"><tr><th className="p-3">Product</th><th className="p-3">Brand</th><th className="p-3">Stock</th><th className="p-3">Price</th><th className="p-3">Action</th></tr></thead>
      <tbody>{products.map((product) => <tr key={product._id} className="border-b border-stone-100"><td className="p-3 font-bold">{product.name}</td><td className="p-3">{product.brand}</td><td className={`p-3 font-bold ${product.stock <= 0 ? "text-red-600" : product.stock <= 10 ? "text-amber-600" : "text-green-700"}`}>{product.stock <= 0 ? "Out of stock" : product.stock}</td><td className="p-3">Rs. {product.price}</td><td className="p-3"><button className="btn-secondary px-3 py-2" onClick={() => onEdit(product)}><Edit3 size={15} /> Edit</button></td></tr>)}</tbody>
    </table>
  );
}

function OrderTable({ orders, compact = false, onStatus }) {
  return (
    <table className="min-w-full text-left text-sm">
      <thead className="bg-stone-100 text-xs uppercase text-stone-500"><tr><th className="p-3">Order</th><th className="p-3">Customer</th><th className="p-3">Address</th><th className="p-3">Total</th><th className="p-3">Status</th>{!compact && <th className="p-3">Tracking</th>}{!compact && <th className="p-3">Action</th>}</tr></thead>
      <tbody>{orders.map((order) => <tr key={order._id} className="border-b border-stone-100"><td className="p-3 font-bold">#{order._id?.slice(-6)}</td><td className="p-3">{order.user?.name || "Customer"}</td><td className="max-w-xs p-3 text-xs leading-5 text-stone-600">{formatAddress(order.shippingAddress)}</td><td className="p-3">Rs. {order.total}</td><td className="p-3 capitalize">{order.orderStatus?.replaceAll("_", " ")}</td>{!compact && <td className="p-3 text-xs">{order.delivery?.trackingId || "-"}<br />ETA: {etaText(order.delivery)}</td>}{!compact && <td className="p-3"><StatusMenu order={order} onStatus={onStatus} /></td>}</tr>)}</tbody>
    </table>
  );
}

function CustomerTable({ customers }) {
  return <table className="min-w-full text-left text-sm"><thead className="bg-stone-100 text-xs uppercase text-stone-500"><tr><th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Phone</th><th className="p-3">Joined</th></tr></thead><tbody>{customers.map((customer) => <tr key={customer._id} className="border-b border-stone-100"><td className="p-3 font-bold">{customer.name}</td><td className="p-3">{customer.email}</td><td className="p-3">{customer.phone || "-"}</td><td className="p-3">{new Date(customer.createdAt).toLocaleDateString()}</td></tr>)}</tbody></table>;
}

function RevenueTable({ rows }) {
  return <table className="min-w-full text-left text-sm"><thead className="bg-stone-100 text-xs uppercase text-stone-500"><tr><th className="p-3">Period</th><th className="p-3">Orders</th><th className="p-3">Revenue</th></tr></thead><tbody>{rows.map((row) => <tr key={row._id} className="border-b border-stone-100"><td className="p-3 font-bold">{row._id}</td><td className="p-3">{row.orders}</td><td className="p-3">Rs. {row.revenue}</td></tr>)}</tbody></table>;
}

function TopProducts({ products }) {
  if (!products?.length) return <p className="text-sm text-stone-500">No purchase data yet.</p>;
  return <div className="grid gap-3">{products.map((product) => <div key={product._id || product.name} className="flex items-center justify-between bg-stone-100 p-3 dark:bg-slate-800"><span className="font-bold">{product.name}</span><span>{product.quantity} sold - Rs. {product.revenue}</span></div>)}</div>;
}

function StockList({ products = [] }) {
  if (!products.length) return <p className="text-sm text-stone-500">No products in this section.</p>;
  return <div className="grid gap-3">{products.map((product) => <div key={product._id} className="bg-stone-100 p-3 dark:bg-slate-800"><p className="font-bold">{product.name}</p><p className="text-sm text-stone-500">{product.brand} - Stock: {product.stock}</p></div>)}</div>;
}

function StatusMenu({ order, onStatus }) {
  const [status, setStatus] = useState(order.orderStatus || "placed");
  const [eta, setEta] = useState(order.delivery?.etaDays || 5);
  return <div className="grid min-w-44 gap-2"><select className="input py-2" value={status} onChange={(event) => setStatus(event.target.value)}>{statuses.map((item) => <option key={item} value={item}>{item.replaceAll("_", " ")}</option>)}</select><div className="flex gap-2"><input className="input py-2" type="number" min="1" max="30" value={eta} onChange={(event) => setEta(event.target.value)} /><button className="btn-primary px-3 py-2" onClick={() => onStatus(order._id, status, eta)}><Truck size={15} /></button></div></div>;
}

function AddressList({ orders }) {
  const withAddress = orders.filter((order) => order.shippingAddress).slice(0, 8);
  if (!withAddress.length) return <p className="text-sm text-stone-500">No customer addresses yet.</p>;
  return <div className="grid gap-3">{withAddress.map((order) => <div key={order._id} className="border border-stone-200 bg-white/70 p-3"><p className="flex items-center gap-2 font-black"><MapPin size={16} className="text-gold" /> {order.shippingAddress?.name || order.user?.name}</p><p className="mt-1 text-sm leading-6 text-stone-600">{formatAddress(order.shippingAddress)}</p><p className="mt-1 text-xs text-stone-500">Order #{order._id?.slice(-6)} - {order.shippingAddress?.phone}</p></div>)}</div>;
}

function formatAddress(address = {}) {
  return [address.line1, address.line2, address.city, address.state, address.pincode, address.country].filter(Boolean).join(", ") || "-";
}

function etaText(delivery = {}) {
  if (delivery?.estimatedDeliveryDate) return new Date(delivery.estimatedDeliveryDate).toLocaleDateString();
  return `${delivery?.etaDays || 5} days`;
}
