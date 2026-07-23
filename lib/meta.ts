// Meta Marketing API integration
// Docs: https://developers.facebook.com/docs/marketing-apis

const META_API_VERSION = 'v19.0'
const BASE_URL = `https://graph.facebook.com/${META_API_VERSION}`

interface MetaCampaignParams {
  restaurantName:   string
  offerTitle:       string
  adHeadline:       string
  adSubheadline:    string
  zipCode:          string
  adImageUrl:       string
  landingPageUrl:   string
  plan:             string
  adColor:          string
  audienceTypes:    string[]
  audienceAgeRange: string
  trafficTiming:    string[]
  adDays:           string[]
}

interface MetaCampaignResult {
  campaignId:   string
  adSetId:      string
  adId:         string
  adCreativeId: string
}

// ── Budget by plan ─────────────────────────────────────────────────────────
function dailyBudgetCents(plan: string): number {
  const monthly: Record<string, number> = {
    grow:   50,
    expand: 150,
    thrive: 350,
  }
  const monthly_usd = monthly[plan] ?? 50
  return Math.round((monthly_usd / 30) * 100)
}

// ── Step 1: Upload image to Meta ───────────────────────────────────────────
async function uploadImageToMeta(imageUrl: string, accessToken: string, adAccountId: string): Promise<string> {
  const res = await fetch(
    `${BASE_URL}/${adAccountId}/adimages`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url:          imageUrl,
        access_token: accessToken,
      }),
    }
  )
  const data = await res.json()
  if (data.error) throw new Error(`Meta image upload failed: ${data.error.message}`)

  const images  = data.images
  const firstKey = Object.keys(images)[0]
  return images[firstKey].hash
}

// ── Step 2: Create ad creative ─────────────────────────────────────────────
async function createAdCreative(
  imageHash: string,
  params: MetaCampaignParams,
  accessToken: string,
  adAccountId: string,
  pageId: string,
): Promise<string> {
  const res = await fetch(
    `${BASE_URL}/${adAccountId}/adcreatives`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `${params.restaurantName} — ${params.offerTitle}`,
        object_story_spec: {
          page_id: pageId,
          link_data: {
            ...(imageHash
              ? { image_hash: imageHash }
              : params.adImageUrl
                ? { picture: params.adImageUrl }
                : {}),
            link:        params.landingPageUrl,
            message:     params.adSubheadline || `${params.offerTitle} — Exclusive offer for ${params.zipCode} locals`,
            name:        params.adHeadline || params.offerTitle,
            description: `Claim your offer at ${params.landingPageUrl}`,
            call_to_action: {
              type:  'LEARN_MORE',
              value: { link: params.landingPageUrl },
            },
          },
        },
        access_token: accessToken,
      }),
    }
  )
  const data = await res.json()
  if (data.error) throw new Error(`Meta creative failed: ${data.error.message}`)
  return data.id
}

// ── Step 3: Create campaign ────────────────────────────────────────────────
async function createCampaign(
  restaurantName: string,
  accessToken: string,
  adAccountId: string,
): Promise<string> {
  const res = await fetch(
    `${BASE_URL}/${adAccountId}/campaigns`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name:                            `Queuepon — ${restaurantName}`,
        objective:                       'OUTCOME_TRAFFIC',
        status:                          'PAUSED',
        special_ad_categories:           [],
        is_adset_budget_sharing_enabled: false,
        access_token:                    accessToken,
      }),
    }
  )
  const data = await res.json()
  if (data.error) throw new Error(`Meta campaign failed: ${JSON.stringify(data.error)}`)
  return data.id
}

