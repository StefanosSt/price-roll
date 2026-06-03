-- ============================================================================
-- Price Roll — multi-tenant price-history schema (Supabase / Postgres)
--
-- This file is the SOURCE OF TRUTH for the production database. Prisma cannot
-- express native partitioning or row-level security, so those live here.
-- The Prisma models in prisma/schema.prisma mirror these tables for the app's
-- TypeScript client and local dev.
--
-- TENANCY MODEL: single database, shared tables, every row scoped by store_id,
-- with Row-Level Security so each store is COMPLETELY isolated from the others
-- (logically equivalent to a separate DB per store, but operable for 1000+).
--
-- CORE FEATURE: `price_changes` — an append-only log of every price change.
--
-- MONEY: stored as integer MINOR UNITS (e.g. cents). "19.99" EUR -> 1999.
-- The number of decimals is per-currency (EUR=2, JPY=0, BHD=3) and is recorded
-- on the store as `currency_exponent`. This keeps money exact AND tiny in the
-- billion-row log.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- shared helper: keep updated_at fresh
-- ----------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ============================================================================
-- 1) stores — the tenant root. One row per installed shop. Everything FKs here.
-- ============================================================================
create table if not exists stores (
  id                bigint generated always as identity primary key, -- compact internal tenant key
  shop_domain       text not null unique,            -- my-store.myshopify.com
  shopify_gid       text,                            -- gid://shopify/Shop/123
  name              text,
  currency_code     text   not null default 'USD',   -- ISO 4217, from Shop.currencyCode
  currency_exponent smallint not null default 2,     -- minor-unit decimals for the currency
  status            text   not null default 'active',-- active | uninstalled
  installed_at      timestamptz not null default now(),
  uninstalled_at    timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

drop trigger if exists trg_stores_updated_at on stores;
create trigger trg_stores_updated_at before update on stores
  for each row execute function set_updated_at();

-- ============================================================================
-- 2) products — grouping for variants. Scoped to a store.
-- ============================================================================
create table if not exists products (
  id                 bigint generated always as identity primary key,
  store_id           bigint not null references stores (id) on delete cascade,
  shopify_product_id bigint not null,                -- numeric id from the payload
  gid                text,                           -- gid://shopify/Product/123
  title              text,
  handle             text,
  status             text,                           -- active | draft | archived
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  unique (store_id, shopify_product_id)              -- same product id can exist in different stores
);

create index if not exists idx_products_store on products (store_id);

drop trigger if exists trg_products_updated_at on products;
create trigger trg_products_updated_at before update on products
  for each row execute function set_updated_at();

-- ============================================================================
-- 3) variants — CURRENT snapshot, one row per variant, updated in place.
--    This table is BOUNDED (it never grows beyond the catalog size).
-- ============================================================================
create table if not exists variants (
  id                       bigint generated always as identity primary key, -- compact key used by the log
  store_id                 bigint not null references stores (id)   on delete cascade,
  product_id               bigint references products (id) on delete cascade,
  shopify_variant_id       bigint not null,          -- numeric id from the payload
  gid                      text,                     -- gid://shopify/ProductVariant/123
  title                    text,                     -- "Large / Red"
  sku                      text,
  barcode                  text,
  position                 int,
  current_price            bigint,                   -- minor units (cents)
  current_compare_at_price bigint,
  shopify_updated_at       timestamptz,              -- updated_at as reported by Shopify
  first_seen_at            timestamptz not null default now(),
  updated_at               timestamptz not null default now(),
  unique (store_id, shopify_variant_id)
);

create index if not exists idx_variants_store   on variants (store_id);
create index if not exists idx_variants_product on variants (product_id);

drop trigger if exists trg_variants_updated_at on variants;
create trigger trg_variants_updated_at before update on variants
  for each row execute function set_updated_at();

