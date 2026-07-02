# MyWedding.lk — Frontend

Customer-facing web application for **MyWedding.lk**, a B2B2C wedding planning platform for Sri Lanka. Couples plan events, professional planners run CRM workspaces, vendors manage bookings and services, and admins oversee the marketplace.

Built with **Next.js 15** (App Router), **React 19**, **TypeScript**, and **Tailwind CSS v4**.

**Companion repository:** [mywedding-lk-backend](https://github.com/AsithaUdara/mywedding-lk-backend) — .NET 8 REST API and SignalR hubs.

---

## Features

| Area | Capabilities |
|------|----------------|
| **Couples / guests** | Event workspace (checklist, budget, team, vendors), vendor discovery and search |
| **Planners** | CRM dashboard, client pipeline, tasks, procurement, AI copilot, billing |
| **Vendors** | Business profile, services, inquiries, bookings, analytics, availability |
| **Admin** | Vendor verification, commissions, audit log |
| **Platform** | Firebase authentication (role-based), real-time updates via SignalR, Cloudinary image uploads |

---

## Tech stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router, Turbopack in dev) |
| UI | React 19, Tailwind CSS v4, Headless UI, Framer Motion |
| Data | TanStack React Query, Zod validation |
| Auth | Firebase Authentication (custom `role` claim) |
| Real-time | `@microsoft/signalr` |
| Maps | Google Maps Embed API |

---

## Prerequisites

- **Node.js 20+** and npm
- **Backend API** running locally ([backend README](https://github.com/AsithaUdara/mywedding-lk-backend))
- **Firebase** web app credentials
- **Google Maps API key** (Maps Embed API enabled) — optional; map iframes are hidden when unset
- **Cloudinary** cloud name and unsigned upload preset — for vendor service images

---

## Quick start

```powershell
git clone https://github.com/AsithaUdara/mywedding-lk-frontend.git
cd mywedding-lk-frontend

copy .env.example .env.local
# Edit .env.local — see Environment variables below

npm install
npm run dev
```

Open **http://localhost:3000**.

If Turbopack serves stale chunks after a large refactor:

```powershell
npm run dev:clean
```

---

## Environment variables

Create `.env.local` from `.env.example`. **Never commit `.env.local` or real API keys to git.**

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_BASE_URL` | Yes | Backend API origin, e.g. `http://localhost:5141` |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Yes | Firebase Web API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Yes | Firebase auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Yes | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Yes | Firebase storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Yes | Firebase messaging sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Yes | Firebase app ID |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | No | Google Maps Embed API key (vendor search + detail maps) |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | For uploads | Cloudinary cloud name |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | For uploads | Unsigned upload preset |

Maps keys are read at build/runtime via `process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` — do **not** hardcode keys in source files.

Restart the dev server after changing `.env.local`.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server (Turbopack) |
| `npm run dev:clean` | Clear `.next` cache, then start dev |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint (Next.js rules) |
| `npm run typecheck` | TypeScript check (`tsc --noEmit`) |

---

## Project structure

```
src/
├── app/                    # Routes (App Router)
│   ├── (home)/             # Marketing landing
│   ├── planner/            # Planner workspace
│   ├── vendor/             # Vendor storefront + dashboard
│   ├── vendors/            # Marketplace search & hub
│   ├── events/             # Couple event workspace
│   └── admin/              # Admin console
├── modules/                # Feature UI (planner, vendor, events, design system)
└── shared/
    ├── lib/api/            # HTTP clients + Zod schemas
    ├── lib/query/          # React Query key factory
    ├── hooks/              # Auth-aware query hooks
    ├── components/         # Layout, guards, UI primitives
    └── providers/          # AppProviders (auth + React Query)
```

### Conventions

- **API calls** go through `shared/lib/api/` — components do not call `fetch` directly.
- **Authenticated requests** use Firebase Bearer tokens via `apiClient.ts` / `plannerHttp.ts` / `vendorAuthedJson`.
- **Route guards** use `RoleGuard` on planner and vendor dashboard layouts; post-login routing lives in `shared/lib/auth/postLoginRedirect.ts`.
- **Server state** uses React Query (`useAuthedQuery`, domain hooks under `shared/hooks/query/`).
- **Real-time** — `RealTimeContext` (SignalR) invalidates React Query caches on collaboration events.

---

## Authentication & roles

Firebase Authentication issues ID tokens with a custom claim `role`:

| Role | Primary routes |
|------|----------------|
| `user` | Event workspace, vendor discovery |
| `planner` | `/planner/*` workspace |
| `vendor` | `/vendor/dashboard/*` |
| `admin` | `/admin/*` |

---

## CI

GitHub Actions runs **lint**, **typecheck**, and **build** on pushes and pull requests to `main`, `master`, and `develop`. Build uses placeholder Firebase env vars — no real secrets in CI.

---

## Security

- Store secrets only in `.env.local` (gitignored).
- Restrict Google Maps and Firebase keys in [Google Cloud Console](https://console.cloud.google.com/apis/credentials) (HTTP referrer restrictions for browser keys).
- If a key was ever committed, **rotate it** in Google Cloud / Firebase, then push the fix and close the GitHub Secret Scanning alert as **revoked**.
- Enable **push protection** under repository **Settings → Code security** to block future leaks.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `NEXT_PUBLIC_API_BASE_URL is not defined` | Set it in `.env.local` and restart dev |
| Map iframe blank | Set `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`; enable Maps Embed API |
| 401 from API | Sign in again; confirm backend Firebase project matches frontend `.env.local` |
| Stale Turbopack errors | `npm run dev:clean` |
| CORS errors | Add `http://localhost:3000` to backend `Cors:AllowedOrigins` |

---

## Related documentation

Integration setup (SMTP, PayHere, OpenAI, Cloudinary) is documented in the backend repository and shared project docs when both repos are checked out together.
