# HMK Mobile

Premium mobile repair, buyback & e-commerce platform for the Indian market.

## What It Does

- **Repair booking** — customers book repairs online, track status live (REP-XXXXX IDs)
- **Sell your phone** — instant valuations, WhatsApp offer delivery (SELL-XXXXX IDs)
- **Shop** — new, used & refurbished devices + accessories (ORD-XXXXX IDs)
- **Admin dashboard** — full management of repairs, sell requests, orders, products, inventory, blogs, and site settings

## Architecture

| Layer | Stack |
|-------|-------|
| **Client** | Next.js 16, React 19, TypeScript, Tailwind CSS v4 |
| **API** | Express 5, MongoDB + Mongoose, TypeScript (port 4000) |
| **3D / Animations** | React Three Fiber, GSAP ScrollTrigger |
| **Payments** | Razorpay (online) + Cash on Delivery |
| **Uploads** | Cloudinary |
| **Notifications** | WhatsApp Business Cloud API |

---

## Prerequisites

| Requirement | Version |
|-------------|---------|
| Node.js | ≥ 20 |
| npm | ≥ 10 |
| MongoDB | Atlas or self-hosted |
| Cloudinary account | For image uploads |

---

## Installation

### 1. Clone the repository

```bash
git clone <repo-url>
cd "HMK repair"
```

### 2. Install server dependencies

```bash
cd server
npm install
```

### 3. Install client dependencies

```bash
cd ../client
npm install
```

---

## Environment Setup

### Server (`server/.env`)

```bash
cp server/.env.example server/.env
```

Edit `server/.env` and fill in the required values:

| Variable | Description |
|----------|-------------|
| `PORT` | API port (default: `4000`) |
| `CLIENT_URL` | Frontend URL for CORS (e.g. `https://hmkmobile.in`) |
| `APP_URL` | Same as `CLIENT_URL` |
| `MONGODB_URI` | MongoDB connection string (Atlas or local) |
| `JWT_SECRET` | Long random string — **generate a strong secret for production** |
| `JWT_EXPIRES_IN` | Token expiry (e.g. `30d`) |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `CLOUDINARY_UPLOAD_PRESET` | Unsigned upload preset (default: `hmk_unsigned`) |
| `WHATSAPP_TOKEN` | WhatsApp Business Cloud API bearer token |
| `WHATSAPP_PHONE_NUMBER_ID` | WhatsApp sender phone number ID |
| `WHATSAPP_BUSINESS_ACCOUNT_ID` | WhatsApp business account ID |
| `WHATSAPP_VERIFY_TOKEN` | Webhook verify token |
| `RAZORPAY_KEY_ID` | Razorpay key ID |
| `RAZORPAY_KEY_SECRET` | Razorpay key secret |
| `RAZORPAY_WEBHOOK_SECRET` | Razorpay webhook secret |
| `ENABLE_COD` | `true` to enable Cash on Delivery (default: `true`) |
| `ENABLE_WHATSAPP` | `true` to send real WhatsApp messages (default: `false`) |

> **Security:** Never commit `server/.env`. It is protected by `server/.gitignore`.
> Generate a strong JWT secret: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### Client (`client/.env.local`)

```bash
cp client/.env.example client/.env.local
```

Edit `client/.env.local`:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Your server API URL (e.g. `https://api.hmkmobile.in`) |
| `NEXT_PUBLIC_APP_URL` | Your frontend URL (e.g. `https://hmkmobile.in`) |
| `NEXT_PUBLIC_APP_NAME` | App display name |
| `NEXT_PUBLIC_SITE_URL` | Public domain for OG/canonical blog URLs |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Razorpay publishable key (safe to expose) |

---

## Development

Run both servers in separate terminals:

