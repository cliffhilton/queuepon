// TEMPORARY — delete after Meta adimages investigation is complete
// Hit: GET /api/debug/meta-research?secret=<CRON_SECRET>[&v=v25.0]
import { NextRequest, NextResponse } from 'next/server'
import { DEFAULT_HERO_URL } from '@/lib/images'

function sanitizeError(e: any) {
  if (!e) return null
  return {
    code:           e.code,
    error_subcode:  e.error_subcode,
    fbtrace_id:     e.fbtrace_id,
    error_user_msg: e.error_user_msg,
    message:        e.message,
    type:           e.type,
  }
}

function uploadResult(d: any) {
  return d.error
    ? { ok: false, error: sanitizeError(d.error) }
    : { ok: true,  image_keys: Object.keys(d.images ?? {}) }
}

export async function GET(req: NextRequest) {
  if (req.nextUrl.searchParams.get('secret') !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const rawVersion = req.nextUrl.searchParams.get('v') ?? 'v19.0'
  const apiVersion = /^v\d+\.\d+$/.test(rawVersion) ? rawVersion : 'v19.0'
  const BASE_URL   = `https://graph.facebook.com/${apiVersion}`

  const token  = process.env.META_ACCESS_TOKEN ?? ''
  const acct   = process.env.META_AD_ACCOUNT_ID ?? ''
  const pageId = process.env.META_PAGE_ID ?? ''
  const out: Record<string, any> = {
    apiVersion,
    tokenFingerprint: token ? `...${token.slice(-4)}` : 'NOT SET',
    acctSet:          !!acct,
    pageIdSet:        !!pageId,
  }

  // ── 1a: Ad review status ───────────────────────────────────────────────────
  for (const [label, adId] of [
    ['ad_rejected', '120249999006250232'],
    ['ad_approved', '120250152262990232'],
  ] as [string, string][]) {
    try {
      const r = await fetch(
        `${BASE_URL}/${adId}?fields=effective_status,configured_status,ad_review_feedback,issues_info&access_token=${token}`
      )
      out[label] = await r.json()
    } catch (e: any) { out[label] = { fetch_error: e.message } }
  }

  // ── 1b: Fetch image once, reuse buffer for all three upload tests ──────────
  let buffer: ArrayBuffer | null = null
  try {
    const imgRes = await fetch(DEFAULT_HERO_URL)
    buffer = await imgRes.arrayBuffer()
    out.imageFetch = { status: imgRes.status, byteLength: buffer.byteLength, url: DEFAULT_HERO_URL }
  } catch (e: any) {
    out.imageFetch = { fetch_error: e.message }
  }

  // ── 1b-i: JSON bytes (base64) ──────────────────────────────────────────────
  if (buffer) {
    try {
      const base64 = Buffer.from(buffer).toString('base64')
      const r = await fetch(`${BASE_URL}/${acct}/adimages`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body:   JSON.stringify({ bytes: base64, access_token: token }),
      })
      out.upload_json_bytes = uploadResult(await r.json())
    } catch (e: any) { out.upload_json_bytes = { fetch_error: e.message } }
  }

  // ── 1b-ii: multipart/form-data (Meta's documented curl approach) ──────────
  if (buffer) {
    try {
      const form = new FormData()
      form.append('access_token', token)
      form.append('filename', new Blob([buffer], { type: 'image/jpeg' }), 'image.jpg')
      const r = await fetch(`${BASE_URL}/${acct}/adimages`, { method: 'POST', body: form })
      out.upload_multipart = uploadResult(await r.json())
    } catch (e: any) { out.upload_multipart = { fetch_error: e.message } }
  }

  // ── 1b-iii: url (comparison) ───────────────────────────────────────────────
  try {
    const r = await fetch(`${BASE_URL}/${acct}/adimages`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body:   JSON.stringify({ url: DEFAULT_HERO_URL, access_token: token }),
    })
    out.upload_url = uploadResult(await r.json())
  } catch (e: any) { out.upload_url = { fetch_error: e.message } }

  // ── 1c: Instagram accounts ─────────────────────────────────────────────────
  try {
    const r = await fetch(`${BASE_URL}/${acct}/instagram_accounts?access_token=${token}`)
    out.instagram_via_ad_account = await r.json()
  } catch (e: any) { out.instagram_via_ad_account = { fetch_error: e.message } }

  try {
    const r = await fetch(`${BASE_URL}/${pageId}/instagram_accounts?access_token=${token}`)
    out.instagram_via_page = await r.json()
  } catch (e: any) { out.instagram_via_page = { fetch_error: e.message } }

  return NextResponse.json(out)
}
