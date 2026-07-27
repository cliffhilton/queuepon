import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  try {
    const { restaurantId, birthdayOffer } = await req.json()

    if (!restaurantId) {
      return NextResponse.json({ error: 'Missing restaurantId' }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { error } = await supabase
      .from('restaurants')
      .update({ birthday_offer: birthdayOffer || null })
      .eq('id', restaurantId)

    if (error) {
      console.error('Birthday offer update error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (err: any) {
    console.error('Birthday offer API error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