```bash
# Terminal 1 — API server (port 4000)
cd server
npm run dev

# Terminal 2 — Next.js frontend (port 3000)
cd client
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Seed the database

```bash
cd server
npm run seed
```

Seeds products, blog posts, categories, and creates the admin account:

```
Email:    admin@hmkmobile.in
Password: Admin@123
```

> **Change the admin password after first login in production.**

---

## Production Build

### Server

```bash
cd server
npm run build   # Compiles TypeScript → dist/
npm start       # Runs node dist/index.js
```

### Client

```bash
cd client
npm run build   # Next.js production build
npm start       # Starts Next.js production server (port 3000)
```

---

## Project Structure

```
HMK repair/
├── client/                  # Next.js frontend
│   ├── src/
│   │   ├── app/             # Next.js App Router pages & routes
│   │   │   ├── admin/       # Admin dashboard pages
│   │   │   ├── shop/        # Product listing
│   │   │   ├── checkout/    # Order checkout
│   │   │   ├── repair/      # Repair booking form
│   │   │   ├── sell/        # Sell your phone form
│   │   │   ├── track/       # Order/repair/sell tracker
│   │   │   ├── account/     # Customer account
│   │   │   ├── blog/        # Blog articles
│   │   │   └── ...          # Redirect aliases (mobile-repair, sell-your-phone, etc.)
│   │   ├── components/      # Reusable React components
│   │   │   ├── admin/       # Admin shell & layout
│   │   │   ├── auth/        # Login / register forms
│   │   │   ├── home/        # Homepage 3D hero & sections
│   │   │   ├── layout/      # Site header, footer, chrome
│   │   │   ├── repair/      # Repair booking form
│   │   │   ├── sell/        # Sell phone form
│   │   │   ├── shop/        # Product cards, cart, wishlist, filters
│   │   │   └── ui/          # Base UI components (button, card, input, badge)
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utilities, API client, constants, validations
│   │   └── middleware.ts    # Next.js middleware (auth route guards)
│   ├── public/
│   │   ├── videos/          # Hero video (phone-hero.mp4, poster jpg)
│   │   ├── images/          # Static images
│   │   └── models/          # Optional GLB 3D model (phone-exploded.glb)
│   ├── .env.example         # Client env template
│   └── next.config.ts       # Next.js config (image domains, cache headers)
│
└── server/                  # Express API
    ├── src/
    │   ├── index.ts         # Entry point, Express app setup
    │   ├── routes/          # API route handlers
    │   │   ├── auth.ts      # /api/auth — login, register, oauth
    │   │   ├── repairs.ts   # /api/repairs
    │   │   ├── sells.ts     # /api/sells
    │   │   ├── managedSells.ts # /api/managed-sells
    │   │   ├── products.ts  # /api/products
    │   │   ├── orders.ts    # /api/orders
    │   │   ├── admin.ts     # /api/admin — protected admin endpoints
    │   │   ├── blog.ts      # /api/blog
    │   │   ├── upload.ts    # /api/upload — Cloudinary upload
    │   │   ├── whatsapp.ts  # /api/whatsapp — webhook
    │   │   └── site.ts      # /api/site — public site settings
    │   ├── models/          # Mongoose models
    │   ├── middleware/       # Auth middleware (JWT verify)
    │   ├── lib/             # DB, Cloudinary, Razorpay, WhatsApp, utilities
    │   └── scripts/         # seed.ts, seed-mac.ts (one-time data seeding)
    ├── .env.example         # Server env template
    └── tsconfig.json
```

---

## Key Routes

| URL | Description |
|-----|-------------|
| `/` | Homepage with 3D hero |
| `/repair` | Repair booking form |
| `/mobile-repair` | Alias → `/repair` |
| `/sell` | Sell your phone form |
| `/sell-your-phone` | Alias → `/sell` |
| `/shop` | Product marketplace |
| `/shop/category/:name` | Filtered product listing |
| `/product/:slug` | Product detail page |
| `/track` | Track repair / order / sell request |
| `/track-repair` | Alias → `/track` |
| `/cart` | Shopping cart |
| `/checkout` | Order checkout |
| `/account` | Customer account (auth required) |
| `/admin` | Admin dashboard (admin role required) |
| `/blog` | Blog listing |
| `/about` | About page |
| `/contact` | Contact page |

---

## 3D Model (Optional)

The homepage uses a **procedural exploded phone model** by default. To enable a custom GLB:

1. Drop your file at `client/public/models/phone-exploded.glb`
2. Name meshes to match component IDs: `BackGlass`, `Display`, `Battery`, `Motherboard`, `Camera`, `ChargingPort`

The site respects `prefers-reduced-motion` and falls back to a static layout.

---

## Deployment

### Client — Vercel (recommended)

1. Push the repo to GitHub
2. Import the **`client/`** directory in Vercel
3. Set **Root Directory** to `client`
4. Add all `NEXT_PUBLIC_*` environment variables in the Vercel dashboard
5. Deploy — Vercel handles `npm run build` and `npm start` automatically

### Server — Railway / Render / VPS

**Railway / Render:**
1. Connect your repo
2. Set **Root Directory** to `server`
3. Set build command: `npm run build`
4. Set start command: `npm start`
5. Add all server environment variables in the dashboard

**VPS (with PM2):**
```bash
cd server
npm install --omit=dev
npm run build
pm2 start dist/index.js --name hmk-api
pm2 save
pm2 startup
```

### Health check

The API exposes a health endpoint at `GET /health`:

```json
{ "ok": true, "service": "hmk-server" }
```

Use this for uptime monitoring and load balancer health checks.
