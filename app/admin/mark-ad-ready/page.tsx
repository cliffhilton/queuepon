import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyAdReadyToken, hashToken } from '@/lib/ad-token'
import { sendAdReadyEmail } from '@/lib/resend'
import { metaGet } from '@/lib/meta'

export const metadata: Metadata = { robots: 'noindex' }

const DISAPPROVED = new Set(['DISAPPROVED', 'WITH_ISSUES'])

function sp(v: string | string[] | undefined): string {
  return (Array.isArray(v) ? v[0] : v) ?? ''
}

export default async function MarkAdReadyPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  // ── Success state ────────────────────────────────────────────────────────
  if (sp(searchParams.confirmed) === '1') {
    const name = sp(searchParams.restaurant)
    return (
      <Shell>
        <Box bg="#e8f5e9" border="#a5d6a7">
          <Big>✅</Big>
          <H1 color="#1b5e20">Owner emailed</H1>
          <P color="#388e3c">{name ? `${name} has been notified.` : 'The owner has been notified.'}</P>
        </Box>
      </Shell>
    )
  }

  const token = sp(searchParams.token)
  if (!token) return <Err msg="Invalid link — no token provided." />

  const verified = verifyAdReadyToken(token)
  if (!verified) return <Err msg="This link is invalid or has expired." />

  const supabase = createAdminClient()
  const { data: offer } = await supabase
    .from('offers')
    .select('id, title, restaurant_id, meta_ad_id, meta_ad_state, admin_token_hash, admin_token_consumed_at, restaurants(name, email, owner_first)')
    .eq('id', verified.offerId)
    .single()

  if (!offer) return <Err msg="Offer not found." />
  if (offer.admin_token_hash !== hashToken(token)) return <Err msg="This link has been superseded by a newer one." />
  if (offer.admin_token_consumed_at) return <Err msg="This link has already been used." />
  if (offer.meta_ad_state === 'needs_admin_fix') {
    return <Err msg="This ad has issues. Fix it in Meta first, then wait for the re-review alert." />
  }

  // ── Check Meta effective_status ──────────────────────────────────────────
  let metaStatus = ''
  let metaCheckFailed = false
  try {
    const adData = await metaGet(offer.meta_ad_id ?? '', { fields: 'effective_status' })
    metaStatus = adData.effective_status ?? ''
  } catch {
    metaCheckFailed = true
  }

  const restaurant = offer.restaurants as any
  const adName     = `${restaurant?.name ?? ''} — ${offer.title}`
  const errFlag    = sp(searchParams.err)

  // ── Server Action ────────────────────────────────────────────────────────
  async function confirm(formData: FormData) {
    'use server'
    const t = (formData.get('token') ?? '') as string
    const v = verifyAdReadyToken(t)
    if (!v) return

    const db = createAdminClient()
    const { data: o } = await db
      .from('offers')
      .select('id, title, restaurant_id, meta_ad_id, admin_token_hash, admin_token_consumed_at, meta_ad_state, restaurants(name, email, owner_first)')
      .eq('id', v.offerId)
      .single()

    if (!o) return
    if (hashToken(t) !== o.admin_token_hash) return
    if (o.admin_token_consumed_at) {
      redirect(`/admin/mark-ad-ready?token=${encodeURIComponent(t)}`)
    }
    if (o.meta_ad_state === 'needs_admin_fix') return

    // Re-check Meta before consuming the token
    try {
      const adData = await metaGet((o.meta_ad_id ?? '') as string, { fields: 'effective_status' })
      const status: string = adData.effective_status ?? ''
      if (DISAPPROVED.has(status)) {
        redirect(`/admin/mark-ad-ready?token=${encodeURIComponent(t)}`)
      }
    } catch {
      // Meta unreachable — let admin proceed; cron will catch any disapproval
    }

    const nowIso = new Date().toISOString()

    // Conditional update — idempotency guard
    const { data: updated } = await db
      .from('offers')
      .update({
        meta_ad_state:            'ready_for_owner',
        meta_ad_state_changed_at: nowIso,
        ready_marked_at:          nowIso,
        admin_token_consumed_at:  nowIso,
        ad_ready_email_sent_at:   nowIso,
      })
      .eq('id', o.id)
      .is('admin_token_consumed_at', null)
      .select('id')
      .single()

    if (!updated) {
      // Race condition — token consumed by a concurrent request
      redirect(`/admin/mark-ad-ready?token=${encodeURIComponent(t)}`)
    }

    // Guard old timed cron from double-sending
    await db.from('restaurants').update({ ad_ready_email_sent_at: nowIso }).eq('id', o.restaurant_id)

    const rest = o.restaurants as any
    let emailOk = false
    try {
      await sendAdReadyEmail({
        to:             rest.email,
        firstName:      rest.owner_first,
        restaurantName: rest.name,
        offerTitle:     o.title,
        dashboardUrl:   `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/ads`,
      })
      emailOk = true
    } catch (e) {
      console.error('Owner ad-ready email failed:', e)
    }

    if (!emailOk) {
      // Revert consumed flag so admin can retry
      await db.from('offers').update({ admin_token_consumed_at: null }).eq('id', o.id)
      redirect(`/admin/mark-ad-ready?token=${encodeURIComponent(t)}&err=email`)
    }

    redirect(`/admin/mark-ad-ready?confirmed=1&restaurant=${encodeURIComponent(rest.name ?? '')}`)
  }

  // ── Render form ──────────────────────────────────────────────────────────
  return (
    <Shell>
      <H1 color="#2a5070">Mark ad ready for owner</H1>
      <p style={{ color: '#888', margin: '4px 0 24px', fontSize: 14 }}>
        Only confirm after Meta's "Your ad was approved" email arrives.
      </p>

      {errFlag === 'email' && (
        <Box bg="#fff8e1" border="#ffe082">
          <p style={{ margin: 0, color: '#e65100', fontSize: 14, fontWeight: 600 }}>
            Email delivery failed. The link is still valid — try again.
          </p>
        </Box>
      )}

      {DISAPPROVED.has(metaStatus) && (
        <Box bg="#fff3f3" border="#ffcdd2">
          <p style={{ margin: 0, color: '#c62828', fontSize: 14 }}>
            <strong>Ad is currently {metaStatus} in Meta.</strong> Fix it first, then wait for the re-review alert with a new link.
          </p>
        </Box>
      )}

      {metaCheckFailed && (
        <Box bg="#fff8e1" border="#ffe082">
          <p style={{ margin: 0, color: '#e65100', fontSize: 14 }}>
            Could not reach Meta to verify ad status. Proceed only if you have confirmed approval.
          </p>
        </Box>
      )}

      <Box bg="#f7f9fc" border="#dde4ef">
        <Row label="Ad name"    value={adName} />
        <Row label="Offer"      value={offer.title} />
        <Row label="Ad ID"      value={offer.meta_ad_id ?? '—'} mono />
        <Row label="Meta state" value={metaStatus || '(checking failed)'} />
        <Row label="DB state"   value={offer.meta_ad_state ?? '—'} />
      </Box>

      {!DISAPPROVED.has(metaStatus) && (
        <form action={confirm}>
          <input type="hidden" name="token" value={token} />
          <button
            type="submit"
            style={{ background: '#588aad', color: '#fff', fontWeight: 700, padding: '14px 32px', borderRadius: 10, border: 'none', fontSize: 16, cursor: 'pointer', marginTop: 8 }}
          >
            Confirm — email owner
          </button>
        </form>
      )}
    </Shell>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return <div style={{ fontFamily: 'sans-serif', maxWidth: 540, margin: '72px auto', padding: '0 24px', color: '#333' }}>{children}</div>
}
function Box({ children, bg, border }: { children: React.ReactNode; bg: string; border: string }) {
  return <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: 10, padding: '16px 20px', marginBottom: 20 }}>{children}</div>
}
function H1({ children, color }: { children: React.ReactNode; color: string }) {
  return <h1 style={{ fontSize: 22, color, margin: '0 0 4px' }}>{children}</h1>
}
function P({ children, color }: { children: React.ReactNode; color: string }) {
  return <p style={{ color, margin: 0, fontSize: 15 }}>{children}</p>
}
function Big({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 40, marginBottom: 12 }}>{children}</div>
}
function Row({ label, value, mono }: { label: string; value?: string | null; mono?: boolean }) {
  return (
    <div style={{ display: 'flex', gap: 12, marginBottom: 10, fontSize: 14 }}>
      <span style={{ color: '#888', width: 110, flexShrink: 0 }}>{label}</span>
      <span style={mono ? { fontFamily: 'monospace', fontSize: 12, wordBreak: 'break-all' } : { fontWeight: 600 }}>{value ?? '—'}</span>
    </div>
  )
}
function Err({ msg }: { msg: string }) {
  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 500, margin: '80px auto', padding: '0 24px' }}>
      <div style={{ background: '#fff3f3', border: '1px solid #ffcdd2', borderRadius: 12, padding: '28px 32px', textAlign: 'center' }}>
        <div style={{ fontSize: 36, marginBottom: 16 }}>⚠️</div>
        <p style={{ color: '#c62828', margin: 0, fontSize: 16 }}>{msg}</p>
      </div>
    </div>
  )
}
