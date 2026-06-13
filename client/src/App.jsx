import { Route, Routes } from "react-router-dom";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import Preloader from "./components/Preloader";
import ProtectedRoute from "./components/ProtectedRoute";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";
import { ForgotPassword, Login, Signup } from "./pages/Auth";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import { About, Contact, FAQ, Privacy, Returns, Terms } from "./pages/ContentPages";
import Home from "./pages/Home";
import Orders from "./pages/Orders";
import ProductDetails from "./pages/ProductDetails";
import Profile from "./pages/Profile";
import Reels from "./pages/Reels";
import Shop from "./pages/Shop";
import Wishlist from "./pages/Wishlist";

import { useEffect, useState } from "react";

export default function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1700);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-premiumSoft text-premium dark:bg-slate-950 dark:text-white">
      {loading && <Preloader />}
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:slug" element={<ProductDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/reels" element={<Reels />} />
        <Route path="/admin" element={<ProtectedRoute admin><Admin /></ProtectedRoute>} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/returns" element={<Returns />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
      </Routes>
      <Footer />
    </div>
  );
}
