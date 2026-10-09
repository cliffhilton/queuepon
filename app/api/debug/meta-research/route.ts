// TEMPORARY — delete after Meta investigation is complete
// Hit: GET /api/debug/meta-research?secret=<CRON_SECRET>[&v=v25.0]
import { NextRequest, NextResponse } from 'next/server'
import { DEFAULT_HERO_URL } from '@/lib/images'
import { createMetaCampaign, MetaCampaignParams } from '@/lib/meta'

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

  // ── 1b: Fetch image once, reuse buffer for all upload tests ───────────────
  let buffer: ArrayBuffer | null = null
  try {
    const imgRes = await fetch(DEFAULT_HERO_URL)
    buffer = await imgRes.arrayBuffer()
    out.imageFetch = { status: imgRes.status, byteLength: buffer.byteLength, url: DEFAULT_HERO_URL }
  } catch (e: any) {
    out.imageFetch = { fetch_error: e.message }
  }

  // ── 1b-i: JSON bytes (base64) — capture hash for reuse in section 2 ───────
  let uploadedHash: string | null = null
  if (buffer) {
    try {
      const base64 = Buffer.from(buffer).toString('base64')
      const r = await fetch(`${BASE_URL}/${acct}/adimages`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body:   JSON.stringify({ bytes: base64, access_token: token }),
      })
      const d = await r.json()
      if (d.error) {
        out.upload_json_bytes = { ok: false, error: sanitizeError(d.error) }
      } else {
        const imgs     = d.images ?? {}
        const firstKey = Object.keys(imgs)[0]
        uploadedHash   = imgs[firstKey]?.hash ?? null
        out.upload_json_bytes = { ok: true, image_keys: Object.keys(imgs), hash: uploadedHash }
      }
    } catch (e: any) { out.upload_json_bytes = { fetch_error: e.message } }
  }

  // ── 1b-ii: multipart/form-data ────────────────────────────────────────────
  if (buffer) {
    try {
      const form = new FormData()
      form.append('access_token', token)
      form.append('filename', new Blob([buffer], { type: 'image/jpeg' }), 'image.jpg')
      const r = await fetch(`${BASE_URL}/${acct}/adimages`, { method: 'POST', body: form })
      out.upload_multipart = uploadResult(await r.json())
    } catch (e: any) { out.upload_multipart = { fetch_error: e.message } }
  }

  // ── 1b-iii: url (comparison — known to fail with #3) ──────────────────────
  try {
    const r = await fetch(`${BASE_URL}/${acct}/adimages`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body:   JSON.stringify({ url: DEFAULT_HERO_URL, access_token: token }),
    })
    out.upload_url = uploadResult(await r.json())
  } catch (e: any) { out.upload_url = { fetch_error: e.message } }

  // ── 1c: Instagram accounts ────────────────────────────────────────────────
  try {
    const r = await fetch(`${BASE_URL}/${acct}/instagram_accounts?access_token=${token}`)
    out.instagram_via_ad_account = await r.json()
  } catch (e: any) { out.instagram_via_ad_account = { fetch_error: e.message } }

  try {
    const r = await fetch(`${BASE_URL}/${pageId}/instagram_accounts?access_token=${token}`)
    out.instagram_via_page = await r.json()
  } catch (e: any) { out.instagram_via_page = { fetch_error: e.message } }

  // ── 2a: Instagram field name test ─────────────────────────────────────────
  // Tests both instagram_actor_id and instagram_user_id to confirm which Meta
  // accepts for this account/version. Set META_INSTAGRAM_FIELD after reviewing results.
  const igAcct = process.env.META_INSTAGRAM_ACCOUNT_ID ?? ''
  const igTests: Array<{ field: string; id?: string; error?: any }> = []
  out.instagram_field_tests = igTests

  if (!uploadedHash || !igAcct) {
    igTests.push({
      field: 'skipped',
      error: !uploadedHash ? 'No hash from bytes upload' : 'META_INSTAGRAM_ACCOUNT_ID not set',
    })
  } else {
    for (const igField of ['instagram_actor_id', 'instagram_user_id']) {
      try {
        const r = await fetch(`${BASE_URL}/${acct}/adcreatives`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: `debug-ig-${igField}`,
            access_token: token,
            object_story_spec: {
              page_id: pageId,
              [igField]: igAcct,
              link_data: {
                image_hash: uploadedHash,
                link: 'https://queuepon.com',
                message: 'Debug test — will be deleted',
                name: 'Debug',
                call_to_action: { type: 'LEARN_MORE', value: { link: 'https://queuepon.com' } },
              },
            },
          }),
        })
        const d = await r.json()
        igTests.push(d.error ? { field: igField, error: sanitizeError(d.error) } : { field: igField, id: d.id })
      } catch (err: any) { igTests.push({ field: igField, error: { message: err.message } }) }
    }
    // Clean up Instagram test creatives immediately
    for (const t of igTests.filter(t => t.id)) {
      try { await fetch(`${BASE_URL}/${t.id}?access_token=${token}`, { method: 'DELETE' }) } catch { /* best-effort */ }
    }
  }

  // ── 2b: Full pipeline test via createMetaCampaign ─────────────────────────
  // Calls the real production function with dummy data, then deletes everything it created.
  const e2e: Record<string, any> = {}
  out.e2e = e2e
  try {
    const dummyParams: MetaCampaignParams = {
      restaurantName:   'Debug Test Restaurant',
      offerTitle:       'Debug Test Offer',
      adHeadline:       'Debug headline (delete me)',
      adSubheadline:    'Debug test — will be deleted',
      zipCode:          '10001',
      adImageUrl:       DEFAULT_HERO_URL,
      landingPageUrl:   'https://queuepon.com',
      plan:             'grow',
      adColor:          '#588aad',
      audienceTypes:    [],
      audienceAgeRange: 'all',
      trafficTiming:    [],
      adDays:           [],
      adImageUrls:      [DEFAULT_HERO_URL],
    }
    const result = await createMetaCampaign(dummyParams)
    // result shape: { campaignId, adSetId, adId, adCreativeId }
    e2e.createMetaCampaign = { ok: true, ...result }

    // Read back the creative to confirm object_story_spec (and any Instagram identity field)
    try {
      const r = await fetch(`${BASE_URL}/${result.adCreativeId}?fields=object_story_spec&access_token=${token}`)
      e2e.creative_readback = await r.json()
    } catch (err: any) { e2e.creative_readback = { error: err.message } }

    // Delete in dependency order: ad → adset → campaign → creative
    const toDelete: Array<{ label: string; id: string }> = [
      { label: 'ad',       id: result.adId },
      { label: 'adset',    id: result.adSetId },
      { label: 'campaign', id: result.campaignId },
      { label: 'creative', id: result.adCreativeId },
    ]
    e2e.deletions = []
    for (const { label, id } of toDelete) {
      try {
        const r = await fetch(`${BASE_URL}/${id}?access_token=${token}`, { method: 'DELETE' })
        e2e.deletions.push({ label, id, result: await r.json() })
      } catch (err: any) {
        e2e.deletions.push({ label, id, result: { error: err.message } })
      }
    }
  } catch (err: any) {
    e2e.createMetaCampaign = { ok: false, error: err.message }
  }

  return NextResponse.json(out)
}
