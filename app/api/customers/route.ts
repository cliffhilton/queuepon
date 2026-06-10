import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendCustomerOfferEmail } from '@/lib/resend'

export async function POST(req: NextRequest) {
  try {
    const {
      offerId, restaurantId, email, firstName,
      offerTitle, restaurantName, slug,
    } = await req.json()

    if (!offerId || !restaurantId || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Check if already subscribed
    const { data: existing } = await supabase
      .from('customers')
      .select('id')
      .eq('restaurant_id', restaurantId)
      .eq('email', email)
      .single()

    if (existing) {
      // Still send them the offer email even if already subscribed
      await sendCustomerOfferEmail({
        to:             email,
        firstName:      firstName || 'there',
        restaurantName,
        offerTitle,
        offerDescription: '',
        landingPageUrl: `${process.env.NEXT_PUBLIC_APP_URL}/offers/${slug}`,
      })
      return NextResponse.json({ success: true, existing: true })
    }

    // Save customer
    const { error: insertError } = await supabase
      .from('customers')
      .insert({
        restaurant_id:   restaurantId,
        offer_id:        offerId,
        email,
        first_name:      firstName || null,
        sequence_status: 'active',
        emails_sent:     0,
      })

    if (insertError) {
      console.error('Customer insert error:', insertError)
      return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
    }

    // Send offer email immediately
    try {
      await sendCustomerOfferEmail({
        to:             email,
        firstName:      firstName || 'there',
        restaurantName,
        offerTitle,
        offerDescription: '',
        landingPageUrl: `${process.env.NEXT_PUBLIC_APP_URL}/offers/${slug}`,
      })
      console.log(`✅ Offer email sent to ${email}`)
    } catch (emailErr) {
      console.error('Offer email failed:', emailErr)
      // Don't fail the request if email fails
    }

    return NextResponse.json({ success: true })

  } catch (err: any) {
    console.error('Customer API error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
