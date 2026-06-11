'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Offer {
  id: string
  title: string
  description: string
  slug: string
  ad_headline?: string
  ad_subheadline?: string
  ad_template?: string
  ad_color?: string
  ad_image_url?: string
  meta_campaign_id?: string
  meta_adset_id?: string
  meta_ad_id?: string
  meta_ad_status?: string
  subscriber_count: number
}

interface Restaurant {
  id: string
  name: string
  zip_code: string
  plan: string
  meta_ad_status: string
  logo_url?: string
}

interface MetaStat {
  week_start: string
  impressions: number
  clicks: number
  estimated_visits: number
  ctr: number
  spend: number
}

interface Props {
  restaurant: Restaurant | null
  offer: Offer | null
  stats: MetaStat[]
}

export function AdReviewClient({ restaurant, offer, stats }: Props) {
  const [launching, setLaunching] = useState(false)
  const [launched,  setLaunched]  = useState(false)
  const [error,     setError]     = useState('')

  const adStatus    = offer?.meta_ad_status ?? 'pending'
  const hasStats    = stats.length > 0
  const isLive      = adStatus === 'active'
  const isPending   = adStatus === 'pending_review' || adStatus === 'pending'
  const isSetting   = restaurant?.meta_ad_status === 'setting_up'

  const total = stats.reduce((acc, s) => ({
    impressions:      (acc.impressions      ?? 0) + (s.impressions      ?? 0),
    clicks:           (acc.clicks           ?? 0) + (s.clicks           ?? 0),
    estimated_visits: (acc.estimated_visits ?? 0) + (s.estimated_visits ?? 0),
    spend:            (acc.spend            ?? 0) + (s.spend            ?? 0),
  }), { impressions:0, clicks:0, estimated_visits:0, spend:0 })

  const handleLaunch = async () => {
    if (!offer?.meta_campaign_id) {
      setError('Campaign not ready yet — check back shortly.')
      return
    }
    setLaunching(true)
    setError('')
    try {
      const res = await fetch('/api/meta/activate', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId:   offer.meta_campaign_id,
          adSetId:      offer.meta_adset_id,
          adId:         offer.meta_ad_id,
          offerId:      offer.id,
          restaurantId: restaurant?.id,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Launch failed')
      setLaunched(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLaunching(false)
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-tan">Meta Ad Results</h1>
        <p className="text-tan-light mt-1">Managed by Queuepon — targeted to ZIP {restaurant?.zip_code}.</p>
      </div>

      {/* Campaign status */}
      <div className="rounded-2xl p-6 mb-6 text-white"
        style={{background:'linear-gradient(135deg,#1264d4,#1877F2)'}}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider opacity-60 mb-1">
              {restaurant?.name} — Active Campaign
            </div>
            <div className="text-xl font-bold">
              {launched || isLive
                ? `Live on Facebook + Instagram · ZIP ${restaurant?.zip_code}`
                : isSetting
                ? 'Being built — ready to review shortly'
                : isPending
                ? 'Ready to review and launch'
                : 'Campaign active'}
            </div>
          </div>
          <span className={`text-xs font-bold px-3 py-1.5 rounded-full whitespace-nowrap
            ${launched || isLive
              ? 'bg-green-500/25 text-green-300'
              : 'bg-yellow-500/25 text-yellow-300'}`}>
            {launched || isLive ? '● Live' : isSetting ? '● Building' : '● Ready to Launch'}
          </span>
        </div>

        {hasStats ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              ['Total Impressions', total.impressions.toLocaleString()],
              ['Total Clicks',      total.clicks.toLocaleString()],
              ['Est. New Visits',   total.estimated_visits.toLocaleString()],
              ['Total Spend',       `$${total.spend}`],
            ].map(([label, val]) => (
              <div key={label} className="bg-white/10 rounded-xl p-4">
                <div className="text-2xl font-bold">{val}</div>
                <div className="text-xs opacity-65 mt-1">{label}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm opacity-70">Stats appear once your ad goes live.</p>
        )}
      </div>

      {/* Ad preview + launch */}
      {offer && (
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Ad preview */}
          <div>
            <div className="form-label mb-3">Your Ad Preview</div>
            <div className="rounded-2xl overflow-hidden shadow-card-lg border border-cream-dark">
              {/* FB post header */}
              <div className="bg-white px-4 py-3 flex items-center gap-2.5 border-b border-cream-dark">
                {restaurant?.logo_url
                  ? <img src={restaurant.logo_url} alt={restaurant.name} className="w-9 h-9 rounded-full object-cover flex-shrink-0"/>
                  : <div className="w-9 h-9 rounded-full bg-blue flex items-center justify-center text-white text-xs font-bold flex-shrink-0">Q</div>
                }
                <div>
                  <div className="text-xs font-bold text-gray-800">{restaurant?.name}</div>
                  <div className="text-xs text-gray-400">Sponsored · 📍 ZIP {restaurant?.zip_code}</div>
                </div>
              </div>

              {/* Ad image */}
              <div className="relative aspect-square overflow-hidden bg-blue-pale">
                {offer.ad_image_url ? (
                  <>
                    <img src={offer.ad_image_url} alt="Ad" className="w-full h-full object-cover"/>
                    {offer.ad_template === 'split' ? (
                      <div className="absolute bottom-0 left-0 right-0 p-4"
                        style={{backgroundColor: offer.ad_color || '#588aad'}}>
                        <div className="text-white font-bold text-lg leading-tight">
                          {offer.ad_headline || offer.title}
                        </div>
                        <div className="text-white/80 text-sm mt-1">{offer.ad_subheadline}</div>
                        <div className="text-white/40 text-xs mt-1.5">
                          queuepon.com/offers/{offer.slug}
                        </div>
                      </div>
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent flex flex-col justify-end p-5">
                        <div className="text-white font-bold text-lg leading-tight">
                          {offer.ad_headline || offer.title}
                        </div>
                        <div className="text-white/80 text-sm mt-1">{offer.ad_subheadline}</div>
                        <div className="text-white/40 text-xs mt-2">
                          queuepon.com/offers/{offer.slug}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-deeper to-blue flex flex-col justify-end p-5">
                    <div className="text-white font-bold text-lg">{offer.ad_headline || offer.title}</div>
                    <div className="text-white/75 text-sm mt-1">{offer.ad_subheadline}</div>
                  </div>
                )}
              </div>

              {/* FB post footer */}
              <div className="bg-white px-4 py-3 border-t border-cream-dark">
                <div className="text-xs text-gray-400 uppercase tracking-wider">queuepon.com</div>
                <div className="text-sm font-bold text-gray-800 mt-0.5">
                  {offer.ad_headline || offer.title}
                </div>
                <div className="text-xs text-gray-400 mt-0.5">{offer.ad_subheadline}</div>
              </div>

              {/* Simulated FB action bar */}
              <div className="bg-white px-4 py-2 border-t border-cream-dark flex items-center justify-between">
                <div className="flex gap-4 text-xs text-gray-400">
                  <span>👍 Like</span>
                  <span>💬 Comment</span>
                  <span>↗️ Share</span>
                </div>
                <div className="bg-blue text-white text-xs font-bold px-3 py-1.5 rounded-lg">
                  Learn More
                </div>
              </div>
            </div>
            <p className="text-xs text-tan-light text-center mt-2">
              Facebook Feed + Instagram Feed · ZIP {restaurant?.zip_code} + 5mi radius
            </p>
          </div>

          {/* Launch panel */}
          <div className="space-y-4">
            {/* Offer details */}
            <div className="card">
              <div className="font-bold text-tan mb-4 text-sm">Campaign Details</div>
              <div className="space-y-3">
                {[
                  ['Offer',      offer.title],
                  ['Targeting',  `ZIP ${restaurant?.zip_code} + 5 mile radius`],
                  ['Platforms',  'Facebook Feed · Instagram Feed · Stories'],
                  ['Landing Page', `queuepon.com/offers/${offer.slug}`],
                  ['Status',     adStatus],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between text-sm py-2 border-b border-cream-dark last:border-0">
                    <span className="text-tan-light">{label}</span>
                    <span className="font-semibold text-tan text-right max-w-[60%] truncate">{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Launch / status */}
            {launched || isLive ? (
              <div className="card bg-green-50 border-green-200">
                <div className="text-green-700 font-bold mb-1">🟢 Your ad is live!</div>
                <div className="text-sm text-green-600">
                  Running on Facebook + Instagram targeting ZIP {restaurant?.zip_code}. 
                  Stats will appear within 24 hours.
                </div>
              </div>
            ) : isSetting && !offer.meta_campaign_id ? (
              <div className="card bg-blue-xpale border-blue-pale">
                <div className="text-blue font-bold mb-1">⏳ Building your campaign...</div>
                <div className="text-sm text-tan-light">
                  Your ad is being created. You'll receive an email when it's ready to review — 
                  usually within a few minutes.
                </div>
              </div>
            ) : (
              <div className="card">
                <div className="font-bold text-tan mb-2 text-sm">Ready to Launch</div>
                <p className="text-sm text-tan-light mb-4 leading-relaxed">
                  Your ad has been built and is ready to go live. Review the preview on the left — 
                  when you're happy, click launch.
                </p>
                {error && (
                  <p className="text-red-500 text-sm font-semibold mb-3">⚠ {error}</p>
                )}
                <button onClick={handleLaunch} disabled={launching}
                  className={`btn-primary w-full py-3 ${launching ? 'opacity-75 cursor-wait' : ''}`}>
                  {launching ? '⏳ Launching...' : '🚀 Approve & Launch My Ad'}
                </button>
                <p className="text-xs text-tan-light text-center mt-3">
                  Your ad goes live on Facebook + Instagram within minutes of approval.
                </p>
              </div>
            )}

            {/* View landing page */}
            <Link href={`/offers/${offer.slug}`} target="_blank"
              className="btn-ghost w-full text-center block text-sm">
              👁 Preview Your Landing Page →
            </Link>
          </div>
        </div>
      )}

      {/* Weekly stats table */}
      {hasStats && (
        <div className="card">
          <div className="font-bold text-tan mb-4">Weekly Performance</div>
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
                  <tr key={row.week_start} className="border-b border-cream-dark/50 last:border-0 hover:bg-blue-xpale">
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
      )}
    </div>
  )
}
