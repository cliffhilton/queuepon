import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { metaGet } from '@/lib/meta'

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const log: string[] = []
  const now = new Date()

  // Monday of the current ISO week — repeated daily runs update the same row.
  const dayOfWeek = now.getDay() // 0 = Sunday
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  const weekStartDate = new Date(now)
  weekStartDate.setDate(now.getDate() - daysToMonday)
  const weekStart = weekStartDate.toISOString().slice(0, 10) // YYYY-MM-DD

  // Pre-fetch test restaurant IDs to exclude — avoids embedded-join column resolution
  // issues in PostgREST and mirrors the pattern used in send-scheduled-emails.
  const { data: testRests } = await supabase
    .from('restaurants')
    .select('id')
    .eq('is_test', true)
  const testIds = new Set((testRests ?? []).map(r => r.id))

  // All offers with a Meta campaign.
  const { data: offers, error: offersErr } = await supabase
    .from('offers')
    .select('id, restaurant_id, meta_campaign_id, restaurants(id, name)')
    .not('meta_campaign_id', 'is', null)

  if (offersErr) {
    return NextResponse.json({ error: offersErr.message }, { status: 500 })
  }

  for (const offer of offers ?? []) {
    const restaurant = offer.restaurants as any

    if (testIds.has(offer.restaurant_id)) {
      log.push(`⏭ [meta-sync] Skipping ${restaurant?.name} — test restaurant`)
      continue
    }

    try {
      const insights = await metaGet(`${offer.meta_campaign_id}/insights`, {
        date_preset: 'last_7_days',
        fields:      'impressions,clicks,reach,spend,ctr',
      })

      const d = insights.data?.[0]
      if (!d) {
        log.push(`⏭ [meta-sync] No insights data yet for ${restaurant.name} (campaign ${offer.meta_campaign_id})`)
        continue
      }

      const impressions = parseInt(d.impressions ?? '0', 10)
      const clicks      = parseInt(d.clicks      ?? '0', 10)
      const reach       = parseInt(d.reach        ?? '0', 10)
      const spend       = parseFloat(d.spend      ?? '0')
      const ctr         = parseFloat(d.ctr        ?? '0')

      // estimated_visits = clicks as a rough proxy for now.
      // Meta doesn't expose landing-page visits via Insights — this is a stand-in
      // until real analytics (Plausible, GA4, or custom events) are wired.
      const estimatedVisits = clicks

      await supabase
        .from('meta_ad_stats')
        .upsert(
          {
            restaurant_id:    offer.restaurant_id,
            offer_id:         offer.id,
            week_start:       weekStart,
            impressions,
            clicks,
            reach,
            spend,
            ctr,
            estimated_visits: estimatedVisits,
          },
          { onConflict: 'restaurant_id,offer_id,week_start' },
        )

      log.push(
        `✅ [meta-sync] ${restaurant.name}: ${impressions.toLocaleString()} impressions, ` +
        `${clicks} clicks, ${reach.toLocaleString()} reach, $${spend.toFixed(2)} spend`,
      )
    } catch (e: any) {
      log.push(`❌ [meta-sync] ${restaurant?.name ?? offer.restaurant_id}: ${e.message}`)
    }
  }

  console.log(`[cron:sync-meta-stats] ${now.toISOString()}\n${log.join('\n')}`)
  return NextResponse.json({ success: true, log, weekStart, ran: now.toISOString() })
}
