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

    const subscription = await stripe.subscriptions.create({
      customer:         customer.id,
      items:            [{ price: planConfig.priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand:           ['latest_invoice.payment_intent'],
      metadata: {
        firstName, lastName, restaurantName, email, zipCode,
        phone, address, restaurantType, plan,
        website:     website     || '',
        logoUrl:     logoUrl     || '',
        adImageUrl:  adImageUrl  || '',
        offerTitle, offerDescription, offerType,
        adHeadline, adSubheadline, adTemplate, adColor,
      },
    })

    const invoice      = subscription.latest_invoice as any
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
