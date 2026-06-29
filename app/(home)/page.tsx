import Link from 'next/link'
import { Nav } from '@/components/layout/Nav'
import { Logo } from '@/components/layout/Logo'

const plans = [
  {
    key: 'grow',
    name: 'Grow',
    price: 199,
    adSpend: '$50/mo',
    tag: 'Single-location · Just starting out',
    features: ['Up to 3 active offers','Unlimited landing pages','4-email automated sequence','Zip code geo-targeting','Customer dashboard'],
    cta: 'Select Grow',
    variant: 'outline',
    popular: false,
  },
  {
    key: 'expand',
    name: 'Expand',
    price: 499,
    adSpend: '$150/mo',
    tag: 'Growing restaurants ready to amplify',
    features: ['Up to 10 active offers','Unlimited landing pages','8-email sequence + SMS','Zip + radius targeting','Referral campaigns','Full analytics dashboard'],
    cta: 'Select Expand',
    variant: 'primary',
    popular: true,
  },
  {
    key: 'thrive',
    name: 'Thrive',
    price: 799,
    adSpend: '$350/mo',
    tag: 'Multi-location · Franchises',
    features: ['Unlimited active offers','Multi-location support','Full email + SMS sequences','White-label landing pages','Monthly strategy call','Priority onboarding'],
    cta: 'Select Thrive',
    variant: 'secondary',
    popular: false,
  },
]

const steps = [
  { num: 1, title: 'Pick an Offer', sub: 'BOGO, % off, free item — whatever drives visits for your restaurant.' },
  { num: 2, title: 'We Build & Launch', sub: 'We create your landing page and run the Facebook + Instagram campaign.' },
  { num: 3, title: 'Customers Opt In', sub: 'They claim the offer by leaving their email — building your list.' },
  { num: 4, title: 'We Retarget & Grow', sub: 'Automated follow-up emails bring them back. Referral campaigns bring friends.' },
]

