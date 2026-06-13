export const categories = [
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

export const categoryImages = {
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

export const mockProducts = categories.flatMap((category, index) =>
  [1, 2, 3].map((n) => {
    const price = 449 + index * 120 + n * 160;
    return {
      _id: `${index}-${n}`,
      name: `${category} ${n === 1 ? "Premium Set" : n === 2 ? "Family Pack" : "Daily Essential"}`,
      slug: `${category.toLowerCase().replaceAll(" ", "-")}-${n}`,
      brand: ["Prestige", "Borosil", "Cello", "Milton", "BartanBazaar Select"][index % 5],
      categoryName: category,
      description: "Durable, elegant kitchenware designed for everyday Indian cooking, festive dining, and gifting.",
      price,
      mrp: Math.round(price * 1.32),
      stock: 32,
      rating: 4 + ((index + n) % 10) / 10,
      reviewsCount: 18 + index,
      sold: 70 + index * n,
      isTrending: (index + n) % 2 === 0,
      isBestSeller: (index + n) % 3 === 0,
      isNewArrival: n === 3,
      dealEndsAt: n === 1 ? new Date(Date.now() + 86400000).toISOString() : null,
      images: [{ url: categoryImages[category][(n - 1) % categoryImages[category].length], alt: category }]
    };
  })
);

export const mockReels = mockProducts.slice(0, 8).map((product, index) => ({
  _id: `reel-${product._id}`,
  title: `${product.name} close-up`,
  videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  thumbnail: product.images[0].url,
  product,
  likes: Array(index).fill("x"),
  saves: [],
  shares: index * 3
}));
