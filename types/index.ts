// ── Restaurant ────────────────────────────────────────────────────────────────
export interface Restaurant {
  id: string
  user_id: string
  name: string
  owner_first: string
  owner_last: string
  email: string
  phone?: string
  zip_code: string
  address?: string
  restaurant_type: string
  plan: 'grow' | 'expand' | 'thrive'
  plan_price: number
  stripe_customer_id?: string
  stripe_subscription_id?: string
  status: 'active' | 'paused' | 'cancelled'
  meta_ad_status: 'setting_up' | 'live' | 'paused'
  created_at: string
}

// ── Offer ─────────────────────────────────────────────────────────────────────
export interface Offer {
  id: string
  restaurant_id: string
  title: string
  description: string
  offer_type: 'free_item' | 'percent_off' | 'dollar_off' | 'bogo'
  status: 'draft' | 'live' | 'expired'
  slug: string
  expiry_date?: string
  subscriber_count: number
  created_at: string
  restaurant?: Restaurant
}

// ── Customer ──────────────────────────────────────────────────────────────────
export interface Customer {
  id: string
  restaurant_id: string
  offer_id: string
  email: string
  first_name?: string
  last_name?: string
  sequence_status: 'active' | 'completed' | 'unsubscribed'
  emails_sent: number
  created_at: string
}

// ── Meta Ad Stats ─────────────────────────────────────────────────────────────
export interface MetaAdStats {
  id: string
  restaurant_id: string
  week_start: string
  impressions: number
  clicks: number
  estimated_visits: number
  ctr: number
  spend: number
}

// ── Signup form ───────────────────────────────────────────────────────────────
export interface SignupFormData {
  firstName: string
  lastName: string
  restaurantName: string
  email: string
  phone: string
  zipCode: string
  restaurantType: string
  address: string
  plan: 'grow' | 'expand' | 'thrive'
}
