import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const { customerId } = await req.json()
  if (!customerId) return NextResponse.json({ error: 'customerId required' }, { status: 400 })

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('customers')
    .update({ redeemed_at: new Date().toISOString() })
    .eq('id', customerId)
    .is('redeemed_at', null) // idempotent: won't overwrite an existing redemption

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