const resultRows = [
  { icon:'📧', label:'Email subscribers collected', val:'1,840', badge:'↑ 12%',   badgeClass:'badge-green' },
  { icon:'👣', label:'Estimated new foot traffic',  val:'248 visits', badge:'Live', badgeClass:'badge-live' },
  { icon:'📣', label:'Meta ad impressions',         val:'58,400', badge:'ZIP 40202', badgeClass:'badge-blue' },
  { icon:'💰', label:'Est. gross profit impact',    val:'+$11,200', badge:'↑ 6.2×', badgeClass:'badge-green' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-cream">
      <Nav />

      {/* ── HERO ────────────────────────────────────────────── */}
      <section className="pt-16 min-h-[90vh] bg-gradient-to-br from-blue-deeper via-blue to-blue-light flex items-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-100"
          style={{backgroundImage:'radial-gradient(circle,rgba(255,255,255,.06) 1px,transparent 1px)',backgroundSize:'40px 40px'}}/>
        <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-10 grid md:grid-cols-2 gap-14 items-center w-full py-20">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest mb-6">
              📍 Local-First · Done For You
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-5">
              Turning Ads into{' '}
              <span className="text-yellow-200">Customers</span>
              <br/>for Local Restaurants
            </h1>
            <p className="text-lg text-white/80 leading-relaxed mb-8 max-w-lg">
              Done-for-you Facebook and Instagram ads that actually convert — paired with custom landing pages that build your customer list automatically.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/signup" className="btn-white btn-lg text-base px-8 py-4">
                Claim Your Spot →
              </Link>
            </div>
            <div className="flex gap-8 mt-10 flex-wrap">
              {[['+ 23%','Avg. new customers'],['15%','Gross profit in 90 days'],['100%','Done for you']].map(([num,label]) => (
                <div key={label}>
                  <div className="text-2xl font-bold text-yellow-200">{num}</div>
                  <div className="text-xs text-white/60 mt-1">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Results card */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
            <div className="bg-blue-deeper px-6 py-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0">FJ</div>
              <div>
                <div className="text-sm font-bold text-white">Riverside Bistro — Beta Results</div>
                <div className="text-xs text-white/55 mt-0.5">Louisville, KY · 90-day campaign</div>
              </div>
            </div>
            {resultRows.map(row => (
              <div key={row.label} className="flex items-center gap-4 px-6 py-4 border-b border-cream-dark last:border-0">
                <div className="w-10 h-10 bg-blue-pale rounded-xl flex items-center justify-center text-lg flex-shrink-0">{row.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-tan-light">{row.label}</div>
                  <div className="text-lg font-bold text-tan leading-tight mt-0.5">{row.val}</div>
                </div>
                <span className={row.badgeClass}>{row.badge}</span>
              </div>
            ))}
            <div className="p-4 bg-blue-xpale">
              <Link href="/signup" className="btn-primary w-full text-sm">
                Get These Results →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────── */}
      <section id="how-it-works" className="section bg-white">
        <div className="max-w-6xl mx-auto px-6 md:px-10 text-center">
          <div className="eyebrow">The System</div>
          <h2 className="section-title text-tan mb-4">Four steps. <span className="text-blue">Zero hassle.</span></h2>
          <p className="section-sub max-w-lg mx-auto mb-14">We handle everything. Restaurant owners set it up once and watch customers walk in.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {steps.map((step, i) => (
              <div key={step.num} className="relative bg-cream rounded-xl p-6 text-left">
                <div className="w-11 h-11 rounded-full bg-blue text-white font-bold text-lg flex items-center justify-center mb-4 shadow-md">
                  {step.num}
                </div>
                <h3 className="font-bold text-tan mb-2">{step.title}</h3>
                <p className="text-sm text-tan-light leading-relaxed">{step.sub}</p>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 -right-4 z-10 text-blue text-xl font-bold leading-none select-none">→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ─────────────────────────────────────────── */}
      <section id="pricing" className="section bg-cream">
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          <div className="text-center mb-14">
            <div className="eyebrow">Plans & Pricing</div>
            <h2 className="section-title text-tan mb-4">Simple. Transparent. <span className="text-blue">All-inclusive.</span></h2>
            <p className="section-sub max-w-md mx-auto">Meta ad spend is baked into every plan. We run the ads. You get the customers.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map(plan => (
              <div key={plan.key}
                className={`bg-white rounded-2xl p-8 border-2 transition-all duration-200 hover:-translate-y-1 hover:shadow-card-lg relative
                  ${plan.popular ? 'border-blue shadow-card' : 'border-cream-dark hover:border-blue'}`}>
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider whitespace-nowrap">
                    Most Popular
                  </div>
                )}
                <div className="text-xl font-bold text-tan mb-1">{plan.name}</div>
                <div className="text-xs text-tan-light mb-4">{plan.tag}</div>
                <div className="text-4xl font-bold text-blue leading-none">
                  ${plan.price}<span className="text-base text-tan-light font-normal">/mo</span>
                </div>
                <div className="mt-5 bg-blue-pale border border-blue-light/30 rounded-xl p-4 mb-5">
                  <div className="text-xs font-bold uppercase tracking-wider text-blue-dark mb-1">📣 Meta Ads Included</div>
                  <div className="text-base font-bold text-blue-deeper">{plan.adSpend} ad spend</div>
                </div>
                <ul className="space-y-2.5 mb-7">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-tan">
                      <span className="text-blue font-bold mt-0.5 flex-shrink-0">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/signup?plan=${plan.key}`}
                  className={
                    plan.variant === 'primary'   ? 'btn-primary w-full' :
                    plan.variant === 'secondary' ? 'btn-secondary w-full' :
                    'btn-outline w-full'
                  }>
                  {plan.cta} →
                </Link>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-tan-light mt-8">No contracts · Cancel anytime</p>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────── */}
      <footer className="bg-tan text-white">
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-16 grid md:grid-cols-4 gap-10">
          <div className="md:col-span-1">
            <Logo variant="white" size="md" />
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
            { title:'Platform', links:[['How It Works','/#how-it-works'],['Pricing','/#pricing'],['Log In','/login'],['Sign Up','/signup']] },
            { title:'Investors', links:[['Investor Overview','/investor'],['Investment Terms','/investor#terms'],['Request Full Deck','mailto:hello@queuepon.com?subject=Investor Deck']] },
            { title:'Resources', links:[['queuepon.com','https://queuepon.com'],['Contact Us','mailto:hello@queuepon.com'],['Privacy Policy','/privacy'],['Terms of Service','/terms']] },
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
          <span>© 2026 Queuepon LLC · Louisville, KY · All rights reserved</span>
          <span>Built with ♥ in Louisville</span>
        </div>
      </footer>
    </div>
  )
}
