import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { api, unwrap } from "../services/api";

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const submit = async (event) => {
    event.preventDefault();
    try {
      await login(form);
      toast.success("Welcome back");
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    }
  };
  return <AuthShell title="Login to BartanBazaar" submit={submit} form={form} setForm={setForm} mode="login" />;
}

export function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const submit = async (event) => {
    event.preventDefault();
    try {
      await signup(form);
      toast.success("Account created");
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed");
    }
  };
  return <AuthShell title="Create your account" submit={submit} form={form} setForm={setForm} mode="signup" />;
}

function AuthShell({ title, submit, form, setForm, mode }) {
  return (
    <main className="section grid min-h-[70vh] place-items-center py-10">
      <form onSubmit={submit} className="w-full max-w-md rounded-sm border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-2xl font-black">{title}</h1>
        <div className="mt-5 grid gap-3">
          {mode === "signup" && <input className="input" placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />}
          <input className="input" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          {mode === "signup" && <input className="input" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />}
          <input className="input" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          <button className="btn-primary w-full">{mode === "signup" ? "Create Account" : "Login"}</button>
        </div>
        <div className="mt-4 flex justify-between text-sm">
          <Link to={mode === "signup" ? "/login" : "/signup"} className="font-bold text-gold">{mode === "signup" ? "Login instead" : "Create account"}</Link>
          <Link to="/forgot-password">Forgot password?</Link>
        </div>
      </form>
    </main>
  );
}

export function ForgotPassword() {
  const [step, setStep] = useState("email");
  const [form, setForm] = useState({ email: "", otp: "", password: "" });
  const navigate = useNavigate();
  const submit = async (event) => {
    event.preventDefault();
    try {
      if (step === "email") {
        const data = await unwrap(api.post("/auth/forgot-password", { email: form.email }));
        toast.success(data.devOtp ? `OTP: ${data.devOtp}` : "OTP sent");
        setStep("otp");
      } else if (step === "otp") {
        await unwrap(api.post("/auth/verify-otp", { email: form.email, otp: form.otp }));
        setStep("reset");
      } else {
        await unwrap(api.post("/auth/reset-password", form));
        toast.success("Password reset");
        navigate("/login");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Request failed");
    }
  };
  return (
    <main className="section grid min-h-[70vh] place-items-center py-10">
      <form onSubmit={submit} className="w-full max-w-md rounded-lg border border-stone-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-2xl font-black">Forgot Password</h1>
        <div className="mt-5 grid gap-3">
          <input className="input" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          {step !== "email" && <input className="input" placeholder="OTP" value={form.otp} onChange={(e) => setForm({ ...form, otp: e.target.value })} required />}
          {step === "reset" && <input className="input" type="password" placeholder="New password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />}
          <button className="btn-primary">{step === "email" ? "Send OTP" : step === "otp" ? "Verify OTP" : "Reset Password"}</button>
        </div>
      </form>
    </main>
  );
}
