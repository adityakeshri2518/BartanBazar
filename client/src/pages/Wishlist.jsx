import ProductCard from "../components/ProductCard";
import { useShop } from "../context/ShopContext";

export default function Wishlist() {
  const { wishlist } = useShop();
  return (
    <main className="section py-8">
      <h1 className="text-3xl font-black">Wishlist</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {wishlist.length ? wishlist.map((product) => <ProductCard key={product._id} product={product} />) : <p>No saved products yet.</p>}
      </div>
    </main>
  );
}
