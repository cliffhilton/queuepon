#!/usr/bin/env node
// meta-keepalive.mjs
// Runs daily via Railway cron to maintain Meta Marketing API call volume.
// Creates a test campaign then immediately deletes it — no junk data accumulates.

const META_API_VERSION = 'v19.0'
const BASE_URL = `https://graph.facebook.com/${META_API_VERSION}`

const ACCESS_TOKEN  = process.env.META_ACCESS_TOKEN
const AD_ACCOUNT_ID = process.env.META_AD_ACCOUNT_ID
const PAGE_ID       = process.env.META_PAGE_ID

if (!ACCESS_TOKEN || !AD_ACCOUNT_ID || !PAGE_ID) {
  console.error('❌ Missing META env vars — check Railway environment variables')
  process.exit(1)
}

async function metaPost(endpoint, body) {
  const res = await fetch(`${BASE_URL}/${endpoint}`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ ...body, access_token: ACCESS_TOKEN }),
  })
  const data = await res.json()
  if (data.error) throw new Error(`Meta API error: ${JSON.stringify(data.error)}`)
  return data
}

async function metaDelete(id) {
  const res = await fetch(`${BASE_URL}/${id}?access_token=${ACCESS_TOKEN}`, {
    method: 'DELETE',
  })
  const data = await res.json()
  return data
}

async function run() {
  console.log(`🚀 Meta keepalive starting — ${new Date().toISOString()}`)

  let campaignId = null

  try {
    // 1. Create test campaign
    const campaign = await metaPost(`${AD_ACCOUNT_ID}/campaigns`, {
      name:                  `[KEEPALIVE] ${new Date().toISOString()}`,
      objective:             'OUTCOME_TRAFFIC',
      status:                'PAUSED',
      special_ad_categories: [],
    })
    campaignId = campaign.id
    console.log(`✅ Test campaign created: ${campaignId}`)

    // 2. Create test ad set
    const adSet = await metaPost(`${AD_ACCOUNT_ID}/adsets`, {
      name:              '[KEEPALIVE] Test Ad Set',
      campaign_id:       campaignId,
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
    console.log(`✅ Test ad set created: ${adSet.id}`)

    // 3. Create test ad creative
    const creative = await metaPost(`${AD_ACCOUNT_ID}/adcreatives`, {
      name: '[KEEPALIVE] Test Creative',
      object_story_spec: {
        page_id: PAGE_ID,
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
    console.log(`✅ Test creative created: ${creative.id}`)

    // 4. Create test ad
    const ad = await metaPost(`${AD_ACCOUNT_ID}/ads`, {
      name:      '[KEEPALIVE] Test Ad',
      adset_id:  adSet.id,
      creative:  { creative_id: creative.id },
      status:    'PAUSED',
    })
    console.log(`✅ Test ad created: ${ad.id}`)

    // 5. Delete everything immediately — no junk left behind
    await metaDelete(ad.id)
    console.log(`🗑  Test ad deleted`)
    await metaDelete(creative.id)
    console.log(`🗑  Test creative deleted`)
    await metaDelete(adSet.id)
    console.log(`🗑  Test ad set deleted`)
    await metaDelete(campaignId)
    console.log(`🗑  Test campaign deleted`)

    console.log(`✅ Meta keepalive complete — ${new Date().toISOString()}`)

  } catch (err) {
    console.error('❌ Keepalive error:', err.message)
    // Attempt cleanup if campaign was created
    if (campaignId) {
      try {
        await metaDelete(campaignId)
        console.log('🗑  Cleaned up campaign after error')
      } catch (cleanupErr) {
        console.error('Cleanup also failed:', cleanupErr.message)
      }
    }
    process.exit(1)
  }
}

run()
