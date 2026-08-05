'use client'

import Link from 'next/link'
import { Logo } from '@/components/layout/Logo'

const HERO_IMAGE = 'https://dvxmwudqmpyudfggmadm.supabase.co/storage/v1/object/public/images/chef-sizzle.jpg'

const growthPlans = [
  {
    key: 'grow',
    name: 'Grow',
    tag: 'Single location · Just starting out',
    regularPrice: 299,
    testDrivePrice: 99,
    savings: 200,
    coupon: 'getgrow',
    popular: false,
    features: ['1 Active Offer / 1 Active Ad', 'Single landing page', '4-email automated sequence', 'ZIP code targeting', 'Owner dashboard'],
  },
  {
    key: 'expand',
    name: 'Expand',
    tag: 'Growing restaurants ready to amplify',
    regularPrice: 499,
    testDrivePrice: 199,
    savings: 300,
    coupon: 'getexpand',
    popular: true,
    features: ['2 Active Offers / 2 Active Ads', '4-email sequence + comment entry', 'ZIP code targeting', 'Owner dashboard'],
  },
  {
    key: 'thrive',
    name: 'Thrive',
    tag: 'Multi-location · Franchises',
    regularPrice: 799,
    testDrivePrice: 299,
    savings: 500,
    coupon: 'getthrive',
    popular: false,
    features: ['4 Active Offers / 4 Active Ads', 'Multi-location (up to 3)', '4-email sequence + contest offer*', 'Marketplace prioritization', 'Owner dashboard'],
  },
]

