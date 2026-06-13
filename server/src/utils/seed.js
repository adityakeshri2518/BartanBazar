import dotenv from "dotenv";
import slugify from "slugify";
import { connectDB } from "../config/db.js";
import Cart from "../models/Cart.js";
import Category from "../models/Category.js";
import Coupon from "../models/Coupon.js";
import Offer from "../models/Offer.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Reel from "../models/Reel.js";
import Review from "../models/Review.js";
import User from "../models/User.js";
import Wishlist from "../models/Wishlist.js";

dotenv.config();

const categories = [
  "Steel Utensils",
  "Copper Utensils",
  "Brass Utensils",
  "Non-Stick Cookware",
  "Dinner Sets",
  "Crockery Sets",
  "Glassware",
  "Kitchen Tools",
  "Storage Containers",
  "Water Bottles",
  "Tiffin Boxes",
  "Gift Sets"
];

const categoryImages = {
  "Steel Utensils": [
    "https://images.unsplash.com/photo-1584990347449-a7012f95c6d3?auto=format&fit=crop&w=900&q=85",
    "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=900&q=85"
  ],
  "Copper Utensils": [
    "https://images.unsplash.com/photo-1603199506016-b9a594b593c0?auto=format&fit=crop&w=900&q=85",
    "https://images.unsplash.com/photo-1514986888952-8cd320577b68?auto=format&fit=crop&w=900&q=85"
  ],
  "Brass Utensils": [
    "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=900&q=85",
    "https://images.unsplash.com/photo-1603199506016-b9a594b593c0?auto=format&fit=crop&w=900&q=85"
  ],
  "Non-Stick Cookware": [
    "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=900&q=85",
    "https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=900&q=85"
  ],
  "Dinner Sets": [
    "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=900&q=85",
    "https://images.unsplash.com/photo-1603199506016-b9a594b593c0?auto=format&fit=crop&w=900&q=85"
  ],
  "Crockery Sets": [
    "https://images.unsplash.com/photo-1514986888952-8cd320577b68?auto=format&fit=crop&w=900&q=85",
    "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=900&q=85"
  ],
  Glassware: [
    "https://images.unsplash.com/photo-1560184897-502a475f7a0d?auto=format&fit=crop&w=900&q=85",
    "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=900&q=85"
  ],
  "Kitchen Tools": [
    "https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=900&q=85",
    "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=900&q=85"
  ],
  "Storage Containers": [
    "https://images.unsplash.com/photo-1584473457409-cefeda6b9e29?auto=format&fit=crop&w=900&q=85",
    "https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=900&q=85"
  ],
  "Water Bottles": [
    "https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=900&q=85",
    "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=900&q=85"
  ],
  "Tiffin Boxes": [
    "https://images.unsplash.com/photo-1543352634-a1c51d9f1fa7?auto=format&fit=crop&w=900&q=85",
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=900&q=85"
  ],
  "Gift Sets": [
    "https://images.unsplash.com/photo-1514986888952-8cd320577b68?auto=format&fit=crop&w=900&q=85",
    "https://images.unsplash.com/photo-1603199506016-b9a594b593c0?auto=format&fit=crop&w=900&q=85"
  ]
};

const imageFor = (category, index = 0) => categoryImages[category]?.[index % categoryImages[category].length] || categoryImages["Dinner Sets"][0];

const run = async () => {
  await connectDB();
  await Promise.all([
    Product.deleteMany(),
    Category.deleteMany(),
    Coupon.deleteMany(),
    Offer.deleteMany(),
    Reel.deleteMany(),
    Review.deleteMany(),
    Cart.deleteMany(),
    Wishlist.deleteMany(),
    Order.deleteMany()
  ]);

  await User.deleteOne({ email: "admin@bartanbazaar.in" });
  const admin = await User.create({
    name: "BartanBazaar Admin",
    email: "admin@bartanbazaar.in",
    password: "Admin@123",
    role: "admin"
  });

  const categoryDocs = await Category.insertMany(
    categories.map((name, index) => ({
      name,
      slug: slugify(name, { lower: true, strict: true }),
      image: imageFor(name),
      description: `Premium ${name.toLowerCase()} for Indian homes and gifting.`,
      isFeatured: index < 8
    }))
  );

  const products = [];
  const brands = ["Pigeon", "Hawkins", "Borosil", "Cello", "Prestige", "Milton", "BartanBazaar Select"];
  for (const [index, category] of categoryDocs.entries()) {
    for (let i = 1; i <= 3; i += 1) {
      const name = `${category.name} ${i === 1 ? "Premium Set" : i === 2 ? "Family Pack" : "Daily Essential"}`;
      const price = 399 + index * 130 + i * 180;
      products.push({
        name,
        slug: `${slugify(name, { lower: true, strict: true })}-${i}`,
        brand: brands[(index + i) % brands.length],
        category: category._id,
        categoryName: category.name,
        description:
          "Crafted for Indian kitchens with durable finish, elegant design, easy maintenance, and festive-ready presentation.",
        price,
        mrp: Math.round(price * 1.28),
        stock: 25 + index * 3,
        images: [
          { url: imageFor(category.name, i - 1), alt: name },
          { url: imageFor(category.name, i), alt: `${name} lifestyle` }
        ],
        specifications: {
          Material: category.name.split(" ")[0],
          Warranty: "1 year",
          Care: "Hand wash recommended",
          Origin: "India"
        },
        tags: [category.name, "premium", "kitchen"],
        rating: Number((4 + ((index + i) % 10) / 10).toFixed(1)),
        reviewsCount: 15 + index + i,
        sold: 40 + index * 12 + i,
        isTrending: (index + i) % 2 === 0,
        isBestSeller: (index + i) % 3 === 0,
        isNewArrival: i === 3,
        dealEndsAt: i === 1 ? new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) : null
      });
    }
  }

  const productDocs = await Product.insertMany(products);

  await Coupon.create({
    code: "BAZAAR10",
    description: "10% off on your cart",
    discountType: "percent",
    value: 10,
    minCartValue: 999,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  });

  await Offer.create({
    title: "Festive Kitchen Upgrade",
    subtitle: "Up to 35% off on dinner sets, bottles, and cookware",
    banner: imageFor("Dinner Sets"),
    couponCode: "BAZAAR10",
    startsAt: new Date(),
    endsAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
  });

  await Reel.insertMany(
    productDocs.slice(0, 8).map((product, index) => ({
      title: `${product.name} in 15 seconds`,
      videoUrl: `https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4`,
      thumbnail: product.images[0].url,
      product: product._id,
      shares: index
    }))
  );

  console.log(`Seeded BartanBazaar with ${productDocs.length} products. Admin: ${admin.email} / Admin@123`);
  process.exit(0);
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
