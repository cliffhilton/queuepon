import { NextRequest, NextResponse } from 'next/server'
import { stripe, PLANS, PlanKey } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      plan, email, firstName, lastName, restaurantName, zipCode,
      phone, address, restaurantType, website, logoUrl, adImageUrl, adImageUrls,
      offerTitle, offerDescription, offerType,
      adHeadline, adSubheadline, adTemplate, adColor, comeBackOffer, coupon,
      audienceTypes, audienceAgeRange, trafficTiming, adDays, additionalLocations,
    } = body

    if (!plan || !PLANS[plan as PlanKey]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const planConfig = PLANS[plan as PlanKey]

    const customer = await stripe.customers.create({
      email,
      name: `${firstName} ${lastName}`,
      metadata: { restaurantName, zipCode, phone, address, restaurantType, plan },
    })

    // Stripe metadata values are limited to 500 chars
    // Truncate URLs safely
    const safeLogoUrl    = (logoUrl    || '').slice(0, 490)
    const safeAdImageUrl = (adImageUrl || '').slice(0, 490)

    // Resolve Stripe promotion code if coupon provided; save coupon for duration info
    let promotionCodeId: string | undefined
    let promoCodeCoupon: any
    if (coupon) {
      const promoCodes = await stripe.promotionCodes.list({ code: coupon, active: true, limit: 1 })
      if (promoCodes.data.length > 0) {
        promotionCodeId = promoCodes.data[0].id
        promoCodeCoupon = promoCodes.data[0].coupon
      }
    }
    console.log('Coupon received:', coupon)
    console.log('Promotion code ID found:', promotionCodeId)

    const pollKey = crypto.randomUUID()

    const subscriptionParams: any = {
      customer:         customer.id,
      items:            [{ price: planConfig.priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand:           ['latest_invoice.payment_intent'],
      ...(promotionCodeId ? { discounts: [{ promotion_code: promotionCodeId }] } : {}),
      metadata: {
        firstName, lastName, restaurantName, email, zipCode,
        phone, address, restaurantType, plan,
        website:     (website || '').slice(0, 490),
        logoUrl:     safeLogoUrl,
        adImageUrl:  safeAdImageUrl,
        offerTitle:       (offerTitle       || '').slice(0, 490),
        offerDescription: (offerDescription || '').slice(0, 490),
        offerType:        offerType   || 'free_item',
        adHeadline:       (adHeadline  || '').slice(0, 490),
        adSubheadline:    (adSubheadline || '').slice(0, 490),
        adTemplate:       adTemplate  || 'full_bleed',
        adColor:          adColor     || '#588aad',
        comeBackOffer:       (comeBackOffer       || '').slice(0, 490),
        additionalLocations: (additionalLocations || '[]').slice(0, 490),
        audienceTypes:    JSON.stringify(audienceTypes  || []),
        audienceAgeRange: audienceAgeRange || 'all',
        trafficTiming:    JSON.stringify(trafficTiming  || []),
        adDays:           JSON.stringify(adDays         || []),
        coupon:           coupon || '',
        pollKey:          pollKey,
      },
    }
    const subscription = await stripe.subscriptions.create(subscriptionParams)

    const invoice       = subscription.latest_invoice as any
    const paymentIntent = invoice?.payment_intent as any

    // subscription.discount.coupon is an embedded object under API v2024-04-10 —
    // populated synchronously when discount: [promotion_code] is passed.
    // promoCodeCoupon is a fallback in case discount is absent.
    const couponData = (subscription.discount as any)?.coupon ?? promoCodeCoupon
    const couponDuration: 'once' | 'repeating' | 'forever' | null = couponData?.duration ?? null
    const couponDurationInMonths: number | null = couponData?.duration_in_months ?? null
    const planPriceCents = planConfig.price * 100
    const recurringCents = (couponDuration === 'once' || couponDuration === 'repeating')
      ? planPriceCents
      : (invoice?.amount_due ?? planPriceCents)

    return NextResponse.json({
      subscriptionId:         subscription.id,
      clientSecret:           paymentIntent?.client_secret ?? null,
      skipPayment:            !paymentIntent?.client_secret,
      customerId:             customer.id,
      pollKey,
      amountDueCents:         invoice?.amount_due ?? 0,
      recurringCents,
      couponDuration,
      couponDurationInMonths,
    })

  } catch (err: any) {
    console.error('Checkout error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
