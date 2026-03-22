# LandlordMap

A full-stack SaaS platform for UK private landlords to manage properties, tenants, maintenance, finances, and documents — with an interactive Mapbox map and AI assistant powered by Claude.

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Database | Supabase (PostgreSQL + Auth + Storage) |
| Styling | Tailwind CSS |
| AI | Anthropic Claude (claude-sonnet-4) |
| Maps | Mapbox GL JS |
| Payments | Stripe |
| Email | Resend |
| UI primitives | Radix UI |
| Icons | Lucide React |

---

## Local setup

### 1. Clone and install

```bash
git clone <your-repo>
cd landlordmap
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Then fill in all values in `.env.local` (see Environment variables below).

### 3. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and paste the full SQL schema below
3. Copy your project URL and anon key to `.env.local`

### 4. Set up Stripe

1. Create an account at [stripe.com](https://stripe.com)
2. Create two products: **Pro** (£19/mo) and **Agency** (£49/mo)
3. Copy the price IDs to your `.env.local`
4. Install the Stripe CLI and run: `stripe listen --forward-to localhost:3000/api/stripe/webhook`

### 5. Set up Mapbox

1. Create an account at [mapbox.com](https://mapbox.com)
2. Create a public token
3. Add it to `NEXT_PUBLIC_MAPBOX_TOKEN` in `.env.local`

### 6. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key (safe to expose) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only, never expose) |
| `ANTHROPIC_API_KEY` | Anthropic API key for Claude |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_SECRET_KEY` | Stripe secret key (server-only) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `STRIPE_PRO_PRICE_ID` | Stripe price ID for Pro plan |
| `STRIPE_AGENCY_PRICE_ID` | Stripe price ID for Agency plan |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Mapbox public access token |
| `RESEND_API_KEY` | Resend API key for emails |
| `RESEND_FROM_EMAIL` | From address for outbound emails |

---

## Supabase SQL schema

Paste this into the Supabase SQL Editor to create all tables and RLS policies:

