import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const { customerId, email, restaurantId } = await req.json()

  const supabase = createAdminClient()
  const now = new Date().toISOString()

  if (customerId) {
    const { error } = await supabase
      .from('customers')
      .update({ redeemed_at: now })
      .eq('id', customerId)
      .is('redeemed_at', null)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  // Fallback: look up by email + restaurant_id
  if (!email || !restaurantId) {
    return NextResponse.json({ error: 'customerId or email+restaurantId required' }, { status: 400 })
  }

  const { data: customer, error: findError } = await supabase
    .from('customers')
    .select('id, redeemed_at')
    .eq('email', email)
    .eq('restaurant_id', restaurantId)
    .single()

  if (findError || !customer) {
    return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
  }
  if (customer.redeemed_at) {
    return NextResponse.json({ success: true, alreadyRedeemed: true })
  }

  const { error: updateError } = await supabase
    .from('customers')
    .update({ redeemed_at: now })
    .eq('id', customer.id)

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
