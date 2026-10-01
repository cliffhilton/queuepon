import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendPasswordSetupEmail } from '@/lib/resend'

export async function POST(req: NextRequest) {
  const { pollKey } = await req.json()
  if (!pollKey) return NextResponse.json({ error: 'Missing pollKey' }, { status: 400 })

  const supabase = createAdminClient()
  const appUrl   = process.env.NEXT_PUBLIC_APP_URL || 'https://queuepon.com'

  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('email, owner_first, name')
    .eq('setup_poll_key', pollKey)
    .single()

  if (!restaurant) {
    // Webhook hasn't completed yet — tell client to retry
    return NextResponse.json({ pending: true })
  }

  try {
    const { data: linkData } = await supabase.auth.admin.generateLink({
      type:  'recovery',
      email: restaurant.email,
    })

    const hashedToken = linkData?.properties?.hashed_token
      ?? (() => {
        if (!linkData?.properties?.action_link) return undefined
        const u = new URL(linkData.properties.action_link as string)
        return u.searchParams.get('token_hash') || u.searchParams.get('token') || undefined
      })()

    if (!hashedToken) return NextResponse.json({ error: 'Could not generate link' }, { status: 500 })

    const setupUrl = `${appUrl}/auth/callback?token_hash=${hashedToken}&type=recovery&next=/set-password`

    await sendPasswordSetupEmail({
      to:             restaurant.email,
      firstName:      restaurant.owner_first,
      restaurantName: restaurant.name,
      setupUrl,
    })

    return NextResponse.json({ sent: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
