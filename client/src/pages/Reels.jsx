import { Bookmark, Heart, Send, ShoppingBag, Sparkles, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { mockReels } from "../data/mockData";
import { api, unwrap } from "../services/api";

export default function Reels() {
  const [reels, setReels] = useState(mockReels);
  const [liked, setLiked] = useState({});
  const [saved, setSaved] = useState({});

  useEffect(() => {
    unwrap(api.get("/reels")).then((data) => setReels(data.reels)).catch(() => {});
  }, []);

  const featured = reels[0]?.product;

  return (
    <main className="bg-premium py-8 text-white">
      <div className="section">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-gold">Product stories</p>
            <h1 className="mt-2 text-3xl font-black md:text-4xl">BartanBazaar Reels</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-300">
              Watch crockery, cookware, and kitchen essentials in a closer, more natural setting.
            </p>
          </div>
          <Link to="/shop" className="hidden border border-white/20 px-4 py-2 text-sm font-bold text-stone-100 transition hover:border-gold hover:text-gold sm:inline-flex">
            Explore Store
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="mx-auto h-[78vh] w-full max-w-[430px] snap-y snap-mandatory overflow-y-auto rounded-[28px] border border-white/15 bg-black p-2 shadow-2xl scrollbar-hide">
            {reels.map((reel, index) => (
              <ReelCard
                key={reel._id}
                reel={reel}
                index={index}
                liked={liked[reel._id]}
                saved={saved[reel._id]}
                onLike={() => setLiked((state) => ({ ...state, [reel._id]: !state[reel._id] }))}
                onSave={() => setSaved((state) => ({ ...state, [reel._id]: !state[reel._id] }))}
              />
            ))}
          </div>

          <aside className="hidden h-max border border-white/10 bg-white/5 p-5 backdrop-blur lg:block">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold">Featured from reels</p>
            {featured && (
              <div className="mt-5">
                <img src={featured.images?.[0]?.url} alt={featured.name} className="aspect-square w-full object-cover" />
                <p className="mt-4 text-xs font-bold uppercase tracking-[0.16em] text-gold">{featured.brand}</p>
                <h2 className="mt-1 text-xl font-black">{featured.name}</h2>
                <p className="mt-2 text-sm leading-6 text-stone-300">{featured.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-2xl font-black">Rs. {featured.price}</span>
                  <span className="flex items-center gap-1 bg-white/10 px-2 py-1 text-sm font-bold">
                    <Star size={14} fill="currentColor" /> {Number(featured.rating).toFixed(1)}
                  </span>
                </div>
                <Link to={`/product/${featured.slug}`} className="btn-primary mt-5 w-full bg-white text-premium hover:bg-stone-100">
                  View Product
                </Link>
              </div>
            )}
            <div className="mt-6 border-t border-white/10 pt-5">
              <h3 className="flex items-center gap-2 font-black"><Sparkles size={18} className="text-gold" /> Viewing Tip</h3>
              <p className="mt-2 text-sm leading-6 text-stone-300">
                Scroll vertically to move through product stories. Tap a product card to open full details.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function ReelCard({ reel, index, liked, saved, onLike, onSave }) {
  const product = reel.product;

  return (
    <section className="relative mb-2 h-[calc(78vh-16px)] snap-start overflow-hidden rounded-[22px] bg-slate-950">
      <video
        src={reel.videoUrl}
        poster={reel.thumbnail}
        className="h-full w-full object-cover"
        controls
        loop
        muted
        playsInline
        preload={index === 0 ? "auto" : "metadata"}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/20" />

      <div className="absolute left-4 top-4 rounded-full bg-black/45 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-gold backdrop-blur">
        Story {index + 1}
      </div>

      <div className="absolute right-3 top-1/2 grid -translate-y-1/2 gap-3">
        <ActionButton active={liked} onClick={onLike} label={liked ? "Liked" : "Like"}>
          <Heart size={20} fill={liked ? "currentColor" : "none"} />
        </ActionButton>
        <ActionButton active={saved} onClick={onSave} label={saved ? "Saved" : "Save"}>
          <Bookmark size={20} fill={saved ? "currentColor" : "none"} />
        </ActionButton>
        <ActionButton label="Share">
          <Send size={20} />
        </ActionButton>
      </div>

      <div className="absolute inset-x-0 bottom-0 p-4 pr-16 text-white">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">{product?.brand || "BartanBazaar"}</p>
        <h2 className="mt-1 text-xl font-black">{reel.title}</h2>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-stone-200">
          {product?.description || "Premium kitchenware selected for Indian homes."}
        </p>

        {product && (
          <Link
            to={`/product/${product.slug}`}
            className="mt-4 grid grid-cols-[64px_1fr_auto] items-center gap-3 rounded-sm border border-white/15 bg-white/95 p-2 text-premium shadow-xl"
          >
            <img src={product.images?.[0]?.url} alt={product.name} className="h-16 w-16 object-cover" />
            <div className="min-w-0">
              <p className="truncate text-sm font-black">{product.name}</p>
              <p className="mt-1 text-xs text-stone-500">Rs. {product.price}</p>
            </div>
            <span className="grid h-10 w-10 place-items-center bg-premium text-white">
              <ShoppingBag size={17} />
            </span>
          </Link>
        )}
      </div>
    </section>
  );
}

function ActionButton({ children, active, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`grid h-12 w-12 place-items-center rounded-full border backdrop-blur transition ${
        active ? "border-gold bg-gold text-premium" : "border-white/15 bg-black/45 text-white hover:border-gold hover:text-gold"
      }`}
      aria-label={label}
    >
      {children}
    </button>
  );
}
