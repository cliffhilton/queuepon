import { NextRequest, NextResponse } from 'next/server'

const META_API_VERSION = 'v19.0'
const BASE_URL = `https://graph.facebook.com/${META_API_VERSION}`

async function metaPost(endpoint: string, body: Record<string, any>) {
  const accessToken = process.env.META_ACCESS_TOKEN!
  const res = await fetch(`${BASE_URL}/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...body, access_token: accessToken }),
  })
  const data = await res.json()
  if (data.error) throw new Error(`Meta API error: ${JSON.stringify(data.error)}`)
  return data
}

async function metaDelete(id: string) {
  const accessToken = process.env.META_ACCESS_TOKEN!
  const res = await fetch(`${BASE_URL}/${id}?access_token=${accessToken}`, {
    method: 'DELETE',
  })
  return res.json()
}

export async function GET(req: NextRequest) {
  // Verify secret token
  const secret = req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.KEEPALIVE_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const adAccountId = process.env.META_AD_ACCOUNT_ID!
  const pageId      = process.env.META_PAGE_ID!
  const log: string[] = []

  try {
    // 1. Create test campaign
    const campaign = await metaPost(`${adAccountId}/campaigns`, {
      name:                  `[KEEPALIVE] ${new Date().toISOString()}`,
      objective:             'OUTCOME_TRAFFIC',
      status:                'PAUSED',
      special_ad_categories: [],
    })
    log.push(`✅ Campaign created: ${campaign.id}`)

    // 2. Create test ad set
    const adSet = await metaPost(`${adAccountId}/adsets`, {
      name:              '[KEEPALIVE] Test Ad Set',
      campaign_id:       campaign.id,
      daily_budget:      100,
      billing_event:     'IMPRESSIONS',
      optimization_goal: 'LINK_CLICKS',
      bid_strategy:      'LOWEST_COST_WITHOUT_CAP',
      status:            'PAUSED',
      end_time:          Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60),
      targeting: {
        geo_locations: {
          zips: [{ key: 'US:40202' }],
          location_types: ['home', 'recent'],
        },
        age_min: 18,
        age_max: 65,
        publisher_platforms: ['facebook'],
        facebook_positions:  ['feed'],
      },
    })
    log.push(`✅ Ad set created: ${adSet.id}`)

    // 3. Create test creative
    const creative = await metaPost(`${adAccountId}/adcreatives`, {
      name: '[KEEPALIVE] Test Creative',
      object_story_spec: {
        page_id: pageId,
        link_data: {
          link:    'https://queuepon.com',
          message: 'Keepalive test — safe to ignore',
          name:    'Queuepon Keepalive',
          call_to_action: {
            type:  'LEARN_MORE',
            value: { link: 'https://queuepon.com' },
          },
        },
      },
    })
    log.push(`✅ Creative created: ${creative.id}`)

    // 4. Create test ad
    const ad = await metaPost(`${adAccountId}/ads`, {
      name:     '[KEEPALIVE] Test Ad',
      adset_id: adSet.id,
      creative: { creative_id: creative.id },
      status:   'PAUSED',
    })
    log.push(`✅ Ad created: ${ad.id}`)

    // 5. Delete everything immediately
    await metaDelete(ad.id)
    log.push(`🗑 Ad deleted`)
    await metaDelete(creative.id)
    log.push(`🗑 Creative deleted`)
    await metaDelete(adSet.id)
    log.push(`🗑 Ad set deleted`)
    await metaDelete(campaign.id)
    log.push(`🗑 Campaign deleted`)

    log.push(`✅ Keepalive complete — ${new Date().toISOString()}`)
    console.log(log.join('\n'))
    return NextResponse.json({ success: true, log })

  } catch (err: any) {
    console.error('Keepalive error:', err.message)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
