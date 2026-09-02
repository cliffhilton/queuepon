import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  sendReminderEmail,
  sendBringAFriendEmail,
  sendComeBackCustomerEmail,
  sendComeBackOwnerSetupEmail,
  sendAdReadyEmail,
} from '@/lib/resend'

const DEFAULT_IMAGE = 'https://dvxmwudqmpyudfggmadm.supabase.co/storage/v1/object/public/offer-images/default/531196a9-de9b-45dd-8d3e-19c528e9b8c1.jpg'

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const appUrl   = process.env.NEXT_PUBLIC_APP_URL || 'https://queuepon.com'
  const log: string[] = []
  const now = new Date()

  const daysAgo = (n: number) =>
    new Date(now.getTime() - n * 24 * 60 * 60 * 1000).toISOString()

  // ── a. Day 3 owner: Come Back setup prompt ────────────────────────────
  // Fires once per restaurant, 3+ days after signup, only when Come Back
  // offer text hasn't been configured yet.
  try {
    const { data: restaurants } = await supabase
      .from('restaurants')
      .select('id, email, owner_first, name')
      .lte('created_at', daysAgo(3))
      .is('come_back_offer_text', null)
      .is('come_back_setup_email_sent_at', null)
      .eq('status', 'active')

    for (const r of restaurants ?? []) {
      try {
        await sendComeBackOwnerSetupEmail({
          to:             r.email,
          firstName:      r.owner_first,
          restaurantName: r.name,
          dashboardUrl:   `${appUrl}/dashboard/offers`,
        })
        await supabase.from('restaurants')
          .update({ come_back_setup_email_sent_at: now.toISOString() })
          .eq('id', r.id)
        log.push(`✅ [day3-owner] Come Back prompt → ${r.email} (${r.name})`)
      } catch (e: any) {
        log.push(`❌ [day3-owner] ${r.email}: ${e.message}`)
      }
    }
  } catch (e: any) {
    log.push(`❌ [day3-owner] Query failed: ${e.message}`)
  }

  // ── b. Day 3 customer: "Don't Miss Out" ──────────────────────────────
  try {
    const { data: customers } = await supabase
      .from('customers')
      .select('id, email, first_name, emails_sent, restaurant_id, offer_id')
      .lte('created_at', daysAgo(3))
      .is('day3_email_sent_at', null)
      .eq('sequence_status', 'active')

    for (const c of customers ?? []) {
      try {
        const { data: restaurant } = await supabase
          .from('restaurants').select('name').eq('id', c.restaurant_id).single()
        const { data: offer } = await supabase
          .from('offers').select('title').eq('id', c.offer_id).single()

        if (!restaurant || !offer) {
          log.push(`⚠️ [day3-customer] Missing restaurant/offer for customer ${c.id}`)
          continue
        }

        await sendReminderEmail({
          to:             c.email,
          firstName:      c.first_name || 'there',
          restaurantName: restaurant.name,
          offerTitle:     offer.title,
        })
        await supabase.from('customers')
          .update({ day3_email_sent_at: now.toISOString(), emails_sent: (c.emails_sent ?? 0) + 1 })
          .eq('id', c.id)
        log.push(`✅ [day3-customer] Don't Miss Out → ${c.email}`)
      } catch (e: any) {
        log.push(`❌ [day3-customer] ${c.email}: ${e.message}`)
      }
    }
  } catch (e: any) {
    log.push(`❌ [day3-customer] Query failed: ${e.message}`)
  }

  // ── c. Day 10 customer: "Bring a Friend" ─────────────────────────────
  try {
    const { data: customers } = await supabase
      .from('customers')
      .select('id, email, first_name, emails_sent, restaurant_id, offer_id')
      .lte('created_at', daysAgo(10))
      .is('day10_email_sent_at', null)
      .eq('sequence_status', 'active')

    for (const c of customers ?? []) {
      try {
        const { data: restaurant } = await supabase
          .from('restaurants').select('name').eq('id', c.restaurant_id).single()
        const { data: offer } = await supabase
          .from('offers').select('title, slug').eq('id', c.offer_id).single()

        if (!restaurant || !offer) {
          log.push(`⚠️ [day10-customer] Missing restaurant/offer for customer ${c.id}`)
          continue
        }

        await sendBringAFriendEmail({
          to:             c.email,
          firstName:      c.first_name || 'there',
          restaurantName: restaurant.name,
          offerTitle:     offer.title,
          landingPageUrl: `${appUrl}/offers/${offer.slug}`,
        })
        await supabase.from('customers')
          .update({ day10_email_sent_at: now.toISOString(), emails_sent: (c.emails_sent ?? 0) + 1 })
          .eq('id', c.id)
        log.push(`✅ [day10-customer] Bring a Friend → ${c.email}`)
      } catch (e: any) {
        log.push(`❌ [day10-customer] ${c.email}: ${e.message}`)
      }
    }
  } catch (e: any) {
    log.push(`❌ [day10-customer] Query failed: ${e.message}`)
  }

  // ── d. Day 25 customer: "Come Back" offer ─────────────────────────────
  // Skips if restaurant hasn't configured come_back_offer_text yet.
  // Stops retrying after 60 days so stale customers don't queue forever.
  try {
    const { data: customers } = await supabase
      .from('customers')
      .select('id, email, first_name, emails_sent, restaurant_id, offer_id')
      .lte('created_at', daysAgo(25))
      .gte('created_at', daysAgo(60))
      .is('day25_email_sent_at', null)
      .eq('sequence_status', 'active')

    for (const c of customers ?? []) {
      try {
        const { data: restaurant } = await supabase
          .from('restaurants')
          .select('name, come_back_offer_text, come_back_offer_image_url')
          .eq('id', c.restaurant_id).single()
        const { data: offer } = await supabase
          .from('offers').select('title, slug, ad_image_url').eq('id', c.offer_id).single()

        if (!restaurant || !offer) {
          log.push(`⚠️ [day25-customer] Missing restaurant/offer for customer ${c.id}`)
          continue
        }

        if (!restaurant.come_back_offer_text) {
          log.push(`⏭ [day25-customer] Skipping ${c.email} — Come Back offer not configured for ${restaurant.name}`)
          continue
        }

        const imageUrl = restaurant.come_back_offer_image_url || offer.ad_image_url || DEFAULT_IMAGE

        await sendComeBackCustomerEmail({
          to:                c.email,
          firstName:         c.first_name || 'there',
          restaurantName:    restaurant.name,
          comeBackOfferText: restaurant.come_back_offer_text,
          imageUrl,
          landingPageUrl:    `${appUrl}/offers/${offer.slug}`,
        })
        await supabase.from('customers')
          .update({ day25_email_sent_at: now.toISOString(), emails_sent: (c.emails_sent ?? 0) + 1 })
          .eq('id', c.id)
        log.push(`✅ [day25-customer] Come Back → ${c.email} (${restaurant.name})`)
      } catch (e: any) {
        log.push(`❌ [day25-customer] ${c.email}: ${e.message}`)
      }
    }
  } catch (e: any) {
    log.push(`❌ [day25-customer] Query failed: ${e.message}`)
  }

  // ── e. ~24hr: Ad ready review prompt ──────────────────────────────────
  // Replaces the fragile setTimeout that was in the Stripe webhook.
  // Fires once when the restaurant is 24+ hours old and has a
  // pending_review offer (Meta campaign built successfully).
  // 7-day cutoff prevents re-checking indefinitely if Meta campaign never builds.
  try {
    const { data: restaurants } = await supabase
      .from('restaurants')
      .select('id, email, owner_first, name')
      .lte('created_at', daysAgo(1))
      .gte('created_at', daysAgo(7))
      .is('ad_ready_email_sent_at', null)
      .eq('status', 'active')

    for (const r of restaurants ?? []) {
      try {
        const { data: offer } = await supabase
          .from('offers')
          .select('title, meta_ad_status')
          .eq('restaurant_id', r.id)
          .eq('meta_ad_status', 'pending_review')
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (!offer) {
          log.push(`⏭ [ad-ready] Skipping ${r.name} — no pending_review offer yet`)
          continue
        }

        await sendAdReadyEmail({
          to:             r.email,
          firstName:      r.owner_first,
          restaurantName: r.name,
          offerTitle:     offer.title,
          dashboardUrl:   `${appUrl}/dashboard/ads`,
        })
        await supabase.from('restaurants')
          .update({ ad_ready_email_sent_at: now.toISOString() })
          .eq('id', r.id)
        log.push(`✅ [ad-ready] Ad review prompt → ${r.email} (${r.name})`)
      } catch (e: any) {
        log.push(`❌ [ad-ready] ${r.email}: ${e.message}`)
      }
    }
  } catch (e: any) {
    log.push(`❌ [ad-ready] Query failed: ${e.message}`)
  }

  console.log(`[cron:send-scheduled-emails] ${now.toISOString()}\n${log.join('\n')}`)
  return NextResponse.json({ success: true, log, ran: now.toISOString() })
}
