import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  try {
    const { restaurantId, comeBackOfferText, comeBackOfferImageUrl } = await req.json()

    if (!restaurantId) {
      return NextResponse.json({ error: 'Missing restaurantId' }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { error } = await supabase
      .from('restaurants')
      .update({
        come_back_offer_text:      comeBackOfferText      || null,
        come_back_offer_image_url: comeBackOfferImageUrl  || null,
      })
      .eq('id', restaurantId)

    if (error) {
      console.error('Come Back offer update error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (err: any) {
    console.error('Come Back offer API error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
