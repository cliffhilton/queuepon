# Queuepon — Restaurant Growth Platform

Done-for-you Facebook and Instagram ads that turn local restaurants into local favorites.

## Stack
- **Next.js 14** — App Router, TypeScript
- **Supabase** — Auth, database, real-time
- **Stripe** — Subscription billing
- **Resend** — Transactional email
- **Railway** — Deployment
- **Tailwind CSS** — Styling

## Local Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy env template
cp .env.example .env.local
# Fill in your keys (see below)

# 3. Run the database schema
# Go to Supabase → SQL Editor → paste contents of supabase/schema.sql → Run

# 4. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

See `.env.example` for all required keys:
- **Supabase**: Get from supabase.com → Project Settings → API
- **Stripe**: Get from dashboard.stripe.com → Developers → API Keys
- **Resend**: Get from resend.com → API Keys

## Deploy to Railway

1. Push this repo to GitHub
2. Go to railway.app → New Project → Deploy from GitHub
3. Select this repo
4. Add all environment variables from `.env.local`
5. Add custom domain: queuepon.com

## Project Structure

```
app/
  (home)/          — Marketing homepage
  (auth)/          — Login + signup
  (dashboard)/     — Protected restaurant dashboard
  offers/[slug]/   — Public offer landing pages
  api/             — API routes (Stripe webhooks, etc.)
components/
  layout/          — Nav, Footer, Logo
  ui/              — Buttons, inputs, cards
  dashboard/       — Dashboard-specific components
  landing/         — Landing page components
lib/
  supabase/        — Client + server Supabase clients
  stripe.ts        — Stripe client + plan config
  resend.ts        — Email templates
types/             — TypeScript types
supabase/
  schema.sql       — Database schema (run once in Supabase)
```

## Contacts
- Cliff Hilton: (502) 881-4235
- Joel Gerdis: (502) 489-4673
- hello@queuepon.com
