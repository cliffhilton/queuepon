import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendRestaurantWelcome, sendPasswordSetupEmail } from '@/lib/resend'

export async function POST(req: NextRequest) {
  const body      = await req.text()
  const signature = req.headers.get('stripe-signature') ?? ''

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    console.error('Webhook signature failed:', err.message)
    return NextResponse.json({ error: `Webhook error: ${err.message}` }, { status: 400 })
  }

  const supabase = createAdminClient()

  if (event.type === 'customer.subscription.created' ||
      event.type === 'invoice.payment_succeeded') {

    const obj   = event.data.object as any
    const subId = obj.subscription ?? obj.id
    if (!subId) return NextResponse.json({ received: true })

    try {
      const subscription = await stripe.subscriptions.retrieve(subId)
      const meta = subscription.metadata ?? {}
      if (!meta.restaurantName) return NextResponse.json({ received: true })

      // Check if restaurant already exists
      const { data: existing } = await supabase
        .from('restaurants')
        .select('id')
        .eq('stripe_subscription_id', subId)
        .single()

      if (existing) {
        console.log(`Restaurant already exists for subscription ${subId}`)
        return NextResponse.json({ received: true })
      }

      // Create Supabase auth user
      let userId: string | null = null
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email:         meta.email,
        email_confirm: true,
        user_metadata: { restaurantName: meta.restaurantName, firstName: meta.firstName },
      })

      if (authError && !authError.message.includes('already registered')) {
        console.error('Auth user creation error:', authError)
      } else if (authData?.user) {
        userId = authData.user.id
        console.log(`✅ Auth user created: ${meta.email}`)

        // Generate password reset link for them to set their password
        try {
          const { data: linkData } = await supabase.auth.admin.generateLink({
            type:  'recovery',
            email: meta.email,
            options: { redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/dashboard` },
          })

          if (linkData?.properties?.action_link) {
            await sendPasswordSetupEmail({
              to:             meta.email,
              firstName:      meta.firstName,
              restaurantName: meta.restaurantName,
              setupUrl:       linkData.properties.action_link,
            })
            console.log(`✅ Password setup email sent to ${meta.email}`)
          }
        } catch (e) {
          console.error('Password setup email error:', e)
        }
      }

      // Save restaurant
      const { data: restaurant, error: restError } = await supabase
        .from('restaurants')
        .insert({
          name:                  meta.restaurantName,
          owner_first:           meta.firstName,
          owner_last:            meta.lastName,
          email:                 meta.email,
          phone:                 meta.phone,
          zip_code:              meta.zipCode,
          address:               meta.address,
          restaurant_type:       meta.restaurantType,
          plan:                  meta.plan,
          plan_price:            subscription.items.data[0]?.price?.unit_amount
                                   ? subscription.items.data[0].price.unit_amount / 100 : 0,
          stripe_customer_id:    subscription.customer as string,
          stripe_subscription_id: subId,
          status:                'active',
          meta_ad_status:        'setting_up',
          user_id:               userId,
        })
        .select()
        .single()

      if (restError) { console.error('Restaurant insert error:', restError); throw restError }
      console.log(`✅ Restaurant saved: ${meta.restaurantName} (${restaurant.id})`)

      // Save offer
      if (meta.offerTitle) {
        const slug = `${meta.offerTitle.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')}-${Date.now()}`
        const { error: offerError } = await supabase
          .from('offers')
          .insert({
            restaurant_id:  restaurant.id,
            title:          meta.offerTitle,
            description:    meta.offerDescription,
            offer_type:     meta.offerType || 'free_item',
            slug,
            status:         'live',
            ad_headline:    meta.adHeadline,
            ad_subheadline: meta.adSubheadline,
            ad_template:    meta.adTemplate || 'full_bleed',
            ad_color:       meta.adColor || '#588aad',
          })
        if (offerError) console.error('Offer insert error:', offerError)
        else console.log(`✅ Offer saved: ${meta.offerTitle}`)
      }

      // Send welcome email
      try {
        await sendRestaurantWelcome({
          to: meta.email, firstName: meta.firstName,
          restaurantName: meta.restaurantName, plan: meta.plan, zipCode: meta.zipCode,
        })
        console.log(`✅ Welcome email sent to ${meta.email}`)
      } catch (e) { console.error('Welcome email error:', e) }

      // TODO: Meta API campaign creation
      // await createMetaCampaign({ restaurant, meta })

    } catch (err) {
      console.error('Webhook processing error:', err)
      return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as Stripe.Subscription
    await supabase.from('restaurants').update({ status: 'cancelled' })
      .eq('stripe_subscription_id', sub.id)
  }

  if (event.type === 'invoice.payment_failed') {
    const invoice = event.data.object as Stripe.Invoice
    await supabase.from('restaurants').update({ status: 'paused' })
      .eq('stripe_customer_id', invoice.customer as string)
  }

  return NextResponse.json({ received: true })
}
