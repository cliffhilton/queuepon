import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { metaGet } from '@/lib/meta'
import { generateAdReadyToken, hashToken } from '@/lib/ad-token'
import {
  sendAdminAdAlert,
  sendAdminAdReminder,
  sendAdminReReviewAlert,
} from '@/lib/resend'

const APP_URL     = process.env.NEXT_PUBLIC_APP_URL || 'https://queuepon.com'
const DISAPPROVED = new Set(['DISAPPROVED', 'WITH_ISSUES'])
const REMINDER_MS = 24 * 60 * 60 * 1000

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const log: string[] = []
  const now = new Date()

  const { data: testRests } = await supabase
    .from('restaurants')
    .select('id')
    .eq('is_test', true)
  const testIds = new Set((testRests ?? []).map(r => r.id))

  // Only process offers that have entered the state machine (meta_ad_state not null)
  const { data: offers, error: offersErr } = await supabase
    .from('offers')
    .select(`
      id, title, restaurant_id,
      meta_ad_id,
      meta_ad_state,
      admin_alerted_at, admin_last_reminder_at,
      admin_token_hash, admin_token_consumed_at,
      restaurants(name, email, is_test)
    `)
    .not('meta_ad_id', 'is', null)
    .not('meta_ad_state', 'is', null)

  if (offersErr) {
    return NextResponse.json({ error: offersErr.message }, { status: 500 })
  }

  for (const offer of offers ?? []) {
    const restaurant = offer.restaurants as any
    if (testIds.has(offer.restaurant_id) || restaurant?.is_test) {
      log.push(`⏭ ${restaurant?.name} — test restaurant`)
      continue
    }

    const restaurantName: string = restaurant?.name ?? offer.restaurant_id
    const ownerEmail: string     = restaurant?.email ?? ''
    const adName: string         = `${restaurantName} — ${offer.title}`
    const currentState: string   = offer.meta_ad_state ?? ''
    const updates: Record<string, any> = {}

    try {
      const adData = await metaGet(offer.meta_ad_id, {
        fields: 'effective_status,configured_status,ad_review_feedback,issues_info',
      })
      const effectiveStatus: string  = adData.effective_status ?? ''
      const configuredStatus: string = adData.configured_status ?? ''

      const freshMarkReadyUrl = (): string => {
        const t = generateAdReadyToken(offer.id)
        updates.admin_token_hash        = hashToken(t)
        updates.admin_token_consumed_at = null
        return `${APP_URL}/admin/mark-ad-ready?token=${encodeURIComponent(t)}`
      }

      if (DISAPPROVED.has(effectiveStatus)) {
        // ── Transition to needs_admin_fix (alert once per new issue) ──────
        if (currentState !== 'needs_admin_fix') {
          const issueSummary =
            (adData.ad_review_feedback?.global as string[] | undefined)?.join('; ')
            ?? (adData.issues_info as any[])?.[0]?.error_message
            ?? effectiveStatus

          const markReadyUrl = freshMarkReadyUrl()
          const nowIso = now.toISOString()
          updates.meta_ad_state            = 'needs_admin_fix'
          updates.meta_ad_state_changed_at = nowIso
          updates.meta_ad_issue_summary    = issueSummary
          updates.admin_alerted_at         = nowIso
          updates.admin_last_reminder_at   = null

          try {
            await sendAdminAdAlert({ restaurantName, ownerEmail, adId: offer.meta_ad_id, adName, markReadyUrl })
            log.push(`📧 Admin alerted (${effectiveStatus}): ${restaurantName}`)
          } catch (e: any) {
            log.push(`❌ Admin alert failed: ${e.message}`)
          }
        }
        log.push(`⚠ ${restaurantName}: ${effectiveStatus} (state: ${updates.meta_ad_state ?? currentState})`)

      } else if (currentState === 'needs_admin_fix') {
        // ── Ad left DISAPPROVED — back in Meta review ─────────────────────
        const markReadyUrl = freshMarkReadyUrl()
        const nowIso = now.toISOString()
        updates.meta_ad_state            = 'in_review'
        updates.meta_ad_state_changed_at = nowIso
        updates.meta_ad_issue_summary    = null
        updates.admin_alerted_at         = nowIso
        updates.admin_last_reminder_at   = null

        try {
          await sendAdminReReviewAlert({ restaurantName, ownerEmail, adId: offer.meta_ad_id, adName, markReadyUrl })
          log.push(`📧 Re-review alert sent: ${restaurantName}`)
        } catch (e: any) {
          log.push(`❌ Re-review alert failed: ${e.message}`)
        }
        log.push(`🔄 ${restaurantName}: needs_admin_fix → in_review (${effectiveStatus})`)

      } else if (currentState === 'live') {
        // ── Sync live → paused (paused in Ads Manager) ───────────────────
        if (effectiveStatus === 'PAUSED' && configuredStatus === 'PAUSED') {
          updates.meta_ad_state            = 'paused'
          updates.meta_ad_state_changed_at = now.toISOString()
          log.push(`⏸ ${restaurantName}: live → paused`)
        }
      } else if (currentState === 'paused') {
        // ── Sync paused → live (resumed in Ads Manager) ──────────────────
        if (effectiveStatus === 'ACTIVE') {
          updates.meta_ad_state            = 'live'
          updates.meta_ad_state_changed_at = now.toISOString()
          log.push(`▶ ${restaurantName}: paused → live`)
        }
      }

      // ── 24-hour admin reminder (only on quiet in_review ticks) ─────────
      const finalState = updates.meta_ad_state ?? currentState
      if (Object.keys(updates).length === 0 && finalState === 'in_review') {
        const alertedAt    = offer.admin_alerted_at       ? new Date(offer.admin_alerted_at).getTime()       : null
        const lastReminder = offer.admin_last_reminder_at ? new Date(offer.admin_last_reminder_at).getTime() : null
        const msSinceAlert    = alertedAt    != null ? now.getTime() - alertedAt    : null
        const msSinceReminder = lastReminder != null ? now.getTime() - lastReminder : Infinity

        if (
          msSinceAlert != null &&
          msSinceAlert > REMINDER_MS &&
          msSinceReminder > REMINDER_MS &&
          !offer.admin_token_consumed_at
        ) {
          const hoursWaiting = Math.floor(msSinceAlert / (60 * 60 * 1000))
          const markReadyUrl = freshMarkReadyUrl()
          updates.admin_last_reminder_at = now.toISOString()

          try {
            await sendAdminAdReminder({
              restaurantName, ownerEmail, adId: offer.meta_ad_id,
              adName, markReadyUrl, hoursWaiting,
            })
            log.push(`📧 Reminder (${hoursWaiting}h): ${restaurantName}`)
          } catch (e: any) {
            log.push(`❌ Reminder failed: ${e.message}`)
          }
        }
      }

      if (Object.keys(updates).length > 0) {
        await supabase.from('offers').update(updates).eq('id', offer.id)
      } else {
        log.push(`✅ ${restaurantName}: ${effectiveStatus} (${currentState}, no change)`)
      }

    } catch (e: any) {
      log.push(`❌ ${restaurantName}: ${e.message}`)
    }
  }

  console.log(`[cron:sync-ad-status] ${now.toISOString()}\n${log.join('\n')}`)
  return NextResponse.json({ success: true, log, ran: now.toISOString() })
}
