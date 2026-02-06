# Remember Her — Deployment Guide

## 1. Push to GitHub

```bash
cd remember-her
git init
git add .
git commit -m "Initial commit — Remember Her"
gh repo create remember-her --private --source=. --push
```

## 2. Set Up Clerk (Authentication)

1. Go to [clerk.com](https://clerk.com) and create a free account
2. Create a new application
3. Copy your **Publishable Key** and **Secret Key** from the Clerk dashboard

## 3. Set Up the Database

Option A — **Neon** (recommended, free tier):
1. Go to [neon.tech](https://neon.tech) and create a free project
2. Copy the connection string (it looks like `postgresql://user:pass@host/dbname?sslmode=require`)

Option B — **Vercel Postgres** (via the Vercel dashboard):
1. In your Vercel project settings, go to Storage → Create Database → Postgres
2. The `DATABASE_URL` env var will be auto-set

## 4. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and import your GitHub repo
2. Add these environment variables in the Vercel project settings:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_test_...` (from Clerk) |
| `CLERK_SECRET_KEY` | `sk_test_...` (from Clerk) |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/sign-up` |
| `DATABASE_URL` | Your Postgres connection string |

3. Deploy!

## 5. Run the Database Migration

After deploying, run this locally (with your DATABASE_URL set in `.env.local`):

```bash
npm install
npm run db:push
```

This creates the `entries` table in your database.

## Local Development

```bash
cp .env.example .env.local
# Fill in your Clerk keys and DATABASE_URL
npm install
npm run db:push
npm run dev
```

## Tech Stack

- **Next.js 16** (App Router)
- **Clerk** for authentication
- **Drizzle ORM** + **postgres.js** for database
- **Tailwind CSS v4** for styling
- **Vercel** for hosting
