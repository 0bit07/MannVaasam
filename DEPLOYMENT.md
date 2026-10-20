# Deploy Mannvaasam on Vercel

The frontend and the backend deploy as **one Vercel project**. Vercel builds the Vite site into `dist/` and runs every file in `api/` as a Serverless Function. The browser calls `/api/...` on the same domain, so there is no separate backend URL to configure.

Do not deploy the frontend alone to a static host (Netlify, Cloudflare Pages, GitHub Pages). The pages will load, but products, prices, enquiries, reviews, FAQs, and admin login will show "could not reach the API".

## What gets deployed

| Piece | Where it lives | What Vercel does with it |
| --- | --- | --- |
| Frontend | `src/`, `index.html`, `public/` | Runs `pnpm build` and serves `dist/` |
| Backend | `api/**/*.ts` | One Serverless Function per file (`/api/products`, `/api/auth/login`, and so on) |
| Client routes | `vercel.json` rewrites | Sends `/about`, `/products/...`, `/admin-dashboard` to `index.html` |
| Database | Postgres (Supabase, Neon, or Vercel Postgres) | Not created by the deploy. You point `DATABASE_URL` at it and run the migration once |

## 1. Prepare the database

1. Create a Postgres database (Supabase is the one this project has been using).
2. Copy the **Session pooler** connection string, not the direct `db.<project>.supabase.co` host. The direct host is IPv6-only and the functions will time out trying to reach it. The pooler URI looks like:

   `postgresql://postgres.<project-ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres?sslmode=require`

3. On your machine, from the project folder:

   ```bash
   cp .env.example .env
   ```

4. Put that pooler URI in `.env` as `DATABASE_URL`. Set `JWT_SECRET` to a long random string (`openssl rand -base64 48`). Set `ADMIN_DEFAULT_USERNAME` and `ADMIN_DEFAULT_PASSWORD` for the first admin login.
5. Create the tables and seed the catalogue, prices, reviews, FAQs, and admin user:

   ```bash
   nvm use
   pnpm install
   pnpm db:migrate
   ```

   `.env` stays on your machine. Do not commit it.

## 2. Put the code on Vercel

Either connect Git, or deploy from the CLI. Use one of them, not both, for the same project.

### Option A — Git (recommended)

1. Push the repo to GitHub.
2. In the [Vercel dashboard](https://vercel.com/new), choose **Add New… → Project** and import that repo.
3. Confirm the settings Vercel detects:
   - **Framework preset:** Vite
   - **Build command:** `pnpm build`
   - **Output directory:** `dist`
   - **Install command:** `pnpm install`
   - **Node.js version:** 22.x (the project requires 22.12 or newer; `.nvmrc` is `24`)
4. Add the environment variables in the next step before the first production deploy.

### Option B — Vercel CLI

```bash
nvm use
pnpm install
vercel login
vercel link
vercel --prod
```

`vercel link` attaches this folder to a Vercel project. `vercel --prod` builds and publishes production. A later `vercel` without `--prod` publishes a preview URL instead.

## 3. Set the environment variables

In the Vercel project: **Settings → Environment Variables**. Add these for **Production** (and Preview, if you want preview URLs to talk to a database):

| Name | Value |
| --- | --- |
| `DATABASE_URL` | The Session pooler Postgres URI from step 1 |
| `JWT_SECRET` | The same long random string you used locally, or a new one for production |
| `ADMIN_DEFAULT_USERNAME` | First admin username. Only used by `pnpm db:migrate`, not by the running site |
| `ADMIN_DEFAULT_PASSWORD` | First admin password. Same note as above |

If production should use a different admin password than your laptop, set the production values in Vercel and run `pnpm db:migrate` with that production `DATABASE_URL` before the first login.

Redeploy after changing variables. Vercel does not inject new values into a deployment that is already built.

## 4. Deploy

- **Git:** push to the production branch. Vercel builds and deploys on that push.
- **CLI:** `vercel --prod`

The build runs `pnpm build` (`tsc --noEmit && vite build`). The `api/` functions are deployed with that same deployment. You do not run a second deploy for the backend.

## 5. Check that both sides are live

Open the production URL Vercel prints.

- Home, About, Products, Daily Prices, Reviews, FAQs, and Contact render the site.
- `https://<your-domain>/api/products` returns a JSON list, not the HTML page.
- `https://<your-domain>/admin-dashboard` shows the sign-in form. Sign in with the admin user created by `pnpm db:migrate`.
- Submit a test enquiry and confirm it appears under **Enquiries** in the dashboard.

The admin session cookie lasts 24 hours from sign-in. On Vercel it is marked `Secure`, so the dashboard must be opened over `https://`.

## Updating later

Push to the production branch, or run `vercel --prod`. That updates the site and the API together.

When a change adds a table or column (products, daily prices, enquiry status, and so on), run this once against the production database before you rely on the new feature:

```bash
# .env DATABASE_URL must be the production pooler URI
pnpm db:migrate
```

The script only creates missing tables and inserts seed rows that are not there yet. It does not overwrite products, prices, or enquiries you already edited.

## Custom domain

In the Vercel project, open **Settings → Domains**, add the domain, and set the DNS records Vercel shows. HTTPS is issued automatically. No code change is required: the frontend and `/api` stay on that same domain.
