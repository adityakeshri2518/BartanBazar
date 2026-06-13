import { Camera, CookingPot, Heart, Menu, Mic, MicOff, Moon, PackageCheck, Search, Settings, ShoppingCart, Sun, Upload, User, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useShop } from "../context/ShopContext";

const navItems = [
  ["Shop", "/shop"],
  ["Reels", "/reels"],
  ["About", "/about"],
  ["Contact", "/contact"]
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [listening, setListening] = useState(false);
  const [imageSearch, setImageSearch] = useState(null);
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();
  const { cart, wishlist, theme, dispatch } = useShop();

  const submit = (event) => {
    event.preventDefault();
    if (q.trim()) navigate(`/shop?search=${encodeURIComponent(q.trim())}`);
    else navigate("/shop");
    setOpen(false);
  };

  const startVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice search is not supported in this browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript || "";
      setQ(transcript);
      if (transcript) navigate(`/shop?search=${encodeURIComponent(transcript)}&mode=voice`);
    };
    recognition.start();
  };

  const inferImageKeyword = (fileName) => {
    const name = fileName.toLowerCase().replaceAll("_", " ").replaceAll("-", " ");
    const imageHints = [
      [["dinner", "plate", "thali", "bowl", "serve", "serving"], "Dinner Sets"],
      [["crockery", "ceramic", "cup", "mug", "saucer"], "Crockery Sets"],
      [["glass", "tumbler", "jar", "drink"], "Glassware"],
      [["steel", "stainless", "kadhai", "spoon", "utensil"], "Steel Utensils"],
      [["copper", "tambaa"], "Copper Utensils"],
      [["brass", "pital"], "Brass Utensils"],
      [["non stick", "nonstick", "pan", "tawa", "cookware"], "Non-Stick Cookware"],
      [["tool", "knife", "peeler", "ladle", "whisk"], "Kitchen Tools"],
      [["storage", "container", "box"], "Storage Containers"],
      [["bottle", "flask", "water"], "Water Bottles"],
      [["tiffin", "lunch"], "Tiffin Boxes"],
      [["gift", "hamper", "wedding"], "Gift Sets"]
    ];
    return imageHints.find(([words]) => words.some((word) => name.includes(word)))?.[1] || "Crockery Sets";
  };

  const uploadImageSearch = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const keyword = inferImageKeyword(file.name);
    setImageSearch({ preview: URL.createObjectURL(file), keyword });
    navigate(`/shop?search=${encodeURIComponent(keyword)}&category=${encodeURIComponent(keyword)}&mode=image`);
    setOpen(false);
    event.target.value = "";
  };

  return (
    <header className="sticky top-0 z-40 border-b border-gold/20 bg-porcelain/90 text-premium shadow-[0_10px_30px_rgba(36,52,47,0.08)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/95 dark:text-white">
      <div className="section flex items-center gap-4 py-3">
        <button className="grid h-10 w-10 place-items-center border border-stone-200 bg-white dark:border-slate-700 dark:bg-slate-900 md:hidden" onClick={() => setOpen((value) => !value)} aria-label="Toggle navigation">
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
        <Brand />
        <nav className="hidden items-center gap-6 text-sm font-bold lg:flex">
          {navItems.map(([label, href]) => (
            <NavLink key={href} to={href} className={({ isActive }) => (isActive ? "text-gold" : "text-premium/80 hover:text-premium dark:text-slate-200")}>
              {label}
            </NavLink>
          ))}
          {isAdmin && <NavLink to="/admin" className="text-gold">Admin</NavLink>}
        </nav>
        <div className="hidden min-w-[280px] flex-1 md:block">
          <SearchBox q={q} setQ={setQ} submit={submit} listening={listening} startVoiceSearch={startVoiceSearch} uploadImageSearch={uploadImageSearch} />
        </div>
        <div className="ml-auto flex items-center gap-2">
          <IconAction onClick={() => dispatch({ type: "THEME", theme: theme === "dark" ? "light" : "dark" })} label="Toggle theme">
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </IconAction>
          <IconLink to="/wishlist" count={wishlist.length} label="Wishlist"><Heart size={18} /></IconLink>
          <IconLink to="/cart" count={cart.items.length} label="Cart"><ShoppingCart size={18} /></IconLink>
          {user ? (
            <>
              <Link className="hidden items-center gap-2 border border-stone-200 bg-white px-3 py-2.5 text-sm font-bold text-premium transition hover:border-gold hover:text-gold md:inline-flex" to="/orders">
                <PackageCheck size={16} /> Orders
              </Link>
              <Link className="hidden items-center gap-2 bg-premium px-3 py-2.5 text-sm font-bold text-white md:inline-flex" to="/profile">
                <Settings size={16} /> Settings
              </Link>
              <button className="hidden items-center gap-2 border border-stone-200 bg-white px-3 py-2.5 text-sm font-bold text-premium lg:inline-flex" onClick={logout}>
                <User size={16} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link className="hidden border border-stone-300 bg-white px-4 py-2.5 text-sm font-black text-premium transition hover:border-gold hover:text-gold md:inline-flex" to="/login">
                Login
              </Link>
              <Link className="hidden bg-premium px-4 py-2.5 text-sm font-black text-white transition hover:bg-[#17231f] md:inline-flex" to="/signup">
                Signup
              </Link>
            </>
          )}
        </div>
      </div>

      {open && (
        <div className="section space-y-4 pb-4 md:hidden">
          <SearchBox q={q} setQ={setQ} submit={submit} listening={listening} startVoiceSearch={startVoiceSearch} uploadImageSearch={uploadImageSearch} mobile />
          <nav className="grid gap-2 border-t border-stone-200 pt-3 text-sm font-bold">
            {navItems.map(([label, href]) => (
              <Link key={href} to={href} onClick={() => setOpen(false)} className="py-2">
                {label}
              </Link>
            ))}
            {isAdmin && <Link to="/admin" onClick={() => setOpen(false)} className="py-2 text-gold">Admin</Link>}
            {user ? (
              <>
                <Link to="/orders" onClick={() => setOpen(false)} className="py-2">My Orders</Link>
                <Link to="/profile" onClick={() => setOpen(false)} className="py-2">Profile Settings</Link>
                <button onClick={logout} className="py-2 text-left">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)} className="py-2">Login</Link>
                <Link to="/signup" onClick={() => setOpen(false)} className="py-2">Signup</Link>
              </>
            )}
          </nav>
        </div>
      )}

      {imageSearch && (
        <div className="section pb-3">
          <div className="ml-auto flex max-w-xl items-center justify-between gap-3 border border-gold/30 bg-white px-3 py-2 text-sm shadow-sm dark:bg-slate-900">
            <div className="flex min-w-0 items-center gap-3">
              <img src={imageSearch.preview} alt="Uploaded search" className="h-10 w-10 object-cover" />
              <span className="truncate text-premium dark:text-white">
                Image search: showing results for <b>{imageSearch.keyword}</b>
              </span>
            </div>
            <button onClick={() => setImageSearch(null)} className="text-stone-500 hover:text-gold" aria-label="Clear image search">
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

function Brand({ compact = false }) {
  return (
    <Link to="/" className="flex min-w-max items-center gap-3 leading-none">
      <span className="grid h-11 w-11 place-items-center rounded-sm border border-gold/40 bg-premium text-gold shadow-[0_10px_24px_rgba(36,52,47,0.18)]">
        <CookingPot size={24} strokeWidth={2.2} />
      </span>
      <span>
        <span className={`${compact ? "text-lg" : "text-2xl"} block font-black tracking-tight text-premium dark:text-white`}>
          BartanBazaar
        </span>
        <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-gold">Kitchenware Atelier</span>
      </span>
    </Link>
  );
}

function SearchBox({ q, setQ, submit, listening, startVoiceSearch, uploadImageSearch, mobile = false }) {
  return (
    <form onSubmit={submit} className={`flex h-12 items-center border border-stone-200 bg-white/90 px-3 shadow-[0_10px_28px_rgba(36,52,47,0.06)] backdrop-blur dark:border-slate-700 dark:bg-slate-900 ${mobile ? "w-full" : "w-full"}`}>
      <Search size={18} className="text-stone-400" />
      <input
        value={q}
        onChange={(event) => setQ(event.target.value)}
        placeholder="Search crockery, cookware, glassware..."
        className="w-full bg-transparent px-3 py-2 text-sm font-medium text-premium outline-none dark:text-white"
      />
      <button type="button" onClick={startVoiceSearch} className="grid h-8 w-8 place-items-center text-stone-500 transition hover:text-gold" aria-label="Voice search">
        {listening ? <MicOff size={17} /> : <Mic size={17} />}
      </button>
      <label className="grid h-8 w-8 cursor-pointer place-items-center text-stone-500 transition hover:text-gold" aria-label="Search by image">
        {mobile ? <Upload size={17} /> : <Camera size={17} />}
        <input type="file" accept="image/*" className="hidden" onChange={uploadImageSearch} />
      </label>
    </form>
  );
}

function IconAction({ children, onClick, label }) {
  return (
    <button type="button" onClick={onClick} className="grid h-10 w-10 place-items-center border border-stone-200 bg-white/90 text-premium shadow-sm transition hover:border-gold hover:text-gold dark:border-slate-700 dark:bg-slate-900 dark:text-white" aria-label={label}>
      {children}
    </button>
  );
}

function IconLink({ children, to, count, label }) {
  return (
    <Link className="relative grid h-10 w-10 place-items-center border border-stone-200 bg-white/90 text-premium shadow-sm transition hover:border-gold hover:text-gold dark:border-slate-700 dark:bg-slate-900 dark:text-white" to={to} aria-label={label}>
      {children}
      {count > 0 && <span className="absolute -right-1 -top-1 rounded-full bg-gold px-1.5 text-xs font-black text-white">{count}</span>}
    </Link>
  );
}
