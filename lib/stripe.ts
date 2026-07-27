import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
  typescript: true,
})

export const PLANS = {
  grow: {
    name: 'Grow',
    price: 299,
    priceId: process.env.STRIPE_PRICE_GROW!,
    audienceReach: '4,500–5,500',
    offerLimit: 1,
    locationLimit: 1,
  },
  expand: {
    name: 'Expand',
    price: 499,
    priceId: process.env.STRIPE_PRICE_EXPAND!,
    audienceReach: '9,000–10,000',
    offerLimit: 2,
    locationLimit: 1,
  },
  thrive: {
    name: 'Thrive',
    price: 799,
    priceId: process.env.STRIPE_PRICE_THRIVE!,
    audienceReach: '15,000–16,000',
    offerLimit: 4,
    locationLimit: 3,
  },
} as const

export type PlanKey = keyof typeof PLANS
