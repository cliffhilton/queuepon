'use client'

import { useState } from 'react'
import { Logo } from '@/components/layout/Logo'

interface Offer {
  id: string
  title: string
  description: string
  offer_type: string
  slug: string
  expiry_date?: string
  ad_template?: string
  ad_color?: string
  ad_image_url?: string
  subscriber_count: number
}

interface Restaurant {
  id: string
  name: string
  address?: string
  zip_code: string
  restaurant_type?: string
}

interface Props {
  offer: Offer
  restaurant: Restaurant
}

type FormState = 'idle' | 'loading' | 'success' | 'error'

export function LandingPageClient({ offer, restaurant }: Props) {
  const [email,     setEmail]     = useState('')
  const [firstName, setFirstName] = useState('')
  const [state,     setState]     = useState<FormState>('idle')
  const [error,     setError]     = useState('')

  const expiryDate = offer.expiry_date
    ? new Date(offer.expiry_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : null

  const handleSubmit = async () => {
    if (!email.trim()) { setError('Please enter your email address'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Please enter a valid email address'); return }

    setState('loading')
    setError('')

    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offerId:      offer.id,
          restaurantId: restaurant.id,
          email:        email.trim(),
          firstName:    firstName.trim(),
          offerTitle:   offer.title,
          restaurantName: restaurant.name,
          slug:         offer.slug,
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

  // Success screen
  if (state === 'success') return (
    <div className="min-h-screen bg-gradient-to-br from-blue-deeper via-blue to-blue-light flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl p-10 max-w-md w-full text-center shadow-2xl">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-2xl font-bold text-tan mb-3">You're in!</h1>
        <div className="bg-blue-pale rounded-2xl p-5 mb-5">
          <div className="text-xs font-bold uppercase tracking-wider text-blue-dark mb-1">{restaurant.name}</div>
          <div className="text-xl font-bold text-blue-deeper">{offer.title}</div>
          <div className="text-sm text-tan-light mt-2">{offer.description}</div>
        </div>
        <p className="text-tan-light text-sm leading-relaxed mb-6">
          We just sent your offer to <strong className="text-tan">{email}</strong>. 
          Show it at the counter when you visit — no printing needed.
        </p>
        {expiryDate && (
          <div className="text-xs text-tan-light border-t border-cream-dark pt-4">
            Offer expires {expiryDate}
          </div>
        )}
        <div className="mt-6 pt-4 border-t border-cream-dark">
          <div className="flex items-center justify-center gap-2 opacity-50">
            <Logo variant="dark" size="sm" showWordmark={false}/>
            <span className="text-xs text-tan-light">Powered by Queuepon</span>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-deeper via-blue to-blue-light relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10"
        style={{backgroundImage:'radial-gradient(circle,white 1px,transparent 1px)',backgroundSize:'32px 32px'}}/>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4">
        <Logo variant="white" size="sm"/>
        <div className="text-white/60 text-xs">Exclusive Local Offer</div>
      </nav>

      {/* Main content */}
      <div className="relative z-10 max-w-lg mx-auto px-4 pb-20">

        {/* Restaurant badge */}
        <div className="text-center mb-6 mt-4">
          <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 text-white text-xs font-bold px-4 py-2 rounded-full uppercase tracking-widest">
            📍 {restaurant.name} · {restaurant.zip_code}
          </div>
        </div>

        {/* Offer card */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-2xl mb-6">
          {/* Offer header */}
          <div className="bg-gradient-to-br from-blue-deeper to-blue p-8 text-center text-white">
            <div className="text-xs font-bold uppercase tracking-widest opacity-60 mb-3">
              Exclusive Offer for {restaurant.zip_code} Locals
            </div>
            <h1 className="text-3xl font-bold text-white leading-tight mb-3">
              {offer.title}
            </h1>
            <p className="text-white/80 leading-relaxed">
              {offer.description}
            </p>
            {expiryDate && (
              <div className="mt-4 inline-flex items-center gap-2 bg-white/15 px-4 py-1.5 rounded-full text-xs font-semibold">
                ⏰ Expires {expiryDate}
              </div>
            )}
          </div>

          {/* Claim form */}
          <div className="p-7">
            <div className="text-center mb-5">
              <div className="text-lg font-bold text-tan">Claim Your Offer</div>
              <div className="text-sm text-tan-light mt-1">
                We'll email it to you instantly — just show it at the counter.
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <input
                  type="text"
                  placeholder="First name (optional)"
                  className="form-input"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}/>
              </div>
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
                className={`w-full py-4 rounded-xl font-bold text-base transition-all
                  ${state === 'loading'
                    ? 'bg-blue/60 text-white cursor-wait'
                    : 'bg-blue text-white hover:bg-blue-dark hover:-translate-y-0.5 hover:shadow-lg'}`}>
                {state === 'loading' ? '⏳ Sending your offer...' : 'Send Me This Offer →'}
              </button>
            </div>

            {/* Social proof */}
            <div className="flex items-center justify-center gap-4 mt-5 pt-4 border-t border-cream-dark">
              <div className="text-center">
                <div className="text-lg font-bold text-tan">{offer.subscriber_count ?? 0}</div>
                <div className="text-xs text-tan-light">locals claimed this</div>
              </div>
              <div className="w-px h-8 bg-cream-dark"/>
              <div className="text-center">
                <div className="text-lg font-bold text-tan">Free</div>
                <div className="text-xs text-tan-light">no purchase required</div>
              </div>
              <div className="w-px h-8 bg-cream-dark"/>
              <div className="text-center">
                <div className="text-lg font-bold text-tan">Instant</div>
                <div className="text-xs text-tan-light">email delivery</div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust */}
        <div className="text-center text-white/60 text-xs leading-relaxed">
          We respect your privacy. No spam, ever. Unsubscribe anytime.<br/>
          Your offer is emailed instantly and shown at the counter — no app needed.
        </div>

        {/* Powered by */}
        <div className="flex items-center justify-center gap-2 mt-6 opacity-40">
          <Logo variant="white" size="sm" showWordmark={false}/>
          <span className="text-white text-xs">Powered by Queuepon</span>
        </div>
      </div>
    </div>
  )
}
