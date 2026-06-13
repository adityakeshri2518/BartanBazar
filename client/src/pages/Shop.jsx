import { Grid2X2, List } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { categories, mockProducts } from "../data/mockData";
import { api, unwrap } from "../services/api";

const brands = ["Prestige", "Borosil", "Cello", "Hawkins", "Milton", "BartanBazaar Select"];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState(mockProducts);
  const [view, setView] = useState("grid");
  const [sort, setSort] = useState(searchParams.get("sort") || "newest");
  const [price, setPrice] = useState([0, 8000]);

  useEffect(() => {
    unwrap(api.get(`/products?${searchParams.toString()}&sort=${sort}&minPrice=${price[0]}&maxPrice=${price[1]}`))
      .then((data) => setProducts(data.products))
      .catch(() => {});
  }, [searchParams, sort, price]);

  const filtered = useMemo(() => {
    const search = searchParams.get("search")?.toLowerCase() || "";
    const category = searchParams.get("category");
    const brand = searchParams.get("brand");
    return products
      .filter((product) => !category || product.categoryName === category)
      .filter((product) => !brand || product.brand === brand)
      .filter((product) => {
        if (!search) return true;
        return [product.name, product.brand, product.categoryName, product.description, ...(product.tags || [])]
          .join(" ")
          .toLowerCase()
          .includes(search);
      })
      .filter((product) => product.price >= price[0] && product.price <= price[1])
      .sort((a, b) => (sort === "price_low" ? a.price - b.price : sort === "price_high" ? b.price - a.price : sort === "rating" ? b.rating - a.rating : b.sold - a.sold));
  }, [products, searchParams, sort, price]);

  const setFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    value ? next.set(key, value) : next.delete(key);
    setSearchParams(next);
  };

  const searchMode = searchParams.get("mode");
  const activeBrand = searchParams.get("brand");

  return (
    <main className="section py-6">
      <div className="premium-card mb-5 flex flex-wrap items-center justify-between gap-3 p-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold">Collection</p>
          <h1 className="text-2xl font-black">Kitchenware Store</h1>
          <p className="text-sm text-stone-500">
            {filtered.length} curated products
            {activeBrand ? ` from ${activeBrand}` : ""}
            {searchMode === "voice" ? " - voice search" : searchMode === "image" ? " - image search" : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary px-3" onClick={() => setView("grid")}><Grid2X2 size={17} /></button>
          <button className="btn-secondary px-3" onClick={() => setView("list")}><List size={17} /></button>
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
        <aside className="premium-card h-max p-5">
          <h2 className="border-b border-stone-100 pb-3 font-black uppercase tracking-wide">Filters</h2>
          <div className="mt-4">
            <p className="mb-2 text-sm font-bold">Category</p>
            <button onClick={() => setFilter("category", "")} className="mb-1 block text-sm font-semibold text-stone-600 hover:text-gold dark:text-slate-300">All categories</button>
            {categories.map((category) => (
              <button key={category} onClick={() => setFilter("category", category)} className="mb-1 block text-left text-sm hover:text-gold">{category}</button>
            ))}
          </div>
          <div className="mt-5 border-t border-stone-100 pt-5">
            <p className="mb-2 text-sm font-bold">Brand</p>
            <button onClick={() => setFilter("brand", "")} className="mb-1 block text-sm font-semibold text-stone-600 hover:text-gold dark:text-slate-300">All brands</button>
            {brands.map((brand) => (
              <button key={brand} onClick={() => setFilter("brand", brand)} className="mb-1 block text-left text-sm hover:text-gold">{brand}</button>
            ))}
          </div>
          <div className="mt-5">
            <p className="mb-2 text-sm font-bold">Max price: Rs. {price[1]}</p>
            <input type="range" min="500" max="8000" step="100" value={price[1]} onChange={(event) => setPrice([0, Number(event.target.value)])} className="w-full accent-[#b9945b]" />
          </div>
          <div className="mt-5">
            <p className="mb-2 text-sm font-bold">Sort</p>
            <select className="input" value={sort} onChange={(event) => setSort(event.target.value)}>
              <option value="popularity">Popularity</option>
              <option value="rating">Rating</option>
              <option value="price_low">Price low to high</option>
              <option value="price_high">Price high to low</option>
              <option value="newest">Newest</option>
            </select>
          </div>
        </aside>
        <section>
          <div className={view === "grid" ? "grid gap-4 sm:grid-cols-2 xl:grid-cols-3" : "grid gap-3"}>
            {filtered.map((product) => <ProductCard key={product._id} product={product} view={view} />)}
          </div>
        </section>
      </div>
    </main>
  );
}
