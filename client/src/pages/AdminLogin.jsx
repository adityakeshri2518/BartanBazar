import { ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

export default function AdminLogin() {
  const { login, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "admin@bartanbazaar.in", password: "Admin@123" });

  const submit = async (event) => {
    event.preventDefault();
    try {
      const data = await login(form);
      if (data.user.role !== "admin") {
        logout();
        toast.error("This login is not an admin account");
        return;
      }
      toast.success("Admin login successful");
      navigate("/admin");
    } catch (error) {
      toast.error(error.response?.data?.message || "Admin login failed");
    }
  };

  return (
    <main className="section grid min-h-[75vh] place-items-center py-10">
      <form onSubmit={submit} className="w-full max-w-md border border-stone-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <ShieldCheck className="text-gold" />
        <p className="mt-4 text-xs font-bold uppercase tracking-[0.22em] text-gold">Admin Access</p>
        <h1 className="mt-2 text-2xl font-black">Login to Dashboard</h1>
        <div className="mt-5 grid gap-3">
          <input className="input" type="email" placeholder="Admin email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <input className="input" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          <button className="btn-primary">Open Admin Dashboard</button>
        </div>
      </form>
    </main>
  );
}
