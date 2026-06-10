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
      <div className="bg-white/15 backdrop-blur-sm border border-white/25 rounded-xl w-14 h-14 flex items-center justify-center">
        <span className="text-2xl font-bold text-white tabular-nums">
          {String(value).padStart(2, '0')}
        </span>
      </div>
      <span className="text-white/60 text-xs mt-1.5 uppercase tracking-wider">{label}</span>
    </div>
  )
}

export function LandingPageClient({ offer, restaurant }: Props) {
  const [email,     setEmail]     = useState('')
  const [firstName, setFirstName] = useState('')
  const [state,     setState]     = useState<FormState>('idle')
  const [error,     setError]     = useState('')
  const countdown = useCountdown(offer.expiry_date)

  const hasPhoto   = !!offer.ad_image_url
  const hasExpiry  = !!offer.expiry_date
  const expiryDate = offer.expiry_date
    ? new Date(offer.expiry_date).toLocaleDateString('en-US', { month:'long', day:'numeric', year:'numeric' })
    : null

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
    <div className="min-h-screen relative overflow-hidden">

      {/* Background — photo or gradient */}
      {hasPhoto ? (
        <>
          <div className="absolute inset-0">
            <img src={offer.ad_image_url} alt="" className="w-full h-full object-cover"/>
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/75"/>
        </>
      ) : (
        <div className="absolute inset-0" style={{background:'linear-gradient(135deg,#1a3a52 0%,#2a5070 40%,#588aad 100%)'}}/>
      )}

      {/* Dot pattern overlay */}
      <div className="absolute inset-0 opacity-10"
        style={{backgroundImage:'radial-gradient(circle,white 1px,transparent 1px)',backgroundSize:'28px 28px'}}/>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">

        {/* Nav */}
        <nav className="flex items-center justify-between px-6 py-4">
          <Logo variant="white" size="sm"/>
          <div className="text-white/50 text-xs font-medium uppercase tracking-wider">Exclusive Local Offer</div>
        </nav>

        {/* Main */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
          <div className="w-full max-w-md">

            {/* Restaurant logo */}
            {restaurant.logo_url && (
              <div className="text-center mb-5">
                <img src={restaurant.logo_url} alt={restaurant.name}
                  className="h-16 object-contain mx-auto drop-shadow-lg"/>
              </div>
            )}

            {/* Restaurant + ZIP badge */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 text-white text-xs font-bold px-4 py-2 rounded-full uppercase tracking-widest">
                📍 {restaurant.name} · ZIP {restaurant.zip_code}
              </div>
            </div>

            {/* Offer headline */}
            <div className="text-center mb-6">
              <div className="text-xs font-bold uppercase tracking-widest text-white/50 mb-3">
                Exclusive Offer for {restaurant.zip_code} Locals
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-yellow-300 leading-tight mb-3 drop-shadow-lg">
                {offer.title}
              </h1>
              <p className="text-white/85 text-lg leading-relaxed max-w-sm mx-auto">
                {offer.description}
              </p>
            </div>

            {/* Countdown timer */}
            {hasExpiry && countdown.days >= 0 && (
              <div className="mb-6">
                <div className="text-center text-white/60 text-xs font-bold uppercase tracking-widest mb-3">
                  ⏰ Offer expires in
                </div>
                <div className="flex items-center justify-center gap-3">
                  <CountdownBlock value={countdown.days}    label="Days"/>
                  <span className="text-white/40 text-2xl font-light mb-5">:</span>
                  <CountdownBlock value={countdown.hours}   label="Hours"/>
                  <span className="text-white/40 text-2xl font-light mb-5">:</span>
                  <CountdownBlock value={countdown.minutes} label="Mins"/>
                  <span className="text-white/40 text-2xl font-light mb-5">:</span>
                  <CountdownBlock value={countdown.seconds} label="Secs"/>
                </div>
              </div>
            )}

            {/* Claim form */}
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-7 shadow-2xl">
              <div className="text-center mb-5">
                <div className="text-lg font-bold text-tan">Claim Your Offer</div>
                <div className="text-sm text-tan-light mt-1">
                  We'll email it instantly — show it at the counter.
                </div>
              </div>

              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="First name (optional)"
                  className="form-input"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}/>
                <div>
                  <input
                    type="email"
                    placeholder="Your email address"
                    className={`form-input ${error ? 'border-red-400' : ''}`}
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError('') }}
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}/>
                  {error && <p className="text-red-500 text-xs font-semibold mt-1.5">⚠ {error}</p>}
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={state === 'loading'}
                  className="w-full py-4 rounded-xl font-bold text-base transition-all bg-blue text-white hover:bg-blue-dark hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:cursor-wait">
                  {state === 'loading' ? '⏳ Sending your offer...' : 'Send Me This Offer →'}
                </button>
              </div>

              {/* Social proof */}
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
            </div>

            {/* Trust line */}
            <p className="text-center text-white/45 text-xs mt-5 leading-relaxed">
              No spam, ever. Unsubscribe anytime.<br/>
              Show on your phone at the counter — no app or printing needed.
            </p>

            {/* Powered by */}
            <div className="flex items-center justify-center gap-2 mt-4 opacity-35">
              <Logo variant="white" size="sm" showWordmark={false}/>
              <span className="text-white text-xs">Powered by Queuepon</span>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
