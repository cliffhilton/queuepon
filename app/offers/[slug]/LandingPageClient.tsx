'use client'

import { useState, useEffect } from 'react'
import { Logo } from '@/components/layout/Logo'

interface Offer {
  id: string
  title: string
  description: string
  offer_type: string
  slug: string
  expiry_date?: string
  ad_image_url?: string
  ad_image_urls?: string[]
  subscriber_count: number
}

interface Restaurant {
  id: string
  name: string
  address?: string
  zip_code: string
  restaurant_type?: string
  logo_url?: string
  website?: string
}

interface Props {
  offer: Offer
  restaurant: Restaurant
}

type FormState = 'idle' | 'loading' | 'success' | 'error'

function useCountdown(expiryDate?: string) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    if (!expiryDate) return
    const target = new Date(expiryDate).getTime()

    const tick = () => {
      const now  = Date.now()
      const diff = target - now
      if (diff <= 0) { setTimeLeft({ days:0, hours:0, minutes:0, seconds:0 }); return }
      setTimeLeft({
        days:    Math.floor(diff / 86400000),
        hours:   Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000)  / 60000),
        seconds: Math.floor((diff % 60000)    / 1000),
      })
    }

    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [expiryDate])

  return timeLeft
}

function CountdownBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-blue-pale border border-blue-light/30 rounded-xl w-14 h-14 flex items-center justify-center">
        <span className="text-2xl font-bold text-blue tabular-nums">
          {String(value).padStart(2, '0')}
        </span>
      </div>
      <span className="text-tan-light text-xs mt-1.5 uppercase tracking-wider">{label}</span>
    </div>
  )
}

