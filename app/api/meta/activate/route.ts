import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendAdLaunchedNotification } from '@/lib/resend'

const META_API_VERSION = 'v19.0'
const BASE_URL = `https://graph.facebook.com/${META_API_VERSION}`

async function setMetaStatus(id: string, status: 'ACTIVE' | 'PAUSED', accessToken: string) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, access_token: accessToken }),
  })
  const data = await res.json()
  if (data.error) throw new Error(`Meta API error: ${data.error.message}`)
  return data
}

export async function POST(req: NextRequest) {
  try {
    // Verify restaurant is logged in
    const supabase      = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { campaignId, adSetId, adId, offerId, restaurantId } = await req.json()

    if (!campaignId || !adSetId || !adId) {
      return NextResponse.json({ error: 'Missing campaign IDs' }, { status: 400 })
    }

    const accessToken = process.env.META_ACCESS_TOKEN!

    // Activate campaign → ad set → ad in order
    await setMetaStatus(campaignId, 'ACTIVE', accessToken)
    await setMetaStatus(adSetId,    'ACTIVE', accessToken)
    await setMetaStatus(adId,       'ACTIVE', accessToken)

    console.log(`✅ Meta campaign activated: ${campaignId}`)

    // Update Supabase
    const admin = createAdminClient()

    await admin.from('offers').update({
      meta_ad_status: 'active',
    }).eq('id', offerId)

    await admin.from('restaurants').update({
      meta_ad_status: 'live',
    }).eq('id', restaurantId)

    // Get restaurant details for notification
    const { data: restaurant } = await admin
      .from('restaurants')
      .select('name, email, owner_first, zip_code, plan')
      .eq('id', restaurantId)
      .single()

    // Send notification to Queuepon team
    try {
      await sendAdLaunchedNotification({
        restaurantName: restaurant?.name ?? 'Unknown',
        ownerName:      restaurant?.owner_first ?? 'Unknown',
        zipCode:        restaurant?.zip_code ?? '',
        plan:           restaurant?.plan ?? '',
        campaignId,
      })
    } catch (e) {
      console.error('Notification email error:', e)
    }

    return NextResponse.json({ success: true, status: 'active' })

  } catch (err: any) {
    console.error('Meta activate error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
