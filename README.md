# MyWedding.lk — Frontend

Next.js 15 (App Router) + React 19 + TypeScript + Tailwind CSS v4.

## Structure

```
frontend/src/
├── app/              # Routes (App Router)
├── modules/          # Feature UI (planner, vendor, events, …)
└── shared/
    ├── lib/api/      # HTTP + Zod schemas (no fetch in components)
    ├── lib/query/    # React Query key factory
    ├── hooks/query/  # useAuthedQuery, planner/event hooks
    └── providers/    # AppProviders (auth + React Query)
```

## Prerequisites

- Node.js 20+
- Backend API running locally (see `backend/README.md`)

## Setup

```powershell
cd frontend
copy .env.example .env.local
# Set NEXT_PUBLIC_API_BASE_URL and Firebase keys
npm install
npm run dev
```

App: `http://localhost:3000`

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Dev server (Turbopack) |
| `npm run dev:clean` | Delete `.next` cache, then start dev (fixes stale Turbopack manifest errors) |
| `npm run build` | Production build |
| `npm run lint` | ESLint (Next.js rules) |
| `npm run typecheck` | `tsc --noEmit` |

## Auth & route guards

- Firebase Authentication with custom claim `role` (`admin`, `vendor`, `planner`, `user`)
- Post-login routing: `shared/lib/auth/postLoginRedirect.ts`
- Workspace guards: `shared/components/auth/RoleGuard.tsx` on planner and vendor dashboard layouts
- API calls use Bearer tokens; planner CRM calls use `plannerFetch` (402 → billing redirect)

## API layer (Phase 2)

- Base URL: `NEXT_PUBLIC_API_BASE_URL` via `getApiBaseUrl()` — throws if missing
- Shared HTTP: `apiClient.ts` (`apiFetch`, `plannerFetch` via `plannerHttp.ts`)
- Request helpers: `apiRequest.ts` (`apiRequest`, `apiRequestJson`, `publicRequest`)
- Error parsing: `parseApiError.ts` (ProblemDetails + legacy `{ message }`)
- Runtime validation: Zod schemas in `shared/lib/api/schemas/` (tasks, planner events)
- Domain modules: `shared/lib/api/*.ts` — components call these, not `fetch` directly

## Data fetching (React Query)

- `QueryProvider` wraps the app in `AppProviders`
- `useAuthedQuery` / `useAuthedMutation` inject Firebase Bearer tokens
- Planner hooks: `usePlannerOverviewQuery`, `usePlannerEventsQuery`, `usePlannerDashboardQuery`, `usePlannerBookingsQuery`, `usePlannerEventInsights`, `usePlannerPortfolioQuery`, `usePlannerClientsPipelineQuery`, `usePlannerProcurementQuery`
- Event hooks: `useEventTasksQuery`, `useEventBriefQuery`, `useEventShortlistQuery`
- Vendor hooks: `useVendorBookingsQuery`, `useVendorServicesQuery`, `useVendorBusinessProfileQuery`, `useVendorSubscriptionQuery`, `useVendorBillingProfileQuery`
- Page hooks: `modules/planner/tasks/usePlannerTasksPage.ts` (tasks timeline workspace)
- Invalidation helper: `usePlannerQueryInvalidation`
- Query keys: `shared/lib/query/queryKeys.ts`
- After mutations, invalidate with `queryClient.invalidateQueries({ queryKey: queryKeys.planner.all })`

## Phase 3 additions

- Planner workspace pages migrated from `useEffect` + manual fetch to React Query hooks
- Tasks page logic extracted to `usePlannerTasksPage` with cache invalidation after mutations
- `RealTimeContext` (SignalR) invalidates React Query keys on `ChecklistUpdated`, `BudgetUpdated`, `InvitationAccepted`
- Vendor dashboard GET endpoints use `shared/lib/api/vendors/http.ts` (`vendorAuthedJson`)

## Phase 4 additions

- Vendor analytics, inquiries, and availability modules use React Query hooks
- `VendorVerificationContext` and `useVendorPendingBookings` share the vendor bookings/profile query cache
- Event workspace checklist and budget components use `useEventTasksQuery` / `useEventBudgetOverviewQuery` (SignalR invalidation keeps them fresh)
- Additional vendor GET endpoints migrated to `vendorAuthedJson`

CI runs lint, typecheck, and build on changes under `frontend/` (see `.github/workflows/frontend-ci.yml`).
