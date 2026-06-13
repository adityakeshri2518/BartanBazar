import { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import { toast } from "react-toastify";
import { api, unwrap } from "../services/api";

const ShopContext = createContext(null);

const initialState = {
  cart: { items: [] },
  summary: { subtotal: 0, discount: 0, shippingFee: 0, total: 0 },
  wishlist: [],
  recentlyViewed: JSON.parse(localStorage.getItem("bb_recent") || "[]"),
  theme: localStorage.getItem("bb_theme") || "light"
};

const reducer = (state, action) => {
  switch (action.type) {
    case "CART":
      return { ...state, cart: action.cart, summary: action.summary };
    case "WISHLIST":
      return { ...state, wishlist: action.products };
    case "VIEWED": {
      const recentlyViewed = [action.product, ...state.recentlyViewed.filter((p) => p._id !== action.product._id)].slice(0, 8);
      localStorage.setItem("bb_recent", JSON.stringify(recentlyViewed));
      return { ...state, recentlyViewed };
    }
    case "THEME":
      localStorage.setItem("bb_theme", action.theme);
      document.documentElement.classList.toggle("dark", action.theme === "dark");
      return { ...state, theme: action.theme };
    default:
      return state;
  }
};

export const ShopProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", state.theme === "dark");
  }, [state.theme]);

  const refreshCart = async () => {
    const data = await unwrap(api.get("/cart"));
    dispatch({ type: "CART", cart: data.cart, summary: data.summary });
  };

  const addToCart = async (product, quantity = 1) => {
    try {
      const data = await unwrap(api.post("/cart", { productId: product._id, quantity }));
      dispatch({ type: "CART", cart: data.cart, summary: data.summary });
    } catch {
      const item = state.cart.items.find((entry) => entry.product._id === product._id);
      const items = item
        ? state.cart.items.map((entry) => (entry.product._id === product._id ? { ...entry, quantity: entry.quantity + quantity } : entry))
        : [...state.cart.items, { product, quantity }];
      const subtotal = items.reduce((sum, entry) => sum + entry.product.price * entry.quantity, 0);
      dispatch({ type: "CART", cart: { items }, summary: { subtotal, discount: 0, shippingFee: subtotal > 999 ? 0 : 79, total: subtotal + (subtotal > 999 ? 0 : 79) } });
    }
    toast.success("Added to cart");
  };

  const toggleWishlist = async (product) => {
    try {
      const data = await unwrap(api.post("/wishlist/toggle", { productId: product._id }));
      dispatch({ type: "WISHLIST", products: data.wishlist.products });
    } catch {
      const exists = state.wishlist.some((item) => item._id === product._id);
      dispatch({ type: "WISHLIST", products: exists ? state.wishlist.filter((item) => item._id !== product._id) : [...state.wishlist, product] });
    }
  };

  const value = useMemo(() => ({ ...state, dispatch, refreshCart, addToCart, toggleWishlist }), [state]);
  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};

export const useShop = () => useContext(ShopContext);
