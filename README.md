# GWL Creators Hub 2.0

Premium digital-products marketplace — a full-stack SaaS application built from
the approved UI prototype. Two independent apps: a TypeScript **Express + Prisma
+ PostgreSQL** API and a **React + Vite + TypeScript** front-end.

The original prototype (`*.dc.html`, `support.js`) is preserved at the repo root
as the design reference. The production app lives in `backend/` and `frontend/`.

```
backend/    Express + TypeScript REST API (Controller → Service → Repository → Prisma)
frontend/   React + Vite + TypeScript SPA (TanStack Query, Zustand, React Router)
*.dc.html   Original approved prototype (design source of truth — do not delete)
```

## Prerequisites

- Node.js 20+ (tested on Node 24)
- Network access to the PostgreSQL instance in `backend/.env`

## 1. Backend

```bash
cd backend
npm install
npm run db:push     # create tables (already applied to the configured DB)
npm run db:seed     # load demo data (idempotent — clears & reseeds)
npm run dev         # http://localhost:4000/api/v1
```

Other scripts: `npm run build`, `npm start`, `npm run typecheck`, `npm run prisma:studio`.

The database URL is in `backend/.env`. Note the password's `@` is URL-encoded
(`Loki%4012345`) so the connection string parses correctly.

## 2. Frontend

```bash
cd frontend
npm install
npm run dev         # http://localhost:5173  (proxies /api → :4000)
```

Other scripts: `npm run build`, `npm run preview`, `npm run typecheck`.

## Demo credentials

| Role   | Email             | Password |
|--------|-------------------|----------|
| Member | member@gmail.com  | `1234`   |
| Admin  | admin@gmail.com   | `12345`  |

Sign-in is role-aware (Member / Admin tabs). Public signup is admin-issued only:
`POST /api/v1/auth/invites` returns a token → user completes at `/signup/:token`.

## Architecture highlights

**Backend**
- JWT access tokens (15 min) + rotating refresh tokens stored hashed in the DB,
  delivered as an httpOnly cookie.
- Layered: `routes → controllers → services → repositories → prisma`.
- Zod request validation, centralised error handler, Prisma error mapping,
  Helmet, CORS, compression, morgan, and per-route rate limiting.
- Full Prisma schema: users/RBAC, products + releases, bundles, coupons, orders,
  invoices, entitlements, wishlist, notifications, referrals, support tickets,
  CMS (testimonials/announcements/faqs/landing), media, audit logs, settings.
- Audit logging on every privileged mutation.

**Frontend**
- Axios client with transparent 401 → refresh-token retry.
- Zustand auth store with session bootstrap from the refresh cookie.
- TanStack Query for server state; React Router with role-based route guards.
- Design ported verbatim from the prototype (inline styles + tokens) so spacing,
  colors, typography, layout and animations are preserved exactly.

## Status

Production-ready foundation, fully wired and verified end-to-end (DB → API →
proxy → SPA). Sign In, Sign Up, the landing catalog, and both dashboard shells
render live data. The remaining member/admin sub-views are being ported view by
view against their already-built API endpoints — see the in-repo TODO.