export function LandingPageClient({ offer, restaurant }: Props) {
  const [email,       setEmail]       = useState('')
  const [firstName,   setFirstName]   = useState('')
  const [birthMonth,  setBirthMonth]  = useState('')
  const [state,       setState]       = useState<FormState>('idle')
  const [error,       setError]       = useState('')
  const [activeImage, setActiveImage] = useState(offer.ad_image_url || '')
  const countdown = useCountdown(offer.expiry_date)

  const hasPhoto   = !!offer.ad_image_url
  const hasExpiry  = !!offer.expiry_date
  const expiryDate = offer.expiry_date
    ? new Date(offer.expiry_date).toLocaleDateString('en-US', { month:'long', day:'numeric', year:'numeric' })
    : null

  const city = restaurant.address
    ? (restaurant.address.split(',')[1]?.trim() || restaurant.zip_code)
    : restaurant.zip_code

  const handleSubmit = async () => {
    if (!email.trim()) { setError('Please enter your email address'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Please enter a valid email address'); return }
    setState('loading')
    setError('')
    try {
      const res = await fetch('/api/customers', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offerId:        offer.id,
          restaurantId:   restaurant.id,
          email:          email.trim(),
          firstName:      firstName.trim(),
          birthMonth,
          offerTitle:     offer.title,
          restaurantName: restaurant.name,
          slug:           offer.slug,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong')
      setState('success')
    } catch (err: any) {
      setError(err.message)
      setState('error')
    }
  }

  // ── Success screen ─────────────────────────────────────────────────────────
  if (state === 'success') return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{background: hasPhoto
        ? `linear-gradient(rgba(0,0,0,0.75),rgba(0,0,0,0.75)), url(${offer.ad_image_url}) center/cover no-repeat fixed`
        : 'linear-gradient(135deg,#1a3a52,#2a5070,#588aad)'}}>
      <div className="bg-white rounded-3xl p-10 max-w-md w-full text-center shadow-2xl">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-2xl font-bold text-tan mb-2">You're in!</h1>
        <p className="text-tan-light text-sm mb-5">Check your email — your offer is on its way.</p>
        <div className="bg-blue-pale rounded-2xl p-5 mb-5 border border-blue-light/30">
          {restaurant.logo_url && (
            <img src={restaurant.logo_url} alt={restaurant.name}
              className="h-10 object-contain mx-auto mb-3"/>
          )}
          <div className="text-xs font-bold uppercase tracking-wider text-blue-dark mb-1">{restaurant.name}</div>
          <div className="text-xl font-bold text-blue-deeper">{offer.title}</div>
          <div className="text-sm text-tan-light mt-1">{offer.description}</div>
        </div>
        <p className="text-tan-light text-sm leading-relaxed mb-4">
          We sent your offer to <strong className="text-tan">{email}</strong>.<br/>
          Show it at the counter — no printing needed.
        </p>
        {expiryDate && (
          <div className="text-xs text-tan-light border-t border-cream-dark pt-4">
            Offer valid through {expiryDate}
          </div>
        )}
        <div className="mt-5 pt-4 border-t border-cream-dark flex items-center justify-center gap-2 opacity-40">
          <Logo variant="dark" size="sm" showWordmark={false}/>
          <span className="text-xs text-tan-light">Powered by Queuepon</span>
        </div>
      </div>
    </div>
  )

  // ── Main landing page ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-cream">

      {/* Nav */}
      <nav className="bg-white border-b border-cream-dark h-14 flex items-center justify-between px-6">
        <Logo variant="dark" size="sm"/>
        <div className="text-tan-light text-xs font-medium uppercase tracking-wider">Exclusive Local Offer</div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col md:grid md:grid-cols-5 gap-6 md:gap-8">

          {/* Photo — order-1 mobile · top-left desktop */}
          <div className="order-1 md:col-start-1 md:col-span-3 md:row-start-1">
            <div className="overflow-hidden rounded-2xl">
              {activeImage
                ? <img src={activeImage} alt={offer.title} className="w-full h-64 md:h-80 object-cover"/>
                : <div className="w-full h-64 md:h-80 bg-gradient-to-br from-blue-deeper to-blue"/>
              }
            </div>
            {offer.ad_image_urls && offer.ad_image_urls.length > 0 && (
              <div className="flex gap-2 overflow-x-auto py-2">
                {offer.ad_image_urls.map((url, i) => (
                  <button key={i} type="button" onClick={() => setActiveImage(url)}
                    className={`h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all cursor-pointer
                      ${activeImage === url ? 'border-blue' : 'border-cream-dark hover:border-blue/40'}`}>
                    <img src={url} alt={`Photo ${i + 1}`} className="h-full w-full object-cover"/>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Form — order-2 mobile · right col desktop spanning both rows */}
          <div className="order-2 md:col-start-4 md:col-span-2 md:row-start-1 md:row-span-2 md:sticky md:top-8 md:self-start">
            <div className="bg-white rounded-3xl p-7 shadow-card">
              <div className="mb-5">
                <div className="text-lg font-bold text-tan">Claim Your Offer</div>
                <div className="text-sm text-tan-light mt-1">We'll email it instantly — show it at the counter.</div>
              </div>
              <div className="space-y-3">
                <input type="text" placeholder="First name (optional)" className="form-input"
                  value={firstName} onChange={e => setFirstName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}/>
                <div>
                  <select className="form-input text-sm"
                    value={birthMonth} onChange={e => setBirthMonth(e.target.value)}>
                    <option value="">🎂 Birthday month (optional)</option>
                    {['January','February','March','April','May','June','July','August','September','October','November','December'].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  <p className="text-xs text-tan-light mt-1">Get a special birthday offer from {restaurant.name} — we'll only use this to send you something nice.</p>
                </div>
                <div>
                  <input type="email" placeholder="Your email address"
                    className={`form-input ${error ? 'border-red-400' : ''}`}
                    value={email} onChange={e => { setEmail(e.target.value); setError('') }}
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}/>
                  {error && <p className="text-red-500 text-xs font-semibold mt-1.5">⚠ {error}</p>}
                </div>
                <button onClick={handleSubmit} disabled={state === 'loading'}
                  className="w-full py-4 rounded-xl font-bold text-base transition-all bg-blue text-white hover:bg-blue-dark hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:cursor-wait">
                  {state === 'loading' ? '⏳ Sending your offer...' : 'Send Me This Offer →'}
                </button>
              </div>
              <div className="flex items-center justify-center gap-4 mt-5 pt-4 border-t border-cream-dark">
                <div className="text-center">
                  <div className="text-lg font-bold text-tan">{offer.subscriber_count ?? 0}</div>
                  <div className="text-xs text-tan-light">claimed this</div>
                </div>
                <div className="w-px h-8 bg-cream-dark"/>
                <div className="text-center">
                  <div className="text-lg font-bold text-tan">Free</div>
                  <div className="text-xs text-tan-light">no purchase needed</div>
                </div>
                <div className="w-px h-8 bg-cream-dark"/>
                <div className="text-center">
                  <div className="text-lg font-bold text-tan">Instant</div>
                  <div className="text-xs text-tan-light">email delivery</div>
                </div>
              </div>
              <p className="text-center text-tan-light text-xs mt-4 leading-relaxed">
                No spam, ever. Unsubscribe anytime.
              </p>
            </div>
          </div>

          {/* About content — order-3 mobile · bottom-left desktop */}
          <div className="order-3 md:col-start-1 md:col-span-3 md:row-start-2 bg-white rounded-2xl p-6">
            {restaurant.logo_url && (
              <img src={restaurant.logo_url} alt={restaurant.name} className="h-12 object-contain mb-3"/>
            )}
            <div className="inline-flex items-center gap-1.5 bg-cream border border-cream-dark text-tan-light text-xs font-medium px-3 py-1 rounded-full mb-3">
              📍 {restaurant.name} · ZIP {restaurant.zip_code}
            </div>
            <h1 className="text-2xl font-bold text-tan leading-tight mb-2">{offer.title}</h1>
            <p className="text-sm text-tan-light leading-relaxed mb-5">{offer.description}</p>

            <div className="border-t border-cream-dark pt-5">
              <div className="text-xs font-bold uppercase tracking-wider text-tan-light mb-3">About</div>
              <p className="text-sm text-tan-light leading-relaxed mb-4">
                {restaurant.name} is a neighborhood favorite in {city} serving{' '}
                {restaurant.restaurant_type?.toLowerCase() || 'great food'}. Come see why locals keep coming back.
              </p>
              {restaurant.address && (
                <div className="flex items-start gap-2 text-sm">
                  <span className="mt-0.5 flex-shrink-0">📍</span>
                  <div>
                    <div className="text-tan">{restaurant.address}</div>
                    <a href={`https://www.google.com/maps/search/${encodeURIComponent(restaurant.address)}`}
                      target="_blank" rel="noopener noreferrer"
                      className="text-blue font-medium hover:underline">
                      Get directions →
                    </a>
                  </div>
                </div>
              )}
            </div>

            {hasExpiry && countdown.days >= 0 && (
              <div className="border-t border-cream-dark mt-5 pt-5">
                <div className="text-xs font-bold uppercase tracking-wider text-tan-light mb-3">⏰ Offer expires in</div>
                <div className="flex items-center gap-3">
                  <CountdownBlock value={countdown.days}    label="Days"/>
                  <span className="text-tan-light text-2xl font-light mb-5">:</span>
                  <CountdownBlock value={countdown.hours}   label="Hours"/>
                  <span className="text-tan-light text-2xl font-light mb-5">:</span>
                  <CountdownBlock value={countdown.minutes} label="Mins"/>
                  <span className="text-tan-light text-2xl font-light mb-5">:</span>
                  <CountdownBlock value={countdown.seconds} label="Secs"/>
                </div>
                {expiryDate && (
                  <div className="text-xs text-tan-light mt-2">Valid through {expiryDate}</div>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
