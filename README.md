# BartanBazaar

BartanBazaar is a full-stack Indian utensils, crockery, cookware, and dining marketplace built with React, Tailwind CSS, Node.js, Express, MongoDB, JWT auth, Cloudinary uploads, and Razorpay checkout.

## Features

- Customer auth: signup, login, forgot password, OTP verification, JWT sessions, bcrypt password hashing
- Storefront: hero offers, search, categories, trending products, best sellers, new arrivals, deals, reviews, brands, newsletter, footer
- Shop: product listing, grid/list view, category, price and brand-ready filters, search, sorting, pagination-ready API
- Product details: gallery, zoom hover, specs, reviews, similar products, cart, buy now
- Cart and checkout: quantity updates, coupon-ready summary, shipping address, Razorpay order creation and payment verification
- Account: profile, password route, saved addresses API, wishlist, orders, tracking, invoice endpoint, cancellation endpoint
- Reels: vertical video feed, likes, saves, shares, product click-through
- Admin: role-based dashboard, analytics, products, categories, orders, customers, coupons, offers, reels, reports, Cloudinary upload route
- Extras: dark/light mode, recently viewed products, recommendations API, skeleton component, responsive layout, SEO meta tags

## Folder Structure

```text
BartanBazaar/
  client/
    src/
      components/
      context/
      data/
      pages/
      services/
  server/
    src/
      config/
      controllers/
      middleware/
      models/
      routes/
      utils/
```

## Local Setup

1. Install dependencies:

```bash
npm run install:all
npm install
```

2. Create environment files:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

3. Configure `server/.env`:

```env
MONGO_URI=mongodb://127.0.0.1:27017/bartanbazaar
JWT_SECRET=replace-with-a-long-random-secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=your_secret
```

4. Seed demo data:

```bash
npm run seed --prefix server
```

Demo admin:

```text
admin@bartanbazaar.in
Admin@123
```

5. Run the app:

```bash
npm run dev
```

Frontend: `http://localhost:5173`

Backend: `http://localhost:5000/api`

## API Overview

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/forgot-password`
- `POST /api/auth/verify-otp`
- `POST /api/auth/reset-password`
- `GET /api/products`
- `GET /api/products/featured`
- `GET /api/products/:slug`
- `POST /api/products/:productId/reviews`
- `GET /api/categories`
- `GET|POST|PATCH|DELETE /api/cart`
- `GET|POST /api/wishlist`
- `POST /api/orders`
- `POST /api/orders/verify-payment`
- `GET /api/orders`
- `PATCH /api/orders/:id/cancel`
- `GET /api/orders/:id/invoice`
- `GET /api/reels`
- `POST /api/reels/:id/interact`
- `GET /api/admin/dashboard`
- `POST|PUT|DELETE /api/admin/products`
- `POST|PUT|DELETE /api/admin/categories`
- `GET|POST /api/admin/coupons`
- `GET|POST /api/admin/offers`
- `GET|POST /api/admin/reels`
- `GET /api/admin/reports/sales`

## Deployment Guide

### Backend

Deploy the `server` folder to Render, Railway, Fly.io, or an EC2/VM Node runtime.

- Build command: `npm install`
- Start command: `npm start`
- Add production environment variables from `server/.env.example`
- Use MongoDB Atlas for `MONGO_URI`
- Set `CLIENT_URL` to your frontend domain

### Frontend

Deploy the `client` folder to Vercel, Netlify, or any static host.

- Build command: `npm run build`
- Output directory: `dist`
- Set `VITE_API_URL=https://your-api-domain.com/api`
- Set `VITE_RAZORPAY_KEY_ID=rzp_live_xxxxx`

### Production Checklist

- Use a long random `JWT_SECRET`
- Switch Razorpay keys from test to live
- Configure Cloudinary upload presets/security rules
- Add transactional email/SMS provider for OTP delivery
- Enable MongoDB Atlas backups and indexes
- Put API behind HTTPS
- Add monitoring and centralized logs
- Add CDN caching for frontend assets and images
