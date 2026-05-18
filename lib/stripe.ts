import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
  typescript: true,
})

export const PLANS = {
  grow: {
    name: 'Grow',
    price: 199,
    priceId: process.env.STRIPE_PRICE_GROW!,
    adSpend: '$50/mo',
    offers: 3,
    emails: 4,
  },
  expand: {
    name: 'Expand',
    price: 499,
    priceId: process.env.STRIPE_PRICE_EXPAND!,
    adSpend: '$150/mo',
    offers: 10,
    emails: 8,
  },
  thrive: {
    name: 'Thrive',
    price: 799,
    priceId: process.env.STRIPE_PRICE_THRIVE!,
    adSpend: '$350/mo',
    offers: -1, // unlimited
    emails: -1,
  },
} as const

export type PlanKey = keyof typeof PLANS
