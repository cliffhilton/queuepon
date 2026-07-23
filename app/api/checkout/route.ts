import { NextRequest, NextResponse } from 'next/server'
import { stripe, PLANS, PlanKey } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      plan, email, firstName, lastName, restaurantName, zipCode,
      phone, address, restaurantType, website, logoUrl, adImageUrl,
      offerTitle, offerDescription, offerType,
      adHeadline, adSubheadline, adTemplate, adColor,
      audienceTypes, audienceAgeRange, trafficTiming, adDays,
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

    const subscription = await stripe.subscriptions.create({
      customer:         customer.id,
      items:            [{ price: planConfig.priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand:           ['latest_invoice.payment_intent'],
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
        audienceTypes:    JSON.stringify(audienceTypes  || []),
        audienceAgeRange: audienceAgeRange || 'all',
        trafficTiming:    JSON.stringify(trafficTiming  || []),
        adDays:           JSON.stringify(adDays         || []),
      },
    })

    const invoice       = subscription.latest_invoice as any
    const paymentIntent = invoice?.payment_intent as any

    return NextResponse.json({
      subscriptionId: subscription.id,
      clientSecret:   paymentIntent?.client_secret,
      customerId:     customer.id,
    })

  } catch (err: any) {
    console.error('Checkout error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
