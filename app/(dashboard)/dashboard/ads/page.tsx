import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function AdsPage() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: restaurant } = await supabase
    .from('restaurants').select('*').eq('user_id', session.user.id).single()

  const { data: stats } = await supabase
    .from('meta_ad_stats').select('*')
    .eq('restaurant_id', restaurant?.id)
    .order('week_start', { ascending: false })

  const total = stats?.reduce((acc, s) => ({
    impressions:      (acc.impressions      ?? 0) + (s.impressions      ?? 0),
    clicks:           (acc.clicks           ?? 0) + (s.clicks           ?? 0),
    estimated_visits: (acc.estimated_visits ?? 0) + (s.estimated_visits ?? 0),
    spend:            (acc.spend            ?? 0) + (s.spend            ?? 0),
  }), { impressions:0, clicks:0, estimated_visits:0, spend:0 })

  const avgCtr = stats?.length
    ? (stats.reduce((s, r) => s + (r.ctr ?? 0), 0) / stats.length).toFixed(1)
    : null

  return (
    <div className="p-6 md:p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-tan">Meta Ad Results</h1>
        <p className="text-tan-light mt-1">Managed entirely by Queuepon — here's how your ads are performing.</p>
      </div>

      {/* Campaign status widget */}
      <div className="rounded-2xl p-6 mb-8 text-white" style={{background:'linear-gradient(135deg,#1264d4,#1877F2)'}}>
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider opacity-60 mb-2">Active Campaign</div>
            <div className="text-xl font-bold">
              {restaurant?.name} — {restaurant?.meta_ad_status === 'live' ? 'Running' : 'Setting Up'}
            </div>
            <div className="text-sm opacity-65 mt-1">
              Facebook + Instagram · ZIP {restaurant?.zip_code} · Queuepon channels
            </div>
          </div>
          <span className={`text-xs font-bold px-3 py-1.5 rounded-full whitespace-nowrap
            ${restaurant?.meta_ad_status === 'live'
              ? 'bg-green-500/25 text-green-300'
              : 'bg-yellow-500/25 text-yellow-300'}`}>
            {restaurant?.meta_ad_status === 'live' ? '● Live' : '● Setting Up'}
          </span>
        </div>

        {total && stats && stats.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              ['Total Impressions', total.impressions.toLocaleString()],
              ['Total Clicks',      total.clicks.toLocaleString()],
              ['Est. New Visits',   total.estimated_visits.toLocaleString()],
              ['Avg. CTR',          avgCtr ? `${avgCtr}%` : '—'],
            ].map(([label, val]) => (
              <div key={label} className="bg-white/10 rounded-xl p-4">
                <div className="text-2xl font-bold">{val}</div>
                <div className="text-xs opacity-65 mt-1">{label}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white/10 rounded-xl p-5 text-center">
            <div className="text-sm opacity-80">
              {restaurant?.meta_ad_status === 'live'
                ? 'Ad stats are being collected and will appear here shortly.'
                : 'Your ad is being set up. Stats will appear once the campaign goes live (within 24 hours).'}
            </div>
          </div>
        )}
      </div>

      {/* Weekly breakdown */}
      {stats && stats.length > 0 ? (
        <div className="card mb-6">
          <div className="font-bold text-tan mb-4">Weekly Breakdown</div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-cream-dark">
                  {['Week','Impressions','Clicks','Est. Visits','CTR','Spend'].map(h => (
                    <th key={h} className="text-left py-2 px-3 text-xs font-bold text-tan-light uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.map(row => (
                  <tr key={row.id} className="border-b border-cream-dark/50 last:border-0 hover:bg-blue-xpale">
                    <td className="py-3 px-3 text-tan-light">{new Date(row.week_start).toLocaleDateString()}</td>
                    <td className="py-3 px-3 font-semibold text-tan">{row.impressions?.toLocaleString()}</td>
                    <td className="py-3 px-3 text-tan">{row.clicks?.toLocaleString()}</td>
                    <td className="py-3 px-3 text-tan">{row.estimated_visits}</td>
                    <td className="py-3 px-3 text-tan">{row.ctr}%</td>
                    <td className="py-3 px-3 text-tan">${row.spend}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {/* How it works */}
      <div className="grid md:grid-cols-2 gap-5">
        <div className="card">
          <div className="font-bold text-tan mb-4 text-sm">How Your Ads Work</div>
          <div className="space-y-3">
            {[
              ['📍', `Geo-targeted to ZIP ${restaurant?.zip_code} + 5-mile radius`],
              ['🎨', 'Creative managed by Queuepon — we write, design and run your ads'],
              ['📲', 'Runs on Facebook Feed + Instagram Feed + Stories'],
              ['🔄', 'Retargeting sequences bring back visitors who didn\'t convert'],
            ].map(([icon, text]) => (
              <div key={text} className="flex items-start gap-3 p-3 bg-cream rounded-xl">
                <span className="text-lg flex-shrink-0">{icon}</span>
                <span className="text-sm text-tan leading-relaxed">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="font-bold text-tan mb-4 text-sm">Ad Budget Included</div>
          <div className="space-y-3 mb-5">
            {[
              { plan:'grow',   label:'Grow Plan',   spend:'$50/mo',   pct:25 },
              { plan:'expand', label:'Expand Plan', spend:'$150/mo',  pct:30 },
              { plan:'thrive', label:'Thrive Plan', spend:'$350/mo',  pct:44 },
            ].map(p => (
              <div key={p.plan} className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all
                ${restaurant?.plan === p.plan ? 'border-blue bg-blue-pale' : 'border-cream-dark'}`}>
                <div>
                  <div className={`text-sm font-bold ${restaurant?.plan === p.plan ? 'text-blue-dark' : 'text-tan'}`}>
                    {p.label} {restaurant?.plan === p.plan ? '✓ Your Plan' : ''}
                  </div>
                </div>
                <div className={`text-sm font-bold ${restaurant?.plan === p.plan ? 'text-blue' : 'text-tan-light'}`}>
                  {p.spend}
                </div>
              </div>
            ))}
          </div>
          <div className="bg-cream rounded-xl p-4 text-xs text-tan-light leading-relaxed">
            Questions about your ads? We handle everything — just watch the results.
          </div>
          <a href="mailto:hello@queuepon.com" className="btn-ghost btn-sm w-full text-center mt-3 block">
            Contact Queuepon Support
          </a>
        </div>
      </div>
    </div>
  )
}