export default function GrowthPage() {
  return (
    <div className="min-h-screen bg-cream">

      {/* Stripped nav — logo only */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-white border-b border-cream-dark flex items-center px-6 md:px-10 shadow-sm">
        <Link href="/"><Logo variant="dark" size="md"/></Link>
      </nav>

      {/* Hero */}
      <div className="relative pt-16">
        <img src={HERO_IMAGE} alt="180-Day Growth Planner"
          className="w-full h-72 md:h-96 object-cover"/>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"/>
        <div className="absolute bottom-0 left-0 right-0 text-center pb-10 px-4">
          <div className="inline-block bg-white/20 text-yellow-300 text-xs font-bold tracking-widest uppercase px-4 py-2 rounded-full">
            LOCAL-FIRST · DONE FOR YOU
          </div>
          <h1 className="text-4xl font-black text-white mt-3">180-Day Growth Planner</h1>
          <p className="text-white/80 text-lg mt-2">See your realistic 6-month flywheel</p>
        </div>
      </div>

      {/* Two-column: content left, iframe right */}
      <section className="bg-cream py-12 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-12 gap-8 items-start">

          {/* Left */}
          <div className="md:col-span-5 pt-4">
            <h2 className="text-2xl font-bold text-tan">See exactly how Queuepon grows your restaurant</h2>
            <p className="text-tan-light leading-relaxed mt-4">
              Answer 5 quick questions about your restaurant. We'll show you how many new customers each plan brings in over 180 days — and when you'll hit your growth goal.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                'Based on your actual ticket size and monthly orders',
                'Shows the compounding flywheel effect over 6 months',
                'Takes 2 minutes — no signup required',
              ].map(item => (
                <li key={item} className="flex items-start gap-3 text-sm text-tan">
                  <span className="text-blue font-bold mt-0.5 flex-shrink-0">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <div className="bg-blue-xpale border border-blue-pale rounded-xl p-4 mt-8">
              <div className="text-xs font-bold text-blue-dark uppercase tracking-wider mb-3">💡 Tips for best results</div>
              <ul className="space-y-2 text-sm text-tan-light">
                <li>Average ticket: think about your most common order — not your highest</li>
                <li>Monthly orders: include all transactions, dine-in and takeout</li>
                <li>Growth goal: most restaurants aim for 10–25% in 6 months</li>
                <li>Repeat rate: what % of customers come back within 90 days?</li>
              </ul>
            </div>
          </div>

          {/* Right — iframe overlaps hero on desktop */}
          <div className="md:col-span-7 md:-mt-32">
            <div className="bg-white rounded-2xl shadow-card-lg overflow-hidden">
              <iframe
                src="/growth-calc.html"
                className="w-full"
                style={{ height: '720px', border: 'none' }}
                title="180-Day Growth Planner"/>
            </div>
          </div>

        </div>
      </section>

      {/* Test drive pricing */}
      <section className="bg-blue-deeper py-16 px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">Ready to test drive Queuepon?</h2>
          <p className="text-white/70 mt-3 max-w-xl mx-auto">
            Go through the calculator above and claim your test drive rate below. Available exclusively through this page.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-10">
          {growthPlans.map(plan => (
            <div key={plan.key}
              className={`bg-white rounded-2xl p-8 relative ${plan.popular ? 'border-2 border-blue' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider whitespace-nowrap">
                  Most Popular
                </div>
              )}
              <div className="text-lg font-bold text-tan">{plan.name}</div>
              <div className="text-xs text-tan-light mt-1">{plan.tag}</div>
              <div className="mt-4">
                <span className="line-through text-tan-light text-lg">${plan.regularPrice}</span>
                <span className="text-4xl font-black text-blue ml-2">${plan.testDrivePrice}</span>
                <span className="text-tan-light text-sm">/mo</span>
              </div>
              <div className="inline-block bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full mt-2">
                Save ${plan.savings} first month
              </div>
              <ul className="mt-4 space-y-2">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-tan">
                    <span className="text-blue font-bold mt-0.5 flex-shrink-0">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={`/signup?plan=${plan.key}&coupon=${plan.coupon}`}
                className="btn-primary w-full mt-6 block text-center">
                Claim {plan.name} Rate →
              </Link>
            </div>
          ))}
        </div>
        <p className="text-center text-white/40 text-xs mt-8 max-w-2xl mx-auto">
          Test drive pricing available exclusively through this page. Regular pricing applies at queuepon.com. *Estimated results based on typical Meta performance for localized restaurant campaigns. Actual reach and results vary.
        </p>
      </section>

      {/* Footer */}
      <footer className="bg-tan text-white">
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-16 grid md:grid-cols-4 gap-10">
          <div className="md:col-span-1">
            <Logo variant="white" size="md"/>
            <p className="text-sm text-white/65 mt-4 leading-relaxed max-w-xs">
              Done-for-you Meta ads that turn local restaurants into local favorites — all on autopilot.
            </p>
            <div className="mt-6 space-y-2.5">
              <a href="mailto:hello@queuepon.com" className="flex items-center gap-2 text-sm text-white/65 hover:text-white transition-colors">
                ✉️ hello@queuepon.com
              </a>
            </div>
          </div>
          {[
            { title: 'Platform',  links: [['How It Works', 'https://queuepon.com/#how-it-works'], ['Pricing', 'https://queuepon.com/#pricing'], ['Log In', '/login'], ['Sign Up', '/signup']] },
            { title: 'Investors', links: [['Investor Overview', '/investor'], ['Investment Terms', '/investor#terms'], ['Request Full Deck', 'mailto:hello@queuepon.com?subject=Investor Deck']] },
            { title: 'Resources', links: [['FAQ', '/faq'], ['Contact Us', 'mailto:hello@queuepon.com'], ['Privacy Policy', '/privacy'], ['Terms of Service', '/terms']] },
          ].map(col => (
            <div key={col.title}>
              <div className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">{col.title}</div>
              <div className="space-y-3">
                {col.links.map(([label, href]) => (
                  <a key={label} href={href} className="block text-sm text-white/65 hover:text-white transition-colors">{label}</a>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-white/10 px-6 md:px-10 py-5 max-w-6xl mx-auto flex flex-wrap justify-between gap-3 text-xs text-white/35">
          <span>© 2026 Queuepon · Louisville, KY · All rights reserved</span>
          <span>Built with ♥ in Louisville</span>
        </div>
      </footer>

    </div>
  )
}