-- ============================================================================
-- 4) price_changes — THE LOG. Append-only. Partitioned monthly by changed_at.
--    Money as minor units, variant referenced by compact bigint, store_id
--    denormalized for fast per-store queries, partition pruning and RLS.
-- ============================================================================
create table if not exists price_changes (
  id               bigint generated always as identity,
  store_id         bigint not null,
  variant_id       bigint not null,
  price            bigint,                           -- minor units
  compare_at_price bigint,
  source           text   not null default 'webhook',-- webhook | app | manual | bulk | import | backfill
  changed_at       timestamptz not null default now(),
  primary key (id, changed_at),                      -- partition key must be in the PK
  foreign key (store_id)   references stores (id)   on delete cascade,
  foreign key (variant_id) references variants (id) on delete cascade
) partition by range (changed_at);

-- Indexes on the parent propagate to every partition.
create index if not exists idx_price_changes_variant
  on price_changes (store_id, variant_id, changed_at desc); -- "this variant's history, newest first"
create index if not exists idx_price_changes_store_time
  on price_changes (store_id, changed_at desc);             -- "everything in a date range for a store"

-- Initial partitions. In production, auto-create future months with pg_partman
-- + pg_cron (both available on Supabase). A DEFAULT partition catches anything
-- that lands outside the defined ranges so inserts never fail.
create table if not exists price_changes_2026_06 partition of price_changes
  for values from ('2026-06-01') to ('2026-07-01');
create table if not exists price_changes_2026_07 partition of price_changes
  for values from ('2026-07-01') to ('2026-08-01');
create table if not exists price_changes_default partition of price_changes default;

-- ----------------------------------------------------------------------------
-- Auto-log trigger (DISABLED).
--
-- The app records price changes in CODE (app/lib/price-history.server.js) so the
-- behavior is identical on local SQLite and on Postgres. This trigger is an
-- ALTERNATIVE that would log changes at the DB level — do NOT enable it while the
-- app logs in code, or every change would be recorded twice. Kept here, commented
-- out, in case you ever want the DB to be the source of truth instead.
-- ----------------------------------------------------------------------------
-- create or replace function log_price_change()
-- returns trigger as $$
-- begin
--   if (new.current_price            is distinct from old.current_price)
--   or (new.current_compare_at_price is distinct from old.current_compare_at_price) then
--     insert into price_changes (store_id, variant_id, price, compare_at_price, source)
--     values (new.store_id, new.id, new.current_price, new.current_compare_at_price, 'webhook');
--   end if;
--   return new;
-- end;
-- $$ language plpgsql;
--
-- drop trigger if exists trg_log_price_change on variants;
-- create trigger trg_log_price_change after update on variants
--   for each row execute function log_price_change();

-- ============================================================================
-- 5) ROW-LEVEL SECURITY — complete per-store isolation.
--
-- Your backend resolves the shop from the Shopify session, then sets the tenant
-- for the connection/transaction:
--     SELECT set_config('app.current_store_id', '42', true);
-- After that, EVERY query automatically sees only store 42's rows. A missing or
-- wrong store_id returns zero rows — stores can never read each other's data.
--
-- NOTE: the Postgres role that owns the tables / a Supabase service_role BYPASSES
-- RLS. Use a non-bypassing application role for request-time queries, or always
-- set app.current_store_id and additionally filter by store_id in app code.
-- ============================================================================
alter table stores        enable row level security;
alter table products      enable row level security;
alter table variants      enable row level security;
alter table price_changes enable row level security;

create policy store_isolation_self on stores
  using (id = nullif(current_setting('app.current_store_id', true), '')::bigint);

create policy store_isolation_products on products
  using (store_id = nullif(current_setting('app.current_store_id', true), '')::bigint);

create policy store_isolation_variants on variants
  using (store_id = nullif(current_setting('app.current_store_id', true), '')::bigint);

create policy store_isolation_price_changes on price_changes
  using (store_id = nullif(current_setting('app.current_store_id', true), '')::bigint);
