import ProductCard from "./ProductCard";

export default function ProductRail({ eyebrow = "Selection", title, products }) {
  if (!products?.length) return null;
  return (
    <section className="section mt-12">
      <div className="mb-5 flex items-end justify-between">
        <div>
          <p className="premium-kicker">{eyebrow}</p>
          <h2 className="text-2xl font-black md:text-3xl">{title}</h2>
        </div>
        <span className="hidden border border-gold/50 bg-white/60 px-4 py-2 text-sm font-bold text-premium shadow-sm backdrop-blur sm:inline-flex">View all</span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {products.slice(0, 8).map((product) => <ProductCard key={product._id} product={product} />)}
      </div>
    </section>
  );
}