// ── Step 4: Create ad set with ZIP + audience targeting ────────────────────
async function createAdSet(
  campaignId: string,
  params: MetaCampaignParams,
  accessToken: string,
  adAccountId: string,
): Promise<string> {
  const endTime = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60)

  const ageMap: Record<string, { min: number; max: number }> = {
    all:      { min: 18, max: 65 },
    under35:  { min: 18, max: 34 },
    '35to55': { min: 35, max: 55 },
    over55:   { min: 55, max: 65 },
  }
  const { min: ageMin, max: ageMax } = ageMap[params.audienceAgeRange] ?? ageMap.all

  const audienceInterestMap: Record<string, number[]> = {
    'Families':            [6003107902433],
    'Young Professionals': [6003139266461],
    'College Students':    [6002714398172],
    'Blue-Collar Workers': [6003368266461],
    'Retirees':            [6003148695814],
    'Date Night Crowd':    [6003107902433],
    'Lunch Crowd':         [6003139266461],
    'Bar Crowd':           [6003368266462],
  }
  const interests = params.audienceTypes
    .flatMap(t => (audienceInterestMap[t] || []).map(id => ({ id })))
  const flexibleSpec = interests.length > 0 ? { interests } : {}

  const res = await fetch(
    `${BASE_URL}/${adAccountId}/adsets`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name:              `${params.restaurantName} — ZIP ${params.zipCode}`,
        campaign_id:       campaignId,
        daily_budget:      dailyBudgetCents(params.plan),
        billing_event:     'IMPRESSIONS',
        optimization_goal: 'LINK_CLICKS',
        bid_strategy:      'LOWEST_COST_WITHOUT_CAP',
        status:            'PAUSED',
        end_time:          endTime,
        targeting: {
          geo_locations: {
            zips:           [{ key: `US:${params.zipCode}` }],
            location_types: ['home', 'recent'],
          },
          age_min:             ageMin,
          age_max:             ageMax,
          publisher_platforms: ['facebook', 'instagram'],
          facebook_positions:  ['feed', 'story'],
          instagram_positions: ['stream', 'story'],
          ...(Object.keys(flexibleSpec).length > 0 ? { flexible_spec: [flexibleSpec] } : {}),
        },
        access_token: accessToken,
      }),
    }
  )
  const data = await res.json()
  if (data.error) throw new Error(`Meta ad set failed: ${data.error.message}`)
  return data.id
}

// ── Step 5: Create ad ──────────────────────────────────────────────────────
async function createAd(
  adSetId: string,
  creativeId: string,
  restaurantName: string,
  offerTitle: string,
  accessToken: string,
  adAccountId: string,
): Promise<string> {
  const res = await fetch(
    `${BASE_URL}/${adAccountId}/ads`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name:         `${restaurantName} — ${offerTitle}`,
        adset_id:     adSetId,
        creative:     { creative_id: creativeId },
        status:       'PAUSED',
        access_token: accessToken,
      }),
    }
  )
  const data = await res.json()
  if (data.error) throw new Error(`Meta ad failed: ${data.error.message}`)
  return data.id
}

// ── Main: Create full campaign ─────────────────────────────────────────────
export async function createMetaCampaign(params: MetaCampaignParams): Promise<MetaCampaignResult> {
  const accessToken = process.env.META_ACCESS_TOKEN!
  const adAccountId = process.env.META_AD_ACCOUNT_ID!
  const pageId      = process.env.META_PAGE_ID!

  console.log(`🚀 Creating Meta campaign for ${params.restaurantName} (ZIP ${params.zipCode})`)

  let imageHash = ''
  if (params.adImageUrl) {
    try {
      imageHash = await uploadImageToMeta(params.adImageUrl, accessToken, adAccountId)
      console.log(`✅ Image uploaded to Meta: ${imageHash}`)
    } catch (imgErr) {
      console.error('Image upload skipped (permissions pending):', imgErr)
    }
  }

  const creativeId = await createAdCreative(imageHash || '', params, accessToken, adAccountId, pageId)
  console.log(`✅ Ad creative created: ${creativeId}`)

  const campaignId = await createCampaign(params.restaurantName, accessToken, adAccountId)
  console.log(`✅ Campaign created: ${campaignId}`)

  const adSetId = await createAdSet(campaignId, params, accessToken, adAccountId)
  console.log(`✅ Ad set created: ${adSetId}`)

  const adId = await createAd(adSetId, creativeId, params.restaurantName, params.offerTitle, accessToken, adAccountId)
  console.log(`✅ Ad created: ${adId}`)

  console.log(`🎯 Full Meta campaign ready for ${params.restaurantName} — awaiting review then will go live`)

  return { campaignId, adSetId, adId, adCreativeId: creativeId }
}
