# public-energy-solutions

Official repo of PublicEnergySolutions — website of **Public Energy Solutions (PES)**, an
energy-market consultancy for public-sector bodies and mid-size companies.

## Pages

| Route                  | Content                                                                    |
|------------------------|----------------------------------------------------------------------------|
| `/`                    | Home: audiences, services (draft wording), placeholders for references     |
| `/european-gas-market` | Educational overview of the European gas market, every section sourced     |
| `/gas-prices`          | Prices read from `data/gas-prices.csv`: chart, sortable table, hub filter, loading / empty / error states |
| `/contact`             | Contact form → email to `contact@public-energy-solutions.com`              |

## Stack

- Next.js 16 (App Router, TypeScript, Turbopack), React 19
- Plain CSS (global design tokens in `src/app/globals.css` + CSS Modules), navy / white / teal
- Nodemailer (SMTP) for the contact form
- Vitest for unit tests, ESLint (`eslint-config-next`)

## Project structure

```
data/                     price CSV + format documentation (data/README.md)
src/content/              page copy and sourced content (no logic)
src/lib/prices/           CSV parser, sorting, server-side loader
src/lib/contact/          shared validation (client + server), SMTP mailer (server only)
src/components/           reusable UI components
src/app/                  routes, pages and API route handlers
  api/contact/route.ts    POST: validate, honeypot check, send email
  api/prices/route.ts     GET: read + parse the price file
agent_actions.log         log of actions taken by the AI agent on this repo
```

## Setup

Requires Node.js 20.9+ (developed with Node 22).

```bash
npm install
cp .env.example .env.local   # then fill in SMTP values
npm run dev                  # http://localhost:3000
```

## Environment variables

All secrets are read **server-side only** (none use the `NEXT_PUBLIC_` prefix). Never commit `.env*` files
except `.env.example`.

| Variable             | Required | Description                                                       |
|----------------------|----------|-------------------------------------------------------------------|
| `SMTP_HOST`          | yes      | SMTP server hostname                                              |
| `SMTP_PORT`          | no       | Default `587`                                                     |
| `SMTP_SECURE`        | no       | `true` for implicit TLS; defaults to `true` only on port 465      |
| `SMTP_USER`          | yes      | SMTP username                                                     |
| `SMTP_PASSWORD`      | yes      | SMTP password / API key                                           |
| `CONTACT_FROM_EMAIL` | yes      | Sender address, must be authorised by the SMTP provider           |
| `CONTACT_TO_EMAIL`   | no       | Recipient, default `contact@public-energy-solutions.com`          |
| `PRICE_DATA_FILE`    | no       | Price CSV path relative to project root, default `data/gas-prices.csv` |

If SMTP is not configured the form still validates, but submission shows a clear
"could not be sent" error (and the server logs which variable is missing).

## Gas price data

The site **never invents prices**. `data/gas-prices.csv` ships with a header only, so the page shows its
"No price data published yet" state. Add real, sourced rows following [`data/README.md`](data/README.md);
check that you are licensed to republish the figures. Invalid rows are skipped and listed on the page.

## Scripts

```bash
npm run lint        # ESLint
npm run typecheck   # tsc --noEmit
npm test            # Vitest (contact validation + price-file parsing)
npm run build       # production build
npm run check       # all of the above
npm start           # serve the production build
```

## Deployment

Any Node.js host works (the contact form and price API need a server, so a static export is not possible).

**Vercel**: import the GitHub repo, set the environment variables above in *Project → Settings →
Environment Variables*, deploy. `next.config.ts` includes `data/` in the server bundle via
`outputFileTracingIncludes`. Updating prices = commit a new CSV and redeploy.

**Self-hosted**: `npm ci && npm run build && npm start` (port via `PORT`), behind a reverse proxy with HTTPS.
The CSV is read on every request, so it can be replaced on disk without rebuilding.

Before going live, also set up SPF/DKIM for the sender domain so contact emails are delivered.

## Content still to provide (placeholders on the site)

- Legal entity, registration number and address (footer) — `src/content/site.ts` → `legal`
- Confirmed service descriptions — `src/content/site.ts` → `home.services`
- Client references / testimonials (only with client approval)
- Privacy notice (linked from the contact form)
- Real gas price data — `data/gas-prices.csv`

The European Gas Market page lists its last review date (`src/content/gasMarket.ts`); recheck the
linked regulations when updating it.
