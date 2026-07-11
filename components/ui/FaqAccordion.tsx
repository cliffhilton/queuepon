'use client'

import { useState } from 'react'
import Link from 'next/link'

const FAQS = [
  {
    q: 'How quickly can I get started?',
    a: 'Most restaurants are live within 24 hours of completing signup. Once your payment is processed, we create your Meta ad campaign, landing page, and email sequence automatically.',
  },
  {
    q: 'Do you create the ads for us?',
    a: 'Yes — we handle everything. You provide your offer details and a photo, and we build the Facebook and Instagram ad creative, write the copy, set up targeting, and launch the campaign.',
  },
  {
    q: 'What kind of offer should I run?',
    a: 'The best-performing offers are simple and have clear value: BOGO deals, free appetizer with entree, a discount on a first visit, or a free dessert. We\'ll help you choose during setup.',
  },
  {
    q: 'Is Meta (Facebook/Instagram) ad spend included?',
    a: 'Yes, it\'s built into your plan. Grow includes $50/mo in ad spend, Expand includes $150/mo, and Thrive includes $350/mo. No separate ad account billing required.',
  },
  {
    q: 'How do customers claim the offer?',
    a: 'They click your ad, land on a branded page, and enter their email to claim the offer. That email goes into your Queuepon list. They show the confirmation email at your counter — no printing needed.',
  },
  {
    q: 'What happens after someone claims my offer?',
    a: 'They receive your offer by email, then an automated follow-up sequence encourages them to come back and tell friends. Your customer list grows with every new signup.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. You can cancel anytime from your dashboard with no cancellation fees. Your campaign runs through the end of the billing period and then stops.',
  },
  {
    q: 'What if I have multiple locations?',
    a: 'The Thrive plan supports multiple locations and can run separate campaigns per ZIP code. Contact us at hello@queuepon.com to discuss a custom setup.',
  },
]

interface Props {
  limit?: number
  showAllLink?: boolean
}

export function FaqAccordion({ limit, showAllLink }: Props) {
  const [open, setOpen] = useState<number | null>(null)
  const items = limit ? FAQS.slice(0, limit) : FAQS

  return (
    <div className="max-w-2xl mx-auto">
      <div className="space-y-3">
        {items.map((faq, i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-cream-dark overflow-hidden transition-shadow hover:shadow-card"
          >
            <button
              className="w-full text-left px-6 py-5 flex items-center justify-between gap-4"
              onClick={() => setOpen(open === i ? null : i)}
            >
              <span className="font-semibold text-tan">{faq.q}</span>
              <span className={`text-blue flex-shrink-0 text-xl font-light transition-transform duration-200 ${open === i ? 'rotate-45' : ''}`}>+</span>
            </button>
            {open === i && (
              <div className="px-6 pb-5 text-tan-light leading-relaxed border-t border-cream-dark pt-4">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>

      {showAllLink && (
        <div className="text-center mt-8">
          <Link href="/faq" className="text-blue font-semibold hover:underline text-sm">
            See all FAQs →
          </Link>
        </div>
      )}

      {/* Dot indicators */}
      <div className="flex justify-center items-center gap-2 mt-6">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => setOpen(open === i ? null : i)}
            className={`rounded-full transition-all duration-200 ${
              i === open ? 'w-6 h-2 bg-blue' : 'w-2 h-2 bg-tan-light/30 hover:bg-tan-light/60'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
