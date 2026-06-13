import { Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="mt-16 bg-ink text-white dark:bg-black">
      <div className="section grid gap-8 py-10 md:grid-cols-4">
        <div>
          <h3 className="text-xl font-black">Bartan<span className="text-gold">Bazaar</span></h3>
          <p className="mt-3 text-sm text-slate-300">Premium utensils, crockery, cookware, and gifting sets for modern Indian homes.</p>
        </div>
        <div>
          <h4 className="font-bold">Shop</h4>
          <div className="mt-3 grid gap-2 text-sm text-slate-300">
            <Link to="/shop">All Products</Link>
            <Link to="/wishlist">Wishlist</Link>
            <Link to="/orders">My Orders</Link>
          </div>
        </div>
        <div>
          <h4 className="font-bold">Support</h4>
          <div className="mt-3 grid gap-2 text-sm text-slate-300">
            <Link to="/faq">FAQ</Link>
            <Link to="/returns">Return & Refund Policy</Link>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms & Conditions</Link>
          </div>
        </div>
        <div>
          <h4 className="font-bold">Contact</h4>
          <div className="mt-3 grid gap-2 text-sm text-slate-300">
            <span className="flex gap-2"><MapPin size={16} /> Jaipur, Rajasthan</span>
            <span className="flex gap-2"><Phone size={16} /> +91 98765 43210</span>
            <span className="flex gap-2"><Mail size={16} /> hello@bartanbazaar.in</span>
          </div>
          <div className="mt-4 flex gap-3"><Instagram size={18} /><Facebook size={18} /></div>
        </div>
      </div>
    </footer>
  );
}
