import { Gift, KeyRound, MapPin, Package, Save, UserRound, WalletCards } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { api, unwrap } from "../services/api";

export default function Profile() {
  const { user, updateLocalUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [rewards, setRewards] = useState({ points: user?.rewardPoints || 0, rupeeValue: user?.rewardPoints || 0, history: [] });
  const [profile, setProfile] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    avatar: user?.avatar || "",
    dateOfBirth: user?.dateOfBirth?.slice?.(0, 10) || "",
    gender: user?.gender || ""
  });
  const [password, setPassword] = useState({ currentPassword: "", newPassword: "" });
  const [address, setAddress] = useState({ name: "", phone: "", line1: "", line2: "", city: "", state: "", pincode: "", isDefault: true });

  const loadAccount = () => {
    unwrap(api.get("/orders")).then((data) => setOrders(data.orders)).catch(() => {});
    unwrap(api.get("/users/addresses")).then((data) => setAddresses(data.addresses)).catch(() => {});
    unwrap(api.get("/users/rewards")).then((data) => setRewards(data.rewards)).catch(() => {});
  };

  useEffect(loadAccount, []);

  const saveProfile = async (event) => {
    event.preventDefault();
    try {
      const data = await unwrap(api.put("/users/profile", profile));
      updateLocalUser(data.user);
      toast.success("Personal details updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not update profile");
    }
  };

  const changePassword = async (event) => {
    event.preventDefault();
    try {
      await unwrap(api.put("/auth/password", password));
      setPassword({ currentPassword: "", newPassword: "" });
      toast.success("Password changed");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not change password");
    }
  };

  const saveAddress = async (event) => {
    event.preventDefault();
    try {
      await unwrap(api.post("/users/addresses", address));
      setAddress({ name: "", phone: "", line1: "", line2: "", city: "", state: "", pincode: "", isDefault: true });
      loadAccount();
      toast.success("Address saved");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not save address");
    }
  };

  return (
    <main className="section py-8">
      <p className="text-sm font-bold uppercase tracking-[0.22em] text-gold">Account settings</p>
      <h1 className="text-3xl font-black">Personal Details</h1>
      <div className="mt-6 grid gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="h-max rounded-sm border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <UserRound className="text-gold" />
          <h2 className="mt-3 text-xl font-black">{user?.name}</h2>
          <p className="break-all text-sm text-stone-500">{user?.email}</p>
          <div className="mt-5 rounded-sm bg-premiumSoft p-4 dark:bg-slate-800">
            <div className="flex items-center gap-2 text-gold"><Gift size={19} /><span className="font-black">{rewards.points} points</span></div>
            <p className="mt-1 text-sm text-stone-600 dark:text-slate-300">Worth Rs. {rewards.rupeeValue}. Use during checkout.</p>
          </div>
        </aside>

        <section className="grid gap-5">
          <Panel title="Edit Personal Details" icon={<UserRound />}>
            <form onSubmit={saveProfile} className="grid gap-3 md:grid-cols-2">
              <input className="input" placeholder="Full name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} required />
              <input className="input" placeholder="Email" value={profile.email} disabled />
              <input className="input" placeholder="Phone number" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
              <input className="input" placeholder="Avatar image URL" value={profile.avatar} onChange={(e) => setProfile({ ...profile, avatar: e.target.value })} />
              <input className="input" type="date" value={profile.dateOfBirth} onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })} />
              <select className="input" value={profile.gender} onChange={(e) => setProfile({ ...profile, gender: e.target.value })}>
                <option value="">Gender</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="non_binary">Non-binary</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
              <button className="btn-primary md:col-span-2"><Save size={17} /> Save Details</button>
            </form>
          </Panel>

          <Panel title="Change Password" icon={<KeyRound />}>
            <form onSubmit={changePassword} className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
              <input className="input" type="password" placeholder="Current password" value={password.currentPassword} onChange={(e) => setPassword({ ...password, currentPassword: e.target.value })} required />
              <input className="input" type="password" placeholder="New password" value={password.newPassword} onChange={(e) => setPassword({ ...password, newPassword: e.target.value })} required />
              <button className="btn-secondary">Update</button>
            </form>
          </Panel>

          <Panel title="Redeem Points" icon={<WalletCards />}>
            <div className="grid gap-4 md:grid-cols-[220px_1fr]">
              <div className="rounded-sm bg-premium p-5 text-white">
                <p className="text-sm">Available balance</p>
                <p className="mt-1 text-3xl font-black">{rewards.points}</p>
                <p className="text-sm">Rs. {rewards.rupeeValue} checkout value</p>
              </div>
              <div className="grid gap-2">
                {rewards.history.length === 0 && <p className="text-sm text-stone-500">No reward activity yet.</p>}
                {rewards.history.slice(0, 6).map((item) => (
                  <div key={item._id || item.at} className="flex justify-between rounded-md bg-stone-100 p-3 text-sm dark:bg-slate-800">
                    <span>{item.note || item.type}</span>
                    <span className={item.type === "earned" ? "font-bold text-offergreen" : "font-bold text-gold"}>
                      {item.type === "earned" ? "+" : "-"}{item.points}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Panel>

          <Panel title="Saved Addresses" icon={<MapPin />}>
            <form onSubmit={saveAddress} className="grid gap-3 md:grid-cols-2">
              {["name", "phone", "line1", "line2", "city", "state", "pincode"].map((field) => (
                <input key={field} className="input" placeholder={field === "line1" ? "Address line 1" : field === "line2" ? "Address line 2" : field} value={address[field]} onChange={(e) => setAddress({ ...address, [field]: e.target.value })} required={field !== "line2"} />
              ))}
              <button className="btn-secondary md:col-span-2">Save Address</button>
            </form>
            <div className="mt-4 grid gap-2">
              {addresses.map((item) => (
                <div key={item._id} className="rounded-md bg-stone-100 p-3 text-sm dark:bg-slate-800">
                  <p className="font-bold">{item.name} {item.isDefault && <span className="text-gold">(Default)</span>}</p>
                  <p>{item.line1}, {item.city}, {item.state} - {item.pincode}</p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="My Orders" icon={<Package />}>
            {orders.length === 0 && <p className="text-sm text-stone-500">No orders yet.</p>}
            {orders.slice(0, 5).map((order) => (
              <div key={order._id} className="rounded-md bg-stone-100 p-3 dark:bg-slate-800">
                <div className="flex justify-between"><span className="font-bold">#{order._id.slice(-6)}</span><span>Rs. {order.total}</span></div>
                <p className="text-sm capitalize text-stone-500">{order.orderStatus} · Earned {order.rewardPointsEarned || 0} points</p>
              </div>
            ))}
          </Panel>
        </section>
      </div>
    </main>
  );
}

function Panel({ title, icon, children }) {
  return (
    <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="mb-4 flex items-center gap-2 text-xl font-black">{icon} {title}</h2>
      {children}
    </div>
  );
}
