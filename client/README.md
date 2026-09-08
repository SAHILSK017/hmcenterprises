# HMK Mobile — Client

Next.js 16 frontend for the HMK Mobile repair, buyback & e-commerce platform.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **UI:** React 19, TypeScript, Tailwind CSS v4
- **State:** TanStack Query v5, React Context
- **Forms:** React Hook Form + Zod
- **Animations:** Framer Motion, GSAP ScrollTrigger
- **3D:** React Three Fiber + Three.js
- **Payments:** Razorpay
- **Notifications:** Sonner toast

## Setup

```bash
npm install
cp .env.example .env.local
# Edit .env.local with your values
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | ✅ | Backend API base URL |
| `NEXT_PUBLIC_APP_URL` | ✅ | This app's public URL |
| `NEXT_PUBLIC_APP_NAME` | — | Display name (default: HMK Mobile) |
| `NEXT_PUBLIC_SITE_URL` | — | Canonical domain for blog OG tags |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | — | Razorpay publishable key |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (port 3000) |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

## Notes

- Admin routes (`/admin/*`) require a JWT cookie with `role: admin`
- Account routes (`/account/*`) require any valid JWT cookie
- Route guards are enforced in `src/middleware.ts`
- Images are served from Cloudinary (`res.cloudinary.com`)
