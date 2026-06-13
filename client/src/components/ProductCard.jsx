import { Heart, ShoppingBag, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useShop } from "../context/ShopContext";

export default function ProductCard({ product, view = "grid" }) {
  const { addToCart, toggleWishlist, wishlist } = useShop();
  const saved = wishlist.some((item) => item._id === product._id);
  const image = product.images?.[0]?.url;

  return (
    <article className={`premium-card group overflow-hidden transition duration-300 hover:-translate-y-1 ${view === "list" ? "grid grid-cols-[140px_1fr] md:grid-cols-[220px_1fr]" : ""}`}>
      <Link to={`/product/${product.slug}`} className="relative block overflow-hidden bg-gradient-to-br from-[#fbfaf7] via-[#f7f3ec] to-[#ece2d4] p-5 dark:bg-slate-950">
        <span className="absolute right-3 top-3 border border-gold/40 bg-white/80 px-2 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-gold backdrop-blur">Premium</span>
        <img src={image} alt={product.name} className={`mx-auto w-full object-contain transition duration-500 group-hover:scale-105 ${view === "list" ? "h-full min-h-44" : "aspect-square max-h-52"}`} />
      </Link>
      <div className="space-y-3 border-t border-stone-100 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold">{product.brand}</p>
            <Link to={`/product/${product.slug}`} className="mt-1 block min-h-11 text-sm font-semibold leading-5 text-premium hover:text-gold dark:text-white">
              {product.name}
            </Link>
          </div>
          <button onClick={() => toggleWishlist(product)} className={`rounded-full border bg-white/80 p-2 shadow-sm ${saved ? "border-gold text-gold" : "border-stone-200 text-stone-500 dark:border-slate-700"}`} aria-label="Save product">
            <Heart size={17} fill={saved ? "currentColor" : "none"} />
          </button>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="flex items-center gap-1 rounded-sm bg-premium px-2 py-0.5 text-xs font-bold text-white"><Star size={12} fill="currentColor" /> {Number(product.rating).toFixed(1)}</span>
          <span className="text-xs font-semibold text-stone-400">({product.reviewsCount})</span>
        </div>
        <p className="line-clamp-2 text-xs leading-5 text-stone-500 dark:text-slate-300">{product.description}</p>
        <div>
          <span className="text-lg font-black">Rs. {product.price}</span>
          <span className="ml-2 text-sm text-slate-400 line-through">Rs. {product.mrp}</span>
        </div>
        <div className="flex items-center justify-between gap-2 pt-1">
          <span className="text-xs font-bold text-stone-500">Quality checked</span>
          <button className="inline-flex items-center gap-1 rounded-sm bg-premium px-3 py-2 text-xs font-black text-white shadow-md transition hover:bg-[#17231f]" onClick={() => addToCart(product)}>
            <ShoppingBag size={15} /> Add
          </button>
        </div>
      </div>
    </article>
  );
}
