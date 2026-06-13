import { useState } from "react";
import { toast } from "react-toastify";
import { sendContactEmail } from "../services/email";
import { api, unwrap } from "../services/api";

export function About() {
  return <Info title="About BartanBazaar" body="BartanBazaar is an Indian kitchenware marketplace focused on trusted utensils, crockery, cookware, glassware, bottles, tiffins, and gifting sets for homes, restaurants, and festive occasions." />;
}

export function Contact() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [sending, setSending] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    try {
      setSending(true);
      await sendContactEmail(form);
      await unwrap(api.post("/contact", form));
      toast.success("Message sent. We will reply soon.");
      setForm({ name: "", email: "", phone: "", message: "" });
    } catch (error) {
      toast.error(error.message || error.response?.data?.message || "Could not send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="section py-8">
      <h1 className="text-3xl font-black">Contact Us</h1>
      <form onSubmit={submit} className="mt-6 grid max-w-2xl gap-3 rounded-lg border border-stone-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <input className="input" placeholder="Name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
        <input className="input" type="email" placeholder="Email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
        <input className="input" placeholder="Phone optional" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
        <textarea className="input min-h-32" placeholder="Message" value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} required />
        <button className="btn-primary w-max" disabled={sending}>{sending ? "Sending..." : "Send Message"}</button>
      </form>
    </main>
  );
}

export function FAQ() {
  return <Info title="FAQ" body="We support secure login, wishlist, cart, Razorpay checkout, order tracking, invoices, cancellation before shipping, and responsive shopping across mobile, tablet, and desktop." />;
}

export function Returns() {
  return <Info title="Return & Refund Policy" body="Eligible products can be returned within 7 days if unused and in original packaging. Refunds are processed to the original payment mode after quality inspection." />;
}

export function Privacy() {
  return <Info title="Privacy Policy" body="We collect account, address, order, and payment metadata only to operate the marketplace, prevent fraud, and improve recommendations. Payment details are handled by Razorpay." />;
}

export function Terms() {
  return <Info title="Terms & Conditions" body="By using BartanBazaar, customers agree to accurate account information, lawful purchases, product availability rules, payment gateway terms, and marketplace policies." />;
}

function Info({ title, body }) {
  return (
    <main className="section py-8">
      <div className="max-w-3xl rounded-lg border border-stone-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-3xl font-black">{title}</h1>
        <p className="mt-4 leading-7 text-stone-700 dark:text-slate-300">{body}</p>
      </div>
    </main>
  );
}