```sql
-- ============================================================
-- LandlordMap — Full SQL Schema
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- ORGANISATIONS
-- ============================================================
create table organisations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  logo_url text,
  plan text not null default 'starter' check (plan in ('starter', 'pro', 'agency')),
  stripe_customer_id text,
  subdomain text,
  created_at timestamptz default now()
);

-- ============================================================
-- ORGANISATION MEMBERS
-- ============================================================
create table organisation_members (
  id uuid primary key default uuid_generate_v4(),
  organisation_id uuid references organisations(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text not null default 'owner' check (role in ('owner', 'admin', 'member')),
  created_at timestamptz default now(),
  unique(organisation_id, user_id)
);

-- ============================================================
-- PROPERTIES
-- ============================================================
create table properties (
  id uuid primary key default uuid_generate_v4(),
  organisation_id uuid references organisations(id) on delete cascade,
  title text not null,
  address text not null,
  area text,
  bedrooms integer not null default 1,
  bathrooms numeric not null default 1,
  rent numeric not null default 0,
  status text not null default 'vacant'
    check (status in ('occupied', 'vacant', 'maintenance', 'expiring_soon')),
  photo_url text,
  description text,
  epc_rating text,
  council_tax_band text,
  lat numeric,
  lng numeric,
  created_at timestamptz default now()
);

-- ============================================================
-- TENANTS
-- ============================================================
create table tenants (
  id uuid primary key default uuid_generate_v4(),
  organisation_id uuid references organisations(id) on delete cascade,
  property_id uuid references properties(id) on delete set null,
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text,
  lease_start date not null,
  lease_end date not null,
  rent_amount numeric not null default 0,
  deposit_amount numeric,
  status text not null default 'active'
    check (status in ('active', 'notice_given', 'ended')),
  notes text,
  created_at timestamptz default now()
);

-- ============================================================
-- MAINTENANCE REQUESTS
-- ============================================================
create table maintenance_requests (
  id uuid primary key default uuid_generate_v4(),
  organisation_id uuid references organisations(id) on delete cascade,
  property_id uuid references properties(id) on delete cascade,
  tenant_id uuid references tenants(id) on delete set null,
  title text not null,
  description text not null,
  priority text not null default 'medium'
    check (priority in ('low', 'medium', 'urgent')),
  status text not null default 'reported'
    check (status in ('reported', 'in_progress', 'resolved')),
  photo_url text,
  contractor text,
  notes text,
  reported_at timestamptz default now(),
  resolved_at timestamptz
);

-- ============================================================
-- MAINTENANCE NOTES
-- ============================================================
create table maintenance_notes (
  id uuid primary key default uuid_generate_v4(),
  maintenance_request_id uuid references maintenance_requests(id) on delete cascade,
  user_id uuid references auth.users(id),
  content text not null,
  created_at timestamptz default now()
);

-- ============================================================
-- RENT PAYMENTS
-- ============================================================
create table rent_payments (
  id uuid primary key default uuid_generate_v4(),
  organisation_id uuid references organisations(id) on delete cascade,
  property_id uuid references properties(id) on delete cascade,
  tenant_id uuid references tenants(id) on delete cascade,
  amount numeric not null,
  period_month integer not null check (period_month between 1 and 12),
  period_year integer not null,
  paid_at timestamptz default now(),
  notes text
);

-- ============================================================
-- EXPENSES
-- ============================================================
create table expenses (
  id uuid primary key default uuid_generate_v4(),
  organisation_id uuid references organisations(id) on delete cascade,
  property_id uuid references properties(id) on delete set null,
  category text not null default 'other'
    check (category in ('repairs', 'insurance', 'agent_fees', 'utilities', 'other')),
  amount numeric not null,
  description text not null,
  date date not null default current_date
);

-- ============================================================
-- DOCUMENTS
-- ============================================================
create table documents (
  id uuid primary key default uuid_generate_v4(),
  organisation_id uuid references organisations(id) on delete cascade,
  property_id uuid references properties(id) on delete set null,
  tenant_id uuid references tenants(id) on delete set null,
  name text not null,
  type text not null default 'other'
    check (type in ('tenancy_agreement', 'gas_safety', 'epc', 'inventory', 'other')),
  file_url text not null,
  expiry_date date,
  created_at timestamptz default now()
);

-- ============================================================
-- AI CONVERSATIONS (optional — for saving chat history)
-- ============================================================
create table ai_conversations (
  id uuid primary key default uuid_generate_v4(),
  organisation_id uuid references organisations(id) on delete cascade,
  user_id uuid references auth.users(id),
  messages jsonb not null default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Enable RLS on all tables
alter table organisations enable row level security;
alter table organisation_members enable row level security;
alter table properties enable row level security;
alter table tenants enable row level security;
alter table maintenance_requests enable row level security;
alter table maintenance_notes enable row level security;
alter table rent_payments enable row level security;
alter table expenses enable row level security;
alter table documents enable row level security;
alter table ai_conversations enable row level security;

-- Helper function: get user's organisation IDs
create or replace function get_user_org_ids()
returns setof uuid
language sql
security definer
as $$
  select organisation_id from organisation_members
  where user_id = auth.uid()
$$;

-- Organisations: members can read their own orgs
create policy "Members can view their organisations"
  on organisations for select
  using (id in (select get_user_org_ids()));

create policy "Members can update their organisations"
  on organisations for update
  using (id in (select get_user_org_ids()));

-- Organisation members
create policy "Members can view org members"
  on organisation_members for select
  using (organisation_id in (select get_user_org_ids()));

create policy "Users can insert themselves as members"
  on organisation_members for insert
  with check (user_id = auth.uid());

-- Properties
create policy "Members can CRUD their properties"
  on properties for all
  using (organisation_id in (select get_user_org_ids()));

-- Tenants
create policy "Members can CRUD their tenants"
  on tenants for all
  using (organisation_id in (select get_user_org_ids()));

-- Tenant self-access: tenants can read their own record
create policy "Tenants can view their own record"
  on tenants for select
  using (email = (select email from auth.users where id = auth.uid()));

-- Maintenance requests
create policy "Members can CRUD their maintenance requests"
  on maintenance_requests for all
  using (organisation_id in (select get_user_org_ids()));

-- Tenants can insert and view their own maintenance requests
create policy "Tenants can create maintenance requests"
  on maintenance_requests for insert
  with check (
    tenant_id in (
      select id from tenants
      where email = (select email from auth.users where id = auth.uid())
    )
  );

create policy "Tenants can view their own maintenance requests"
  on maintenance_requests for select
  using (
    tenant_id in (
      select id from tenants
      where email = (select email from auth.users where id = auth.uid())
    )
  );

-- Rent payments
create policy "Members can CRUD rent payments"
  on rent_payments for all
  using (organisation_id in (select get_user_org_ids()));

-- Expenses
create policy "Members can CRUD expenses"
  on expenses for all
  using (organisation_id in (select get_user_org_ids()));

-- Documents
create policy "Members can CRUD documents"
  on documents for all
  using (organisation_id in (select get_user_org_ids()));

create policy "Tenants can view their documents"
  on documents for select
  using (
    tenant_id in (
      select id from tenants
      where email = (select email from auth.users where id = auth.uid())
    )
    or
    property_id in (
      select property_id from tenants
      where email = (select email from auth.users where id = auth.uid())
        and status = 'active'
    )
  );

-- AI conversations
create policy "Members can CRUD AI conversations"
  on ai_conversations for all
  using (organisation_id in (select get_user_org_ids()));

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================
-- Run in Supabase dashboard > Storage > Create bucket:
-- 1. "documents" — private, max 50MB per file
-- 2. "property-photos" — public, max 10MB per file

-- ============================================================
-- INDEXES
-- ============================================================
create index idx_properties_org on properties(organisation_id);
create index idx_tenants_org on tenants(organisation_id);
create index idx_tenants_property on tenants(property_id);
create index idx_maintenance_org on maintenance_requests(organisation_id);
create index idx_maintenance_property on maintenance_requests(property_id);
create index idx_documents_org on documents(organisation_id);
create index idx_org_members_user on organisation_members(user_id);
```

