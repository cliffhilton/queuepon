import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { metaGet } from '@/lib/meta'

const PREVIEW_FORMATS = [
  'DESKTOP_FEED_STANDARD',
  'MOBILE_FEED_STANDARD',
  'INSTAGRAM_STANDARD',
] as const

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const log: string[] = []
  const results: Record<string, unknown>[] = []
  const now = new Date()

  const { data: testRests } = await supabase
    .from('restaurants')
    .select('id')
    .eq('is_test', true)
  const testIds = new Set((testRests ?? []).map(r => r.id))

  const { data: offers, error: offersErr } = await supabase
    .from('offers')
    .select('id, restaurant_id, meta_campaign_id, meta_adset_id, meta_ad_id, restaurants(id, name)')
    .not('meta_ad_id', 'is', null)

  if (offersErr) {
    return NextResponse.json({ error: offersErr.message }, { status: 500 })
  }

  for (const offer of offers ?? []) {
    const restaurant = offer.restaurants as any

    if (testIds.has(offer.restaurant_id)) {
      log.push(`⏭ Skipping ${restaurant?.name} — test restaurant`)
      continue
    }

    const entry: Record<string, unknown> = {
      offer_id: offer.id,
      restaurant: restaurant?.name,
      meta_ad_id: offer.meta_ad_id,
      meta_adset_id: offer.meta_adset_id,
      meta_campaign_id: offer.meta_campaign_id,
    }

    // ── Ad status fields ──────────────────────────────────────────────────
    try {
      const adData = await metaGet(offer.meta_ad_id, {
        fields: 'effective_status,configured_status,ad_review_feedback,issues_info',
      })
      entry.ad = {
        effective_status:   adData.effective_status,
        configured_status:  adData.configured_status,
        ad_review_feedback: adData.ad_review_feedback ?? null,
        issues_info:        adData.issues_info ?? null,
      }
      log.push(`✅ Ad ${offer.meta_ad_id} (${restaurant?.name}): effective=${adData.effective_status} configured=${adData.configured_status}`)
    } catch (e: any) {
      entry.ad_error = e.message
      log.push(`❌ Ad fetch failed for ${restaurant?.name}: ${e.message}`)
    }

    // ── Campaign status ───────────────────────────────────────────────────
    if (offer.meta_campaign_id) {
      try {
        const campaign = await metaGet(offer.meta_campaign_id, {
          fields: 'effective_status',
        })
        entry.campaign_effective_status = campaign.effective_status
      } catch (e: any) {
        entry.campaign_error = e.message
      }
    }

    // ── Ad set status ─────────────────────────────────────────────────────
    if (offer.meta_adset_id) {
      try {
        const adset = await metaGet(offer.meta_adset_id, {
          fields: 'effective_status',
        })
        entry.adset_effective_status = adset.effective_status
      } catch (e: any) {
        entry.adset_error = e.message
      }
    }

    // ── Ad previews ───────────────────────────────────────────────────────
    const previews: Record<string, unknown> = {}
    for (const format of PREVIEW_FORMATS) {
      try {
        const preview = await metaGet(`${offer.meta_ad_id}/previews`, {
          ad_format: format,
        })
        previews[format] = preview
      } catch (e: any) {
        previews[format] = { error: e.message }
      }
    }
    entry.previews = previews

    results.push(entry)
  }

  console.log(`[cron:sync-ad-status] ${now.toISOString()}\n${log.join('\n')}`)
  return NextResponse.json({ success: true, log, results, ran: now.toISOString() })
}
