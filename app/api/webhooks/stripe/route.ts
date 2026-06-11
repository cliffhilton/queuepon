import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendRestaurantWelcome, sendPasswordSetupEmail, sendAdReadyEmail } from '@/lib/resend'
import { createMetaCampaign } from '@/lib/meta'

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

        // Generate password reset link
        // We use Supabase admin to get the token, then build our own URL
        try {
          const { data: linkData } = await supabase.auth.admin.generateLink({
            type:  'recovery',
            email: meta.email,
          })

          if (linkData?.properties?.hashed_token) {
            const appUrl   = process.env.NEXT_PUBLIC_APP_URL || 'https://queuepon.com'
            const setupUrl = `${appUrl}/auth/callback?token_hash=${linkData.properties.hashed_token}&type=recovery&next=/dashboard`
            await sendPasswordSetupEmail({
              to:             meta.email,
              firstName:      meta.firstName,
              restaurantName: meta.restaurantName,
              setupUrl,
            })
            console.log(`✅ Password setup email sent to ${meta.email}`)
          } else if (linkData?.properties?.action_link) {
            // Fallback: parse token from action_link and rebuild URL
            const appUrl    = process.env.NEXT_PUBLIC_APP_URL || 'https://queuepon.com'
            const actionUrl = new URL(linkData.properties.action_link as string)
            const token     = actionUrl.searchParams.get('token') 
                           || actionUrl.searchParams.get('token_hash') 
                           || ''
            const setupUrl  = `${appUrl}/auth/callback?token_hash=${token}&type=recovery&next=/dashboard`
            await sendPasswordSetupEmail({
              to:             meta.email,
              firstName:      meta.firstName,
              restaurantName: meta.restaurantName,
              setupUrl,
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
          website:               meta.website   || null,
          logo_url:              meta.logoUrl   || null,
        })
        .select()
        .single()

      if (restError) { console.error('Restaurant insert error:', restError); throw restError }
      console.log(`✅ Restaurant saved: ${meta.restaurantName} (${restaurant.id})`)

      // Save offer
      let offerSlug = ''
      if (meta.offerTitle) {
        offerSlug = `${meta.offerTitle.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')}-${Date.now()}`
        const { error: offerError } = await supabase
          .from('offers')
          .insert({
            restaurant_id:  restaurant.id,
            title:          meta.offerTitle,
            description:    meta.offerDescription,
            offer_type:     meta.offerType || 'free_item',
            slug:           offerSlug,
            status:         'live',
            ad_headline:    meta.adHeadline,
            ad_subheadline: meta.adSubheadline,
            ad_template:    meta.adTemplate  || 'full_bleed',
            ad_color:       meta.adColor     || '#588aad',
            ad_image_url:   meta.adImageUrl  || null,
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

      // Meta API campaign creation
      try {
        const landingPageUrl = `${process.env.NEXT_PUBLIC_APP_URL}/offers/${offerSlug}`
        const metaResult = await createMetaCampaign({
          restaurantName: meta.restaurantName,
          offerTitle:     meta.offerTitle,
          adHeadline:     meta.adHeadline,
          adSubheadline:  meta.adSubheadline,
          zipCode:        meta.zipCode,
          adImageUrl:     meta.adImageUrl || '',
          landingPageUrl,
          plan:           meta.plan,
          adColor:        meta.adColor || '#588aad',
        })
        // Save Meta campaign IDs to the offer
        if (metaResult) {
          await supabase.from('offers').update({
            meta_campaign_id: metaResult.campaignId,
            meta_adset_id:    metaResult.adSetId,
            meta_ad_id:       metaResult.adId,
            meta_ad_status:   'pending_review',
          }).eq('restaurant_id', restaurant.id)

          // Update restaurant meta_ad_status
          await supabase.from('restaurants').update({
            meta_ad_status: 'setting_up',
          }).eq('id', restaurant.id)

          console.log(`✅ Meta campaign created for ${meta.restaurantName}`)

          // Schedule 24hr "ad ready" email
          // We use setTimeout in a non-blocking way
          // In production this should be a proper job queue (Inngest, Upstash, etc.)
          const adReadyDelay = 24 * 60 * 60 * 1000 // 24 hours
          setTimeout(async () => {
            try {
              const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://queuepon.com'
              await sendAdReadyEmail({
                to:             meta.email,
                firstName:      meta.firstName,
                restaurantName: meta.restaurantName,
                offerTitle:     meta.offerTitle,
                dashboardUrl:   `${appUrl}/dashboard/ads`,
              })
              console.log(`✅ Ad ready email scheduled for ${meta.email}`)
            } catch (e) {
              console.error('Ad ready email error:', e)
            }
          }, adReadyDelay)
        }
      } catch (metaErr) {
        // Don't fail the whole webhook if Meta API fails
        console.error('Meta campaign creation error:', metaErr)
      }

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
