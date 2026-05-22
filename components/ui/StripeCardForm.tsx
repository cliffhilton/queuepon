'use client'

import { useState } from 'react'
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'

interface StripeCardFormProps {
  clientSecret: string
  planName: string
  planPrice: number
  adSpend: string
  restaurantName: string
  address: string
  offerTitle: string
  adTemplate: string
  zipCode: string
  onBack: () => void
  onSuccess: () => void
}

export function StripeCardForm({
  clientSecret, planName, planPrice, adSpend,
  restaurantName, address, offerTitle, adTemplate,
  zipCode, onBack, onSuccess,
}: StripeCardFormProps) {
  const stripe   = useStripe()
  const elements = useElements()
  const [paying, setPaying]   = useState(false)
  const [error,  setError]    = useState('')

  const handleSubmit = async () => {
    if (!stripe || !elements) return
    setPaying(true)
    setError('')

    const { error: submitError } = await elements.submit()
    if (submitError) {
      setError(submitError.message ?? 'Payment failed')
      setPaying(false)
      return
    }

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: {
        return_url: `${window.location.origin}/signup/success`,
      },
      redirect: 'if_required',
    })

    if (confirmError) {
      setError(confirmError.message ?? 'Payment failed')
      setPaying(false)
    } else {
      onSuccess()
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
      {/* Payment form */}
      <div>
        <div className="eyebrow mb-1">Step 5 of 5</div>
        <h2 className="text-2xl font-bold text-tan mb-6">Payment Details</h2>
        <div className="card">
          <PaymentElement
            options={{
              layout: 'tabs',
              defaultValues: { billingDetails: { address: { country: 'US' } } },
            }}
          />
          {error && (
            <p className="text-red-500 text-sm font-semibold mt-4 flex items-center gap-1">
              ⚠ {error}
            </p>
          )}
          <div className="flex items-center justify-center gap-2 mt-5 text-xs text-tan-light">
            🔒 Secured by <strong>Stripe</strong>
          </div>
        </div>
        <div className="flex justify-between mt-5">
          <button onClick={onBack} className="btn-ghost">← Back</button>
          <button
            onClick={handleSubmit}
            disabled={paying || !stripe}
            className={`btn-primary px-8 py-3 ${paying ? 'opacity-75 cursor-wait' : ''}`}>
            {paying ? '⏳ Processing...' : `🚀 Launch — $${planPrice}/mo`}
          </button>
        </div>
      </div>

      {/* Order summary */}
      <div className="rounded-2xl bg-blue-deeper text-white p-7">
        <div className="text-xs font-bold uppercase tracking-wider opacity-60 mb-5">Order Summary</div>
        <div className="space-y-4 border-b border-white/10 pb-4">
          <div className="flex justify-between">
            <div>
              <div className="text-sm font-semibold">{planName} Plan</div>
              <div className="text-xs opacity-50 mt-0.5">Billed monthly · Cancel anytime</div>
            </div>
            <div className="text-sm font-bold">${planPrice}/mo</div>
          </div>
          <div className="flex justify-between">
            <div className="text-sm">Meta Ad Spend Included</div>
            <div className="text-sm font-bold text-yellow-300">{adSpend}</div>
          </div>
          <div className="flex justify-between">
            <div className="text-sm">Setup Fee</div>
            <div className="text-sm font-bold text-green-400">FREE</div>
          </div>
        </div>
        <div className="flex justify-between items-center mt-5">
          <div className="font-bold">Due Today</div>
          <div className="text-3xl font-bold text-yellow-300">${planPrice}</div>
        </div>
        <div className="mt-5 bg-white/10 rounded-xl p-4 text-xs opacity-75 leading-relaxed">
          Your Meta ad targeting <strong>ZIP {zipCode}</strong> goes live within 24 hours.
        </div>
        <div className="mt-4 space-y-1.5 text-xs opacity-50">
          <div>🏠 {restaurantName}</div>
          <div>📍 {address}</div>
          <div>🎁 {offerTitle}</div>
          <div>📣 {adTemplate === 'full_bleed' ? 'Full Bleed' : 'Split'} template</div>
        </div>
      </div>
    </div>
  )
}