---

## Stripe setup

1. In your Stripe dashboard, create two recurring products:
   - **LandlordMap Pro** — £19/month
   - **LandlordMap Agency** — £49/month

2. Copy the price IDs (they look like `price_1234...`) to your `.env.local`

3. Set up a webhook endpoint pointing to `https://yourdomain.com/api/stripe/webhook` listening for:
   - `checkout.session.completed`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`

4. For local testing, use the Stripe CLI:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

---

## Mapbox setup

1. Create an account at [mapbox.com](https://mapbox.com)
2. Go to **Tokens** and create a new public token
3. Restrict it to your domain in production
4. Add it to `NEXT_PUBLIC_MAPBOX_TOKEN`

The map will show a fallback message if no token is provided, so it doesn't break local development.

To enable coordinates on your properties:
- Use Google Maps to find the lat/lng of each property address
- Enter them in the property edit form under "Latitude" and "Longitude"

---

## Vercel deployment

1. Push your code to GitHub
2. Import the repo in [vercel.com](https://vercel.com)
3. Add all environment variables from `.env.example`
4. Set the following:
   - Framework preset: **Next.js**
   - Build command: `next build`
   - Output directory: `.next`

5. After deploying, update your Stripe webhook URL to your Vercel domain
6. Update your Supabase **Authentication > URL Configuration**:
   - Site URL: `https://yourdomain.vercel.app`
   - Redirect URLs: `https://yourdomain.vercel.app/**`

---

## How to add properties

1. Sign up and complete onboarding
2. Go to **Properties** → **Add property**
3. Fill in the address, bedrooms, rent, and current status
4. Add lat/lng coordinates to enable map view
5. Upload a photo via the edit form
6. Add a tenant from **Tenants** → select a property

---

## How to use the AI assistant

1. Upgrade to Pro or Agency plan
2. Click the chat button (bottom-right of the dashboard)
3. Ask questions like:
   - "Which properties are vacant?"
   - "Summarise my open maintenance issues"
   - "Draft a rent increase letter for Oak Avenue"
   - "Which leases expire in the next 3 months?"

The AI has access to your real property, tenant, and maintenance data.

---

## Roadmap

- [ ] Stripe checkout integration (upgrade flow)
- [ ] In-app messaging between landlord and tenants
- [ ] Bulk rent collection tracking
- [ ] Xero/QuickBooks accounting integration
- [ ] Automated rent reminder emails via Resend
- [ ] PDF lease generation
- [ ] Property inspection checklists
- [ ] Multi-property yield calculator
- [ ] Section 21 / Section 8 notice generator (with legal caveats)
- [ ] HMO management features
- [ ] Rightmove / Zoopla listing integration
- [ ] Mobile app (React Native)

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m "Add my feature"`
4. Push and open a pull request

---

## Licence

MIT — see [LICENSE](LICENSE)
