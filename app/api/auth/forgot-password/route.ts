import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendPasswordResetEmail } from '@/lib/resend'

export async function POST(req: NextRequest) {
  const { email } = await req.json()

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 })
  }

  try {
    const supabase = createAdminClient()
    const appUrl   = process.env.NEXT_PUBLIC_APP_URL || 'https://queuepon.com'

    const { data: linkData } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email,
    })

    if (linkData?.properties?.hashed_token) {
      const resetUrl = `${appUrl}/auth/callback?token_hash=${linkData.properties.hashed_token}&type=recovery&next=/set-password`
      await sendPasswordResetEmail({ to: email, resetUrl })
    } else if (linkData?.properties?.action_link) {
      const actionUrl = new URL(linkData.properties.action_link as string)
      const token     = actionUrl.searchParams.get('token')
                     || actionUrl.searchParams.get('token_hash')
                     || ''
      const resetUrl  = `${appUrl}/auth/callback?token_hash=${token}&type=recovery&next=/set-password`
      await sendPasswordResetEmail({ to: email, resetUrl })
    }
    // If email not found, generateLink returns null — fall through and return success anyway
  } catch (e) {
    console.error('Forgot password error:', e)
    // Swallow error — never reveal whether the email exists
  }

  return NextResponse.json({ success: true })
}
