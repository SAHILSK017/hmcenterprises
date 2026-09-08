# HMK Mobile — Server

Express 5 REST API for the HMK Mobile platform.

## Tech Stack

- **Runtime:** Node.js ≥ 20
- **Framework:** Express 5
- **Database:** MongoDB + Mongoose
- **Auth:** JWT (jsonwebtoken + bcryptjs)
- **Uploads:** Cloudinary
- **Payments:** Razorpay
- **Messaging:** WhatsApp Business Cloud API
- **Validation:** Zod
- **Language:** TypeScript (compiled to `dist/`)

## Setup

```bash
npm install
cp .env.example .env
# Edit .env — see variable table below
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | — | Server port (default: `4000`) |
| `CLIENT_URL` | ✅ | Frontend URL for CORS |
| `APP_URL` | ✅ | Same as `CLIENT_URL` |
| `MONGODB_URI` | ✅ | MongoDB connection string |
| `JWT_SECRET` | ✅ | Long random secret — **change in production** |
| `JWT_EXPIRES_IN` | — | Token expiry (default: `30d`) |
| `CLOUDINARY_CLOUD_NAME` | ✅ | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | ✅ | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | ✅ | Cloudinary API secret |
| `CLOUDINARY_UPLOAD_PRESET` | — | Unsigned preset (default: `hmk_unsigned`) |
| `WHATSAPP_TOKEN` | — | WhatsApp Business Cloud API token |
| `WHATSAPP_PHONE_NUMBER_ID` | — | WhatsApp sender phone ID |
| `WHATSAPP_BUSINESS_ACCOUNT_ID` | — | WhatsApp business account ID |
| `WHATSAPP_VERIFY_TOKEN` | — | Webhook verify token |
| `RAZORPAY_KEY_ID` | — | Razorpay key ID |
| `RAZORPAY_KEY_SECRET` | — | Razorpay key secret |
| `RAZORPAY_WEBHOOK_SECRET` | — | Razorpay webhook secret |
| `ENABLE_COD` | — | Enable Cash on Delivery (default: `true`) |
| `ENABLE_WHATSAPP` | — | Send real WhatsApp messages (default: `false`) |

> Generate a strong JWT secret:
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start with hot reload via `tsx watch` |
| `npm run build` | Compile TypeScript → `dist/` |
| `npm start` | Run compiled server (`node dist/index.js`) |
| `npm run seed` | Seed database with products, blog posts & admin user |

## API Endpoints

| Prefix | Description |
|--------|-------------|
| `GET /health` | Health check |
| `/api/auth` | Login, register, OAuth |
| `/api/repairs` | Repair request CRUD |
| `/api/sells` | Sell request CRUD |
| `/api/managed-sells` | Managed selling phone inventory |
| `/api/products` | Product catalogue |
| `/api/orders` | Order management |
| `/api/upload` | Cloudinary image upload |
| `/api/whatsapp` | WhatsApp webhook |
| `/api/blog` | Blog articles |
| `/api/site` | Public site settings |
| `/api/admin` | Admin-only management endpoints |

## Production Deployment

```bash
npm run build
npm start
```

For process management with PM2:

```bash
npm install -g pm2
npm run build
pm2 start dist/index.js --name hmk-api
pm2 save && pm2 startup
```

## Database Seeding

```bash
npm run seed
```

Creates:
- Products (phones, accessories)
- Blog posts
- Categories
- Admin user: `admin@hmkmobile.in` / `Admin@123`

> **Change the admin password after first login in production.**
