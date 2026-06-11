import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { WelcomeBanner } from '@/components/dashboard/WelcomeBanner'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  // Get restaurant
  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('*')
    .eq('user_id', session.user.id)
    .single()

  // Get offers
  const { data: offers } = await supabase
    .from('offers')
    .select('*')
    .eq('restaurant_id', restaurant?.id)
    .order('created_at', { ascending: false })

  // Get customer count
  const { count: customerCount } = await supabase
    .from('customers')
    .select('*', { count: 'exact', head: true })
    .eq('restaurant_id', restaurant?.id)

  // Get latest meta stats
  const { data: adStats } = await supabase
    .from('meta_ad_stats')
    .select('*')
    .eq('restaurant_id', restaurant?.id)
    .order('week_start', { ascending: false })
    .limit(1)
    .single()

  const stats = [
    { label: 'Total Subscribers', value: customerCount ?? 0, change: '↑ Growing', color: 'green' },
    { label: 'Active Offers',     value: offers?.filter(o => o.status === 'live').length ?? 0, change: 'Live now', color: 'blue' },
    { label: 'Ad Impressions',    value: adStats?.impressions?.toLocaleString() ?? '—', change: 'This week', color: 'blue' },
    { label: 'Est. Visits',       value: adStats?.estimated_visits ?? '—', change: 'From Meta ads', color: 'tan' },
  ]

  const firstName = restaurant?.owner_first ?? 'there'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="max-w-5xl">
      <WelcomeBanner firstName={firstName}/>

      {/* Header */}
      <div className="mb-8 mt-6">
        <h1 className="text-2xl font-bold text-tan">{greeting}, {firstName} 👋</h1>
        <p className="text-tan-light mt-1">
          Here's how {restaurant?.name ?? 'your restaurant'} is performing.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map(stat => (
          <div key={stat.label} className="card relative overflow-hidden">
            <div className={`absolute top-0 left-0 right-0 h-0.5
              ${stat.color === 'green' ? 'bg-green-500' :
                stat.color === 'tan'   ? 'bg-tan' : 'bg-blue'}`}/>
            <div className="text-2xl md:text-3xl font-bold text-tan leading-none mb-1">
              {stat.value}
            </div>
            <div className="text-xs text-tan-light">{stat.label}</div>
            <div className={`text-xs font-semibold mt-2
              ${stat.color === 'green' ? 'text-green-600' : 'text-tan-light'}`}>
              {stat.change}
            </div>
          </div>
        ))}
      </div>

      {/* Meta ad widget */}
      {restaurant?.meta_ad_status && (
        <div className="bg-gradient-to-r from-blue-deeper to-blue rounded-2xl p-6 mb-8 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider opacity-60 mb-1">
                Your Meta Ad
              </div>
              <div className="text-lg font-bold">
                {restaurant.meta_ad_status === 'live'
                  ? `Targeting ZIP ${restaurant.zip_code}`
                  : 'Being set up — live within 24 hours'}
              </div>
            </div>
            <span className={`text-xs font-bold px-3 py-1 rounded-full
              ${restaurant.meta_ad_status === 'live'
                ? 'bg-green-500/25 text-green-300'
                : 'bg-yellow-500/25 text-yellow-300'}`}>
              {restaurant.meta_ad_status === 'live' ? '● Live' : '● Setting Up'}
            </span>
          </div>
          {adStats ? (
            <div className="grid grid-cols-4 gap-4">
              {[
                ['Impressions', adStats.impressions?.toLocaleString()],
                ['Clicks',      adStats.clicks?.toLocaleString()],
                ['Est. Visits', adStats.estimated_visits],
                ['CTR',         `${adStats.ctr}%`],
              ].map(([label, val]) => (
                <div key={label}>
                  <div className="text-xl font-bold">{val ?? '—'}</div>
                  <div className="text-xs opacity-65 mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm opacity-70">
              Ad stats will appear here once your campaign goes live.
            </p>
          )}
        </div>
      )}

      {/* Offers */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-tan">Your Offers</h2>
          <Link href="/dashboard/offers" className="text-sm text-blue font-semibold hover:underline">
            View all →
          </Link>
        </div>
        {offers && offers.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-4">
            {offers.slice(0, 4).map(offer => (
              <div key={offer.id} className="card flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-tan truncate">{offer.title}</div>
                  <div className="text-xs text-tan-light mt-0.5 truncate">{offer.description}</div>
                  <div className="flex items-center gap-3 mt-3 text-xs">
                    <span className={`font-bold ${offer.status === 'live' ? 'text-green-600' : 'text-tan-light'}`}>
                      {offer.status === 'live' ? '● Live' : '○ Draft'}
                    </span>
                    <span className="text-tan-light">{offer.subscriber_count ?? 0} subscribers</span>
                  </div>
                </div>
                <Link href={`/offers/${offer.slug}`} target="_blank"
                  className="text-xs text-blue font-semibold hover:underline whitespace-nowrap">
                  View page →
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="card text-center py-10">
            <div className="text-3xl mb-3">🎁</div>
            <div className="font-bold text-tan mb-1">No offers yet</div>
            <p className="text-sm text-tan-light mb-4">Create your first offer to generate a landing page and start collecting customers.</p>
            <Link href="/dashboard/offers" className="btn-primary btn-sm">
              Create First Offer →
            </Link>
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="card">
        <div className="font-bold text-tan mb-4">Quick Actions</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { href:'/dashboard/offers',    icon:'🎁', label:'Create Offer' },
            { href:'/dashboard/customers', icon:'👥', label:'View Customers' },
            { href:'/dashboard/ads',       icon:'📣', label:'Ad Results' },
            { href:'/dashboard/emails',    icon:'📧', label:'Email Sequences' },
          ].map(a => (
            <Link key={a.href} href={a.href}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-cream hover:bg-blue-xpale border border-cream-dark hover:border-blue-light transition-all text-center">
              <span className="text-2xl">{a.icon}</span>
              <span className="text-xs font-semibold text-tan">{a.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
