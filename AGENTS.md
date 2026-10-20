# Mannvaasam

Marketing site for Mannvaasam Global Exim. React 19, Vite, and Tailwind CSS v4 on the frontend, with Vercel Serverless Functions and Postgres on the backend. The production build is a static site in `dist/`; the API lives in `api/`.

## Scripts

- `pnpm dev` — local frontend dev server (port 5173, or `$PORT` when set). Requires Node.js 22.12 or newer; Vite 8 will not start on older 22.x releases (the machine default via nvm is 22.6.0 — run `nvm use` first; `.nvmrc` pins Node 24). Does **not** run the `/api` functions — see "Local development with the backend" below.
- `pnpm build` — typecheck and write `dist/`
- `pnpm preview` — serve the production build (also frontend-only, no `/api`)
- `pnpm format` — format with oxfmt (covers `src`, `api`, `scripts`, `vite.config.ts`, `index.html`)
- `pnpm db:migrate` — create tables and seed the catalogue + a default admin user (reads `DATABASE_URL` etc. from `.env`)

## Project structure

- `src/main.tsx` — mounts `src/App.tsx`
- `src/App.tsx` — header, footer, and page switching; renders `AdminDashboard` standalone (no header/footer) for the `/admin-dashboard` route
- `src/routes.ts` — path matching for clean URLs (`/about`, `/products/erode-turmeric`, `/admin-dashboard`)
- `src/data.ts` — gallery images, reviews, indicative prices, and navigation (product catalogue now comes from the backend, not this file)
- `src/lib/api.ts` — `apiFetch` wrapper around `fetch` for calling `/api/*` with cookies and JSON error handling
- `src/lib/products.ts` — `productPath`/`findProduct` helpers that operate on a `Product[]` passed in
- `src/hooks/useProducts.ts` — loads the product catalogue from `/api/products`
- `src/hooks/useAdminAuth.ts` — admin session state via `/api/auth/*`
- `src/pages/` — one file per public page
- `src/pages/admin/` — `AdminLogin`, `AdminPanel`, and the three dashboard sections (`EnquiriesPanel`, `ProductsPanel`, `AddUserPanel`)
- `src/components/` — shared UI, header, and footer
- `src/index.css` — global styles and the Tailwind import
- `index.html` — document shell
- `api/` — Vercel Serverless Functions (see "Backend" below)
- `scripts/migrate.mjs` — Postgres schema + seed script
- `vercel.json` and `public/_redirects` — send unknown paths to `index.html` so client routes work on static hosts; `/api/*` is matched before these rewrites

## Backend

- `api/_lib/db.ts` — pooled `pg` client from `DATABASE_URL` (pool cached on `global` to survive serverless re-invocations)
- `api/_lib/auth.ts` — JWT sign/verify + httpOnly session cookie helpers
- `api/_lib/slugify.ts`, `api/_lib/products.ts` — slug generation and the DB-row-to-`ProductDto` mapping
- `api/auth/{login,logout,me}.ts` — admin session endpoints; sets/clears an httpOnly, SameSite=Lax cookie
- `api/enquiries/index.ts` — `POST` is public (Enquire Now form), `GET` is admin-only (dashboard list)
- `api/products/index.ts` and `api/products/[slug].ts` — `GET` is public, `POST`/`PUT`/`DELETE` are admin-only
- `api/users/index.ts` — admin-only `GET` (list) / `POST` (create another admin login)

All mutating endpoints require a valid admin session cookie. There is intentionally no sign-up endpoint — the only way to create an admin account is `pnpm db:migrate` (seeds one default user) or the "Add user" panel once you're already logged in.

### Environment variables

Copy `.env.example` to `.env` and fill in:

- `DATABASE_URL` — Postgres connection string (Vercel Postgres, Supabase, Neon, etc.)
- `JWT_SECRET` — long random string signing admin session tokens
- `ADMIN_DEFAULT_USERNAME` / `ADMIN_DEFAULT_PASSWORD` — seeded by `pnpm db:migrate` as the first (mock) admin login; change the password or add a real user from the dashboard afterward

`.env*` is gitignored — never commit real credentials.

### Local development with the backend

Plain `vite dev`/`vite preview` only serve the frontend; requests to `/api/*` won't reach the serverless functions (Vite's SPA fallback may even return `index.html` for them). To exercise the backend locally:

1. `pnpm install`
2. Set up `.env` as above, pointing `DATABASE_URL` at a real Postgres instance
3. `pnpm db:migrate`
4. `vercel dev` (requires the Vercel CLI and `vercel link`) to run both the frontend and `/api` functions together

Without a live backend, the storefront (`Home`, `Products`, `ProductDetails`, `Enquiry`) and the admin dashboard degrade gracefully — they show a loading/error message instead of crashing. Keep this behavior when touching `src/lib/api.ts` or the data-fetching hooks: always resolve to an empty/array-safe state or a caught error, never let a non-array / non-JSON response reach a `.map`/`.slice` call.

## Styling

Tailwind CSS v4 is loaded with `@import "tailwindcss";` in `src/index.css` and the `@tailwindcss/vite` plugin. Most of the layout is custom CSS in that file. Use Tailwind utilities in JSX when they fit. Keep CSS `@import` statements first.

## Code quality

- Use double quotes for strings containing apostrophes, or escape apostrophes in single-quoted strings.
- Ensure JSX tags are closed and braces are balanced.
- Export page components as default exports.
- `oxfmt` has a bug where it collapses a multi-field **inline** object type (e.g. `{ path: string; go: Go }` used directly as a parameter or property type) onto one line and strips the `;` separators, producing invalid TypeScript. Always extract multi-field inline object types to a named `type` alias (e.g. `type ProductSpecDto = { label: string; value: string }`) instead of writing them inline — named type aliases are preserved correctly.

## Deploy

This project needs a host that runs the `api/` Serverless Functions, not just a static file host — deploy to **Vercel**. `pnpm build` produces `dist/`; Vercel builds this automatically via `vercel.json`. Set `DATABASE_URL`, `JWT_SECRET`, `ADMIN_DEFAULT_USERNAME`, and `ADMIN_DEFAULT_PASSWORD` as project environment variables, then run `pnpm db:migrate` (locally, pointed at the production `DATABASE_URL`, or via `vercel env pull` + `pnpm db:migrate`) once before first use.

If you deploy the frontend alone to a plain static host (Netlify, Cloudflare Pages, GitHub Pages), the storefront and admin dashboard will show "could not reach the API" instead of crashing, but none of the backend features will work — use Vercel for the full app.

For a GitHub project site, build with `BASE_PATH=/repository-name/`.
