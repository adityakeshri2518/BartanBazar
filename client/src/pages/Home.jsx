import { motion } from "framer-motion";
import { ArrowRight, Gift, Quote, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import ProductRail from "../components/ProductRail";
import { categories, mockProducts } from "../data/mockData";
import { sendNewsletterEmail } from "../services/email";
import { api, unwrap } from "../services/api";

const heroSlides = [
  {
    eyebrow: "The Dining Edit",
    title: "Crockery that makes everyday meals feel considered.",
    copy: "Curated dinner sets, glassware, serveware, and timeless table pieces for Indian homes.",
    image: "https://images.unsplash.com/photo-1603199506016-b9a594b593c0?auto=format&fit=crop&w=1400&q=85"
  },
  {
    eyebrow: "Crafted Metals",
    title: "Steel, copper, and brass essentials with a premium finish.",
    copy: "Durable utensils and cookware selected for daily cooking, hosting, and festive gifting.",
    image: "https://images.unsplash.com/photo-1584990347449-a7012f95c6d3?auto=format&fit=crop&w=1400&q=85"
  },
  {
    eyebrow: "Kitchen Tools",
    title: "A quieter, smarter kitchen starts with better tools.",
    copy: "Storage, bottles, tiffins, cookware, and accessories designed for repeated use.",
    image: "https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=1400&q=85"
  }
];

const editorialCollections = [
  {
    title: "Table Setting",
    text: "Dinner sets, serving bowls, glassware, and pieces for hosting.",
    image: "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=900&q=80",
    category: "Dinner Sets"
  },
  {
    title: "Everyday Cooking",
    text: "Reliable cookware and utensils for the rhythm of daily kitchens.",
    image: "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=900&q=80",
    category: "Steel Utensils"
  },
  {
    title: "Thoughtful Gifting",
    text: "Elegant sets for weddings, housewarmings, and festive moments.",
    image: "https://images.unsplash.com/photo-1514986888952-8cd320577b68?auto=format&fit=crop&w=900&q=80",
    category: "Gift Sets"
  }
];

const materialGuide = [
  ["Steel", "Daily durability, easy care, and a clean modern finish."],
  ["Copper", "A traditional glow for serveware and statement kitchen pieces."],
  ["Brass", "Warm, festive character for rituals, gifting, and display."],
  ["Glass", "Light-reflecting elegance for dining tables and drinkware."]
];

const under499Fallback = mockProducts.slice(0, 8).map((product, index) => ({
  ...product,
  _id: `under-499-${product._id}`,
  name: ["Steel Spoon Set", "Glass Tumbler Pair", "Storage Jar Combo", "Kitchen Peeler Kit", "Compact Tiffin Box", "Serving Bowl", "Bottle Brush Set", "Snack Plate Set"][index] || product.name,
  slug: `under-499-${product.slug}`,
  price: [249, 299, 349, 199, 449, 399, 149, 329][index] || 399,
  mrp: [399, 499, 599, 299, 699, 599, 249, 499][index] || 599
}));

export default function Home() {
  const [slide, setSlide] = useState(0);
  const [featured, setFeatured] = useState({
    trending: mockProducts.filter((p) => p.isTrending),
    bestSelling: mockProducts.filter((p) => p.isBestSeller),
    newArrivals: mockProducts.filter((p) => p.isNewArrival),
    deals: mockProducts.filter((p) => p.dealEndsAt)
  });
  const [under499, setUnder499] = useState(under499Fallback);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterBusy, setNewsletterBusy] = useState(false);

  useEffect(() => {
    unwrap(api.get("/products/featured")).then(setFeatured).catch(() => {});
    unwrap(api.get("/products?maxPrice=499&limit=8&sort=price_low"))
      .then((data) => setUnder499(data.products?.length ? data.products : under499Fallback))
      .catch(() => setUnder499(under499Fallback));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setSlide((value) => (value + 1) % heroSlides.length), 4500);
    return () => clearInterval(timer);
  }, []);

  const active = heroSlides[slide];

  const subscribe = async (event) => {
    event.preventDefault();
    try {
      setNewsletterBusy(true);
      await sendNewsletterEmail(newsletterEmail);
      await unwrap(api.post("/newsletter", { email: newsletterEmail }));
      toast.success("Subscribed to BartanBazaar updates");
      setNewsletterEmail("");
    } catch (error) {
      toast.error(error.message || error.response?.data?.message || "Subscription failed");
    } finally {
      setNewsletterBusy(false);
    }
  };

  return (
    <>
      <section className="relative overflow-hidden bg-premium text-white">
        <div className="absolute inset-0">
          {heroSlides.map((item, index) => (
            <img
              key={item.title}
              src={item.image}
              alt={item.eyebrow}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${index === slide ? "opacity-55" : "opacity-0"}`}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-r from-premium via-premium/80 to-premium/20" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-premiumSoft to-transparent" />
        </div>

        <div className="section relative grid min-h-[610px] items-center gap-10 py-14 lg:grid-cols-[1fr_420px]">
          <motion.div key={active.title} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
            <p className="mb-5 inline-flex border border-gold/40 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.28em] text-gold backdrop-blur">{active.eyebrow}</p>
            <h1 className="max-w-3xl text-4xl font-black leading-tight md:text-6xl">{active.title}</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-stone-100">{active.copy}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/shop" className="btn-primary bg-white text-premium hover:bg-stone-100">
                Explore Collection <ArrowRight size={18} />
              </Link>
              <Link to="/reels" className="inline-flex items-center rounded-sm border border-white/50 px-5 py-3 text-sm font-bold text-white transition hover:border-gold hover:text-gold">
                Watch Product Stories
              </Link>
            </div>
            <div className="mt-8 flex gap-2">
              {heroSlides.map((item, index) => (
                <button
                  key={item.eyebrow}
                  onClick={() => setSlide(index)}
                  className={`h-1.5 rounded-full transition-all ${index === slide ? "w-12 bg-gold" : "w-6 bg-white/40"}`}
                  aria-label={`Show ${item.eyebrow}`}
                />
              ))}
            </div>
          </motion.div>

          <div className="hidden border border-white/20 bg-white/10 p-6 shadow-[0_30px_90px_rgba(0,0,0,0.24)] backdrop-blur-xl md:block">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold">BartanBazaar Promise</p>
            <div className="mt-5 grid gap-4">
              {[
                [ShieldCheck, "Quality checked products"],
                [Truck, "Reliable delivery across India"],
                [Sparkles, "Collections curated for Indian homes"]
              ].map(([Icon, text]) => (
                <div key={text} className="flex items-center gap-3 border-b border-white/10 pb-4 last:border-b-0 last:pb-0">
                  <Icon size={20} className="text-gold" />
                  <span className="font-semibold">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section mt-8 grid gap-4 lg:grid-cols-[1fr_1fr]">
        <Link to="/signup" className="group overflow-hidden bg-premium p-6 text-white shadow-[0_20px_60px_rgba(36,52,47,0.16)]">
          <div className="flex items-start gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center border border-gold/40 bg-white/10 text-gold">
              <Gift size={24} />
            </span>
            <div>
              <p className="premium-kicker">First customer offer</p>
              <h2 className="mt-2 text-2xl font-black">Get 100 welcome redeem points on your first purchase.</h2>
              <p className="mt-2 text-sm leading-6 text-stone-200">Create an account, shop premium kitchenware, and use points during checkout.</p>
            </div>
          </div>
        </Link>
        <Link to="/shop" className="group overflow-hidden border border-gold/30 bg-white p-6 shadow-[0_20px_60px_rgba(36,52,47,0.08)] dark:bg-slate-900">
          <div className="flex items-start gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center border border-gold/40 bg-gold/10 text-gold">
              <Truck size={24} />
            </span>
            <div>
              <p className="premium-kicker">Delivery benefit</p>
              <h2 className="mt-2 text-2xl font-black">Rs. 79 delivery below Rs. 999, free delivery above Rs. 999.</h2>
              <p className="mt-2 text-sm leading-6 text-stone-600 dark:text-slate-300">Cash on Delivery is available when your cart value is above Rs. 499.</p>
            </div>
          </div>
        </Link>
      </section>

      <section className="section mt-12">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="premium-kicker">Browse</p>
            <h2 className="text-2xl font-black">Shop by Material & Use</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((category) => (
            <Link
              key={category}
              to={`/shop?category=${encodeURIComponent(category)}`}
              className="premium-card p-5 text-center text-sm font-bold transition duration-300 hover:-translate-y-1 hover:text-gold"
            >
              {category}
            </Link>
          ))}
        </div>
      </section>

      <section className="section mt-14">
        <div className="mb-5 max-w-2xl">
          <p className="premium-kicker">Editorial collections</p>
          <h2 className="mt-2 text-3xl font-black">Shop by the way your home lives.</h2>
          <p className="mt-3 text-stone-600">A quieter way to discover pieces for cooking, serving, dining, and gifting.</p>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          {editorialCollections.map((item) => (
            <Link
              key={item.title}
              to={`/shop?category=${encodeURIComponent(item.category)}`}
              className="group relative min-h-[360px] overflow-hidden bg-premium text-white shadow-[0_24px_70px_rgba(36,52,47,0.18)]"
            >
              <img src={item.image} alt={item.title} className="absolute inset-0 h-full w-full object-cover opacity-70 transition duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-premium via-premium/40 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">{item.category}</p>
                <h3 className="mt-2 text-2xl font-black">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-stone-100">{item.text}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="section mt-14 grid gap-8 border-y border-gold/20 bg-white/40 py-10 backdrop-blur lg:grid-cols-[0.75fr_1fr]">
        <div>
          <p className="premium-kicker">Material guide</p>
          <h2 className="mt-2 text-3xl font-black">Choose pieces by finish, care, and occasion.</h2>
          <p className="mt-4 leading-7 text-stone-600">
            Every material has its own character. BartanBazaar groups essentials so new buyers can choose confidently.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {materialGuide.map(([title, text]) => (
            <div key={title} className="premium-card p-5">
              <h3 className="text-lg font-black">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-stone-600 dark:text-slate-300">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <ProductRail eyebrow="Curated selection" title="Trending Now" products={featured.trending} />
      <ProductRail eyebrow="Budget picks" title="Products Under Rs. 499" products={under499} />
      <ProductRail eyebrow="Customer favourites" title="Best Sellers" products={featured.bestSelling} />
      <ProductRail eyebrow="Fresh arrivals" title="New In Store" products={featured.newArrivals} />

      <section className="section mt-12 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <div className="bg-premium p-8 text-white shadow-[0_24px_70px_rgba(36,52,47,0.18)]">
          <p className="premium-kicker">Featured brands</p>
          <h2 className="mt-2 text-3xl font-black">Trusted names for daily kitchens and hosting.</h2>
          <div className="mt-6 flex flex-wrap gap-3">
            {["Prestige", "Borosil", "Cello", "Hawkins", "Milton", "BartanBazaar Select"].map((brand) => (
              <Link
                key={brand}
                to={`/shop?brand=${encodeURIComponent(brand)}`}
                className="border border-white/20 px-4 py-2 text-sm font-bold text-stone-100 transition hover:border-gold hover:text-gold"
              >
                {brand}
              </Link>
            ))}
          </div>
        </div>
        <div className="premium-card p-8">
          <p className="premium-kicker">Newsletter</p>
          <h2 className="mt-2 text-2xl font-black">Receive curated kitchenware notes.</h2>
          <p className="mt-2 text-stone-600 dark:text-slate-300">New collections, care guides, and seasonal table inspiration.</p>
          <form onSubmit={subscribe} className="mt-5 flex gap-2">
            <input className="input" type="email" placeholder="Email address" value={newsletterEmail} onChange={(event) => setNewsletterEmail(event.target.value)} required />
            <button className="btn-primary" disabled={newsletterBusy}>{newsletterBusy ? "Sending" : "Subscribe"}</button>
          </form>
        </div>
      </section>

      <section className="section mt-12">
        <div className="premium-card grid gap-6 p-8 lg:grid-cols-[0.45fr_1fr]">
          <div>
            <p className="premium-kicker">Customer notes</p>
            <h2 className="mt-2 text-3xl font-black">Trusted for daily kitchens.</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              ["The dinner set quality felt premium, and the packaging was careful.", "Ritika S."],
              ["Good finish on the steel utensils. Looks elegant without being flashy.", "Aman V."]
            ].map(([text, name]) => (
              <div key={name} className="border border-gold/20 bg-premiumSoft/60 p-5 dark:border-slate-800">
                <Quote className="text-gold" size={22} />
                <p className="mt-4 leading-7 text-stone-700 dark:text-slate-300">{text}</p>
                <p className="mt-4 text-sm font-black text-premium dark:text-white">{name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
