# Mannvaasam Global Exim

Marketing site for Mannvaasam Global Exim — React 19, Vite, and Tailwind CSS v4 on the frontend, with Vercel Serverless Functions and Postgres on the backend (admin dashboard, product catalogue, and enquiry storage).

## Prerequisites

- **Node.js 22.12+** (Vite 8 will not start on older 22.x releases, including 22.6). Check with `node -v`.
- **pnpm** — install with `npm install -g pnpm` if you don't have it.

If `pnpm dev` prints `You are using Node.js 22.6.0. Vite requires Node.js version 20.19+ or 22.12+`, your shell is still on the old nvm default. Node 24 is already installed on this machine. From the project folder, switch to it and start the app:

```bash
nvm use
node -v   # should print v24.x
pnpm dev
```

`nvm use` reads `.nvmrc` (set to `24`) and activates that version for the current terminal only. To make every new terminal use it:

```bash
nvm alias default 24
```
- A **Postgres database** — only needed if you want to run the backend (admin dashboard, live product catalogue, enquiry storage). Any provider works: [Vercel Postgres](https://vercel.com/storage/postgres), [Supabase](https://supabase.com), [Neon](https://neon.tech), or a local Postgres instance.
- **Vercel CLI** — only needed if you want to run the backend locally. Install with `npm install -g vercel`.

## 1. Install dependencies

```bash
pnpm install
```

## 2. Running just the frontend (no backend)

This is the fastest way to work on layout, pages, and styling. The storefront and admin dashboard both degrade gracefully without a backend — they show a "could not reach the API" message instead of crashing.

```bash
pnpm dev
```

Opens at [http://localhost:5173](http://localhost:5173) (or `$PORT` if set). Hot-reloads on save.

> Note: `pnpm dev` / `pnpm preview` do **not** run anything in `api/`. Requests to `/api/*` won't be handled, so the product catalogue, enquiry form, and admin dashboard login will all show "could not reach the API" errors. To exercise those features, follow the steps below to run the backend too.

## 3. Running the frontend **and** backend together

The backend lives in `api/` as Vercel Serverless Functions, so you run everything through the Vercel CLI's local dev server, which serves the Vite frontend and the `/api/*` functions on the same port.

### 3.1 Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` and fill in:

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | Postgres connection string, e.g. `postgres://user:password@host:5432/dbname?sslmode=require` |
| `JWT_SECRET` | Long random string used to sign admin session tokens. Generate one with `openssl rand -base64 48` |
| `ADMIN_DEFAULT_USERNAME` | Seeded admin username (used for the first login) |
| `ADMIN_DEFAULT_PASSWORD` | Seeded admin password (a mock/placeholder password — change it after your first login, or add a real user from the dashboard) |

`.env*` is gitignored — never commit real credentials.

### 3.2 Create the database tables and seed data

```bash
pnpm db:migrate
```

This creates the `products`, `enquiries`, `reviews`, `faqs`, `daily_prices`, and `admin_users` tables, seeds the catalogue, reviews, FAQs, and today's price board, and seeds one admin user from `ADMIN_DEFAULT_USERNAME` / `ADMIN_DEFAULT_PASSWORD`. Run it again after pulling new changes so new tables and columns (enquiry status, daily prices) are added. Existing rows are left as they are.

### 3.3 Link the project to Vercel (one-time)

```bash
vercel login
vercel link
```

Follow the prompts (you can link to a new or existing Vercel project — this is only needed so the CLI knows how to run your `api/` functions locally; it does not deploy anything).

### 3.4 Run the full dev server

`vercel dev` uses whatever `node` is on your PATH. Switch to Node 24 first, or Vite prints `You are using Node.js 22.6.0` and can fail while parsing `index.html`. If `vercel` is not installed globally, `pnpm dlx vercel` runs the same CLI.

```bash
nvm use
pnpm dlx vercel dev
```

The project is already linked, so this should not ask you to create it again. It serves the app at [http://localhost:3000](http://localhost:3000) (or the next free port) with both the frontend and the `/api/*` functions working. Use that URL to:

- Browse the storefront with a live product catalogue and a working "Enquire now" form
- Log in to the admin dashboard at **`/admin-dashboard`**

### 3.5 Log in to the admin dashboard

Go to `http://localhost:3000/admin-dashboard` and sign in with `ADMIN_DEFAULT_USERNAME` / `ADMIN_DEFAULT_PASSWORD` from your `.env`. There is no sign-up page — admin accounts are only created via `pnpm db:migrate` (the seeded default) or the "Add user" panel once you're already logged in.

From the dashboard you can:

- View enquiries and mark each one to do or completed
- Update today's price board (separate from the product catalogue)
- Add, edit, or remove products (image, description, price, etc.) shown on the storefront
- Add new admin users (username + password) who can log in to `/admin-dashboard`

## Other scripts

| Command | What it does |
| --- | --- |
| `pnpm build` | Typechecks and writes the production build to `dist/` |
| `pnpm preview` | Serves the production build from `dist/` (frontend only, no `/api`) |
| `pnpm format` | Formats `src`, `api`, `scripts`, `vite.config.ts`, and `index.html` with oxfmt |
| `pnpm db:migrate` | Creates tables and seeds the catalogue + default admin user |

## Deploying

Frontend and backend go out together on **Vercel**. Step-by-step instructions are in [`DEPLOYMENT.md`](./DEPLOYMENT.md).

For more implementation details (project structure, API routes, code-quality conventions), see [`AGENTS.md`](./AGENTS.md).