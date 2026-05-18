-- ── Run this in your Supabase SQL editor ──────────────────────────────────────

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── RESTAURANTS ───────────────────────────────────────────────────────────────
create table restaurants (
  id                    uuid primary key default uuid_generate_v4(),
  user_id               uuid references auth.users(id) on delete cascade,
  name                  text not null,
  owner_first           text not null,
  owner_last            text not null,
  email                 text not null,
  phone                 text,
  zip_code              text not null,
  address               text,
  restaurant_type       text not null default 'Quick Service',
  plan                  text not null default 'grow' check (plan in ('grow','expand','thrive')),
  plan_price            integer not null default 199,
  stripe_customer_id    text unique,
  stripe_subscription_id text unique,
  status                text not null default 'active' check (status in ('active','paused','cancelled')),
  meta_ad_status        text not null default 'setting_up' check (meta_ad_status in ('setting_up','live','paused')),
  created_at            timestamptz default now()
);

-- RLS
alter table restaurants enable row level security;
create policy "Restaurants: owner access"
  on restaurants for all
  using (auth.uid() = user_id);

-- ── OFFERS ────────────────────────────────────────────────────────────────────
create table offers (
  id              uuid primary key default uuid_generate_v4(),
  restaurant_id   uuid references restaurants(id) on delete cascade,
  title           text not null,
  description     text,
  offer_type      text not null default 'free_item',
  status          text not null default 'draft' check (status in ('draft','live','expired')),
  slug            text unique not null,
  expiry_date     date,
  subscriber_count integer default 0,
  created_at      timestamptz default now()
);

alter table offers enable row level security;
create policy "Offers: restaurant owner access"
  on offers for all
  using (
    restaurant_id in (
      select id from restaurants where user_id = auth.uid()
    )
  );

-- Public read for landing pages
create policy "Offers: public read live offers"
  on offers for select
  using (status = 'live');

-- ── CUSTOMERS ─────────────────────────────────────────────────────────────────
create table customers (
  id                uuid primary key default uuid_generate_v4(),
  restaurant_id     uuid references restaurants(id) on delete cascade,
  offer_id          uuid references offers(id) on delete set null,
  email             text not null,
  first_name        text,
  last_name         text,
  sequence_status   text not null default 'active' check (sequence_status in ('active','completed','unsubscribed')),
  emails_sent       integer default 0,
  created_at        timestamptz default now(),
  unique(restaurant_id, email)
);

alter table customers enable row level security;
create policy "Customers: restaurant owner access"
  on customers for all
  using (
    restaurant_id in (
      select id from restaurants where user_id = auth.uid()
    )
  );

-- ── META AD STATS ─────────────────────────────────────────────────────────────
create table meta_ad_stats (
  id                uuid primary key default uuid_generate_v4(),
  restaurant_id     uuid references restaurants(id) on delete cascade,
  week_start        date not null,
  impressions       integer default 0,
  clicks            integer default 0,
  estimated_visits  integer default 0,
  ctr               numeric(5,2) default 0,
  spend             numeric(8,2) default 0,
  created_at        timestamptz default now()
);

alter table meta_ad_stats enable row level security;
create policy "Meta stats: restaurant owner access"
  on meta_ad_stats for all
  using (
    restaurant_id in (
      select id from restaurants where user_id = auth.uid()
    )
  );

-- ── TRIGGER: update subscriber count when customer added ──────────────────────
create or replace function increment_subscriber_count()
returns trigger as $$
begin
  update offers
  set subscriber_count = subscriber_count + 1
  where id = NEW.offer_id;
  return NEW;
end;
$$ language plpgsql;

create trigger on_customer_created
  after insert on customers
  for each row execute procedure increment_subscriber_count();
