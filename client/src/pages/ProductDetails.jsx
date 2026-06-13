import { CreditCard, Heart, Star, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ProductRail from "../components/ProductRail";
import { mockProducts } from "../data/mockData";
import { useShop } from "../context/ShopContext";
import { api, unwrap } from "../services/api";

export default function ProductDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, dispatch } = useShop();
  const [data, setData] = useState(() => {
    const product = mockProducts.find((item) => item.slug === slug) || mockProducts[0];
    return { product, reviews: [], similar: mockProducts.filter((item) => item.categoryName === product.categoryName && item._id !== product._id) };
  });
  const [image, setImage] = useState(data.product.images?.[0]?.url);

  useEffect(() => {
    unwrap(api.get(`/products/${slug}`)).then((serverData) => {
      setData(serverData);
      setImage(serverData.product.images?.[0]?.url);
    }).catch(() => {});
  }, [slug]);

  useEffect(() => {
    dispatch({ type: "VIEWED", product: data.product });
  }, [data.product]);

  return (
    <main className="section py-8">
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1fr]">
        <div>
          <div className="overflow-hidden rounded-lg border border-stone-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <img src={image} alt={data.product.name} className="aspect-square w-full object-cover transition duration-300 hover:scale-110" />
          </div>
          <div className="mt-3 flex gap-3">
            {data.product.images?.map((item) => (
              <button key={item.url} onClick={() => setImage(item.url)} className="h-20 w-20 overflow-hidden rounded-md border border-stone-200">
                <img src={item.url} alt={item.alt} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-gold">{data.product.brand}</p>
          <h1 className="mt-2 text-3xl font-black md:text-4xl">{data.product.name}</h1>
          <div className="mt-3 flex items-center gap-2 text-sm">
            <span className="flex items-center gap-1 rounded bg-leaf px-2 py-1 font-bold text-white"><Star size={14} fill="currentColor" /> {Number(data.product.rating).toFixed(1)}</span>
            <span>{data.product.reviewsCount} ratings and reviews</span>
          </div>
          <p className="mt-5 text-stone-700 dark:text-slate-300">{data.product.description}</p>
          <div className="mt-5">
            <span className="text-3xl font-black">Rs. {data.product.price}</span>
            <span className="ml-3 text-lg text-stone-400 line-through">Rs. {data.product.mrp}</span>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button className="btn-primary" onClick={() => addToCart(data.product)}>Add to Cart</button>
            <button className="btn-secondary" onClick={() => { addToCart(data.product); navigate("/checkout"); }}><CreditCard size={18} /> Buy Now</button>
            <button className="btn-secondary" onClick={() => toggleWishlist(data.product)}><Heart size={18} /> Wishlist</button>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"><Truck className="mb-2 text-gold" /> Free delivery above Rs. 999</div>
            <div className="rounded-lg border border-stone-200 p-4 dark:border-slate-800">Easy 7-day return on eligible products</div>
          </div>
          <div className="mt-7">
            <h2 className="text-xl font-black">Specifications</h2>
            <div className="mt-3 grid gap-2 text-sm">
              {Object.entries(data.product.specifications || { Material: data.product.categoryName, Warranty: "1 year", Care: "Easy clean" }).map(([key, value]) => (
                <div key={key} className="grid grid-cols-2 rounded-md bg-stone-100 p-3 dark:bg-slate-900"><span className="font-bold">{key}</span><span>{value}</span></div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <section className="mt-12">
        <h2 className="text-2xl font-black">Reviews & ratings</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {(data.reviews.length ? data.reviews : [{ title: "Excellent finish", comment: "Solid build and premium look for the price.", rating: 5 }]).map((review, index) => (
            <div key={review._id || index} className="rounded-lg border border-stone-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <p className="font-bold">{review.title}</p>
              <p className="mt-2 text-sm text-stone-600 dark:text-slate-300">{review.comment}</p>
            </div>
          ))}
        </div>
      </section>
      <ProductRail title="Similar Products" products={data.similar} />
      <Link to="/shop" className="btn-secondary mt-8">Back to shop</Link>
    </main>
  );
}
