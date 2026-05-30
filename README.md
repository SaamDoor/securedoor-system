# سام درب — Premium Luxury Security Door Platform

A world-class enterprise digital platform for a premium luxury security door manufacturer.

## Architecture

```
securedoor-system/
├── frontend/          # Next.js 15 App Router
│   ├── app/
│   │   ├── (shop)/           # Public storefront
│   │   ├── (auth)/           # Authentication
│   │   ├── (user)/           # Customer dashboard
│   │   └── (admin)/          # Enterprise admin panel
│   ├── components/
│   │   ├── ui/               # Core UI library
│   │   ├── layout/           # Navbar, Footer
│   │   ├── home/             # Homepage sections
│   │   ├── shop/             # Product components
│   │   ├── user/             # User dashboard
│   │   └── admin/            # Admin panel
│   ├── lib/
│   │   ├── supabase/         # Supabase client + storage
│   │   ├── api/              # Data fetching layer
│   │   ├── utils.ts          # Utilities (Persian, Jalali, etc.)
│   │   ├── constants.ts      # App constants
│   │   └── seo.ts            # SEO + JSON-LD schemas
│   ├── hooks/                # TanStack Query hooks
│   ├── store/                # Zustand (cart, auth)
│   └── types/                # TypeScript types
└── supabase/
    └── migrations/
        ├── 001_initial_schema.sql
        ├── 002_indexes_and_triggers.sql
        ├── 003_rls_policies.sql
        └── 004_seed_data.sql
```

## Tech Stack

- **Frontend:** Next.js 15, App Router, TypeScript, Tailwind CSS, Framer Motion
- **Database:** PostgreSQL (Supabase)
- **Auth:** JWT + Refresh Tokens + RBAC
- **State:** TanStack Query + Zustand
- **UI:** Custom luxury design system + Radix UI primitives
- **Deployment:** Vercel (Frontend) + Supabase (DB + Storage)

## Setup

```bash
cd frontend
cp .env.local.example .env.local
# Fill in your Supabase credentials
npm install
npm run dev
```

## Database Setup

Run migrations in order via Supabase SQL editor or CLI:

```bash
supabase db push
```

## Design System

- **Primary Font:** Peyda + IRANSansX + Vazirmatn (Persian)
- **Color:** Deep Black (#0B0B0B) + Royal Gold (#C8A85D)
- **Language:** 100% Persian (RTL, Jalali dates, Persian numbers)
- **Philosophy:** Rolex × Bentley × Bang & Olufsen in the door industry

## Platform Modules

| Module | Status |
|--------|--------|
| Homepage (13 sections) | ✅ |
| Product Catalog + Detail | ✅ |
| Authentication (Login/Register) | ✅ |
| User Dashboard | ✅ |
| Admin Dashboard | ✅ |
| Integration Center | ✅ |
| Database Schema (50+ tables) | ✅ |
| SEO + JSON-LD + Sitemap | ✅ |
| Row Level Security | ✅ |
| Persian Design System | ✅ |
