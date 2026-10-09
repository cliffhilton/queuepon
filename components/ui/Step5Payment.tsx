'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import { StripeCardForm } from './StripeCardForm'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

const PLANS = {
  grow:   { name:'Grow',   price:299, audienceReach:'4,500–5,500 people' },
  expand: { name:'Expand', price:499, audienceReach:'9,000–10,000 people' },
  thrive: { name:'Thrive', price:799, audienceReach:'15,000–16,000 people' },
}

const COUPON_DISCOUNTS: Record<string, number> = {
  getgrow: 200, getexpand: 300, getthrive: 400,
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
  const [clientSecret,          setClientSecret]          = useState('')
  const [loading,               setLoading]               = useState(true)
  const [error,                 setError]                 = useState('')
  const [pollKey,               setPollKey]               = useState('')
  const [amountDueCents,        setAmountDueCents]        = useState(0)
  const [recurringCents,        setRecurringCents]        = useState(0)
  const [couponDuration,        setCouponDuration]        = useState<string | null>(null)
  const [couponDurationInMonths, setCouponDurationInMonths] = useState<number | null>(null)
  const [uploadStatus,          setUploadStatus]          = useState('Uploading your photos...')
  const router = useRouter()

  const plan = PLANS[form.plan as keyof typeof PLANS]
  const discount = form.coupon ? COUPON_DISCOUNTS[form.coupon] || 0 : 0
  const discountedPrice = plan.price - discount

  useEffect(() => {
    const init = async () => {
      try {
        // Upload ad images + logo to Supabase Storage first
        const slug = form.restaurantName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
        let logoUrl = form.logoPreview || ''

        const adImageFiles = ((form.adImages || []) as Array<{ file: File | null; preview: string }>)
          .map(img => img.file).filter((f): f is File => !!f)

        const adImageUrls: string[] = []
        for (let i = 0; i < adImageFiles.length; i++) {
          setUploadStatus(adImageFiles.length > 1
            ? `Uploading photo ${i + 1} of ${adImageFiles.length}...`
            : 'Uploading your ad photo...')
          const url = await uploadImage(adImageFiles[i], 'offer-images', `${slug}/ad-${i}-${Date.now()}.jpg`)
          if (url) adImageUrls.push(url)
        }
        const adImageUrl = adImageUrls[0] ?? ''

        if (form.logoFile) {
          setUploadStatus('Uploading your logo...')
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
            adImageUrls: JSON.stringify(adImageUrls),
            offerTitle:       form.offerTitle,
            offerDescription: form.offerDescription,
            offerType:        form.offerType,
            adHeadline:       form.adHeadline,
            adSubheadline:    form.adSubheadline,
            adTemplate:       form.adTemplate,
            adColor:          form.adColor,
            comeBackOffer:        form.comeBackOffer,
            additionalLocations:  JSON.stringify(form.additionalLocations || []),
            coupon:               form.coupon,
          }),
        })

        const data = await res.json()
        if (data.error) { setError(data.error); setLoading(false); return }
        setPollKey(data.pollKey ?? '')
        setAmountDueCents(data.amountDueCents ?? 0)
        setRecurringCents(data.recurringCents ?? 0)
        setCouponDuration(data.couponDuration ?? null)
        setCouponDurationInMonths(data.couponDurationInMonths ?? null)

        if (data.skipPayment) {
          const appOrigin = process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin
          const dest = data.pollKey
            ? `${appOrigin}/signup/success?pk=${encodeURIComponent(data.pollKey)}`
            : `${appOrigin}/signup/success`
          router.push(dest)
          return
        }

        setClientSecret(data.clientSecret ?? '')
        setLoading(false)

      } catch (err: any) {
        setError(err.message)
        setLoading(false)
      }
    }
    init()
  }, [])

  if (loading || !clientSecret) return (
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

  const appOrigin = process.env.NEXT_PUBLIC_APP_URL ?? (typeof window !== 'undefined' ? window.location.origin : '')
  const returnUrl = pollKey
    ? `${appOrigin}/signup/success?pk=${encodeURIComponent(pollKey)}`
    : `${appOrigin}/signup/success`

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
        discount={discount}
        discountedPrice={discountedPrice}
        amountDueCents={amountDueCents}
        recurringCents={recurringCents}
        couponDuration={couponDuration}
        couponDurationInMonths={couponDurationInMonths}
        audienceReach={plan.audienceReach}
        restaurantName={form.restaurantName}
        address={form.address}
        offerTitle={form.offerTitle}
        adTemplate={form.adTemplate}
        zipCode={form.zipCode}
        onBack={back}
        onSuccess={() => router.push(returnUrl)}
        returnUrl={returnUrl}
      />
    </Elements>
  )
}
