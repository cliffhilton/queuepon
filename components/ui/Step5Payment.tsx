'use client'

import { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import { StripeCardForm } from './StripeCardForm'
import Link from 'next/link'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

const PLANS = {
  grow:   { name:'Grow',   price:199, adSpend:'$50/mo' },
  expand: { name:'Expand', price:499, adSpend:'$150/mo' },
  thrive: { name:'Thrive', price:799, adSpend:'$350/mo' },
}

interface Step5PaymentProps {
  form: any
  back: () => void
}

async function uploadImage(file: File, bucket: string, path: string): Promise<string | null> {
  const fd = new FormData()
  fd.append('file',   file)
  fd.append('bucket', bucket)
  fd.append('path',   path)
  const res = await fetch('/api/upload', { method: 'POST', body: fd })
  const data = await res.json()
  return data.url ?? null
}

export function Step5Payment({ form, back }: Step5PaymentProps) {
  const [clientSecret, setClientSecret] = useState('')
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState('')
  const [done,         setDone]         = useState(false)
  const [uploadStatus, setUploadStatus] = useState('Uploading your photos...')

  const plan = PLANS[form.plan as keyof typeof PLANS]

  useEffect(() => {
    const init = async () => {
      try {
        // Upload ad image + logo to Supabase Storage first
        let adImageUrl = ''
        let logoUrl    = form.logoPreview || '' // may be a clearbit URL already

        if (form.adImage) {
          setUploadStatus('Uploading your ad photo...')
          const slug = form.restaurantName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
          adImageUrl = await uploadImage(form.adImage, 'offer-images', `${slug}/ad-${Date.now()}.jpg`) ?? ''
        }

        if (form.logoFile) {
          setUploadStatus('Uploading your logo...')
          const slug = form.restaurantName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
          logoUrl = await uploadImage(form.logoFile, 'logos', `${slug}/logo-${Date.now()}.png`) ?? ''
        }

        setUploadStatus('Setting up your account...')

        // Create subscription
        const res = await fetch('/api/checkout', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            plan:             form.plan,
            email:            form.email,
            firstName:        form.firstName,
            lastName:         form.lastName,
            restaurantName:   form.restaurantName,
            zipCode:          form.zipCode,
            phone:            form.phone,
            address:          form.address,
            restaurantType:   form.restaurantType,
            website:          form.website,
            logoUrl,
            adImageUrl,
            offerTitle:       form.offerTitle,
            offerDescription: form.offerDescription,
            offerType:        form.offerType,
            adHeadline:       form.adHeadline,
            adSubheadline:    form.adSubheadline,
            adTemplate:       form.adTemplate,
            adColor:          form.adColor,
          }),
        })

        const data = await res.json()
        if (data.error) { setError(data.error); setLoading(false); return }
        setClientSecret(data.clientSecret)
        setLoading(false)

      } catch (err: any) {
        setError(err.message)
        setLoading(false)
      }
    }
    init()
  }, [])

  if (done) return (
    <div className="text-center max-w-md mx-auto py-10">
      <div className="text-6xl mb-5">🎉</div>
      <h2 className="text-3xl font-bold text-tan mb-3">You're live, {form.firstName}!</h2>
      <p className="text-tan-light leading-relaxed mb-8">
        Your <strong>{plan.name} Plan</strong> is active. Your Meta ad is being set up for ZIP{' '}
        <strong>{form.zipCode}</strong> and goes live within 24 hours.
      </p>
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[['📣','Meta Ad','Live in 24hrs'],['📧','Emails','Sequence ready'],['📊','Dashboard','Tracking live']].map(([icon,title,sub]) => (
          <div key={title} className="card text-center py-5">
            <div className="text-2xl mb-2">{icon}</div>
            <div className="text-xs font-bold text-tan">{title}</div>
            <div className="text-xs text-tan-light mt-1">{sub}</div>
          </div>
        ))}
      </div>
      <Link href="/dashboard" className="btn-primary px-10 py-4 text-base">Go to My Dashboard →</Link>
    </div>
  )

  if (loading) return (
    <div className="text-center py-20">
      <div className="text-3xl mb-4 animate-spin">⚙️</div>
      <div className="text-tan font-semibold mb-1">{uploadStatus}</div>
      <div className="text-tan-light text-sm">This takes just a moment...</div>
    </div>
  )

  if (error) return (
    <div className="text-center py-20 max-w-sm mx-auto">
      <div className="text-2xl mb-3">⚠️</div>
      <div className="text-red-500 font-semibold mb-4">{error}</div>
      <button onClick={back} className="btn-ghost">← Go Back</button>
    </div>
  )

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary:    '#588aad',
            colorBackground: '#ffffff',
            colorText:       '#716557',
            colorDanger:     '#dc2626',
            fontFamily:      'Poppins, sans-serif',
            borderRadius:    '10px',
          },
        },
      }}>
      <StripeCardForm
        clientSecret={clientSecret}
        planName={plan.name}
        planPrice={plan.price}
        adSpend={plan.adSpend}
        restaurantName={form.restaurantName}
        address={form.address}
        offerTitle={form.offerTitle}
        adTemplate={form.adTemplate}
        zipCode={form.zipCode}
        onBack={back}
        onSuccess={() => setDone(true)}
      />
    </Elements>
  )
}
