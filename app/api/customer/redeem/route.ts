import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const { customerId, email, restaurantId } = await req.json()

  const supabase = createAdminClient()
  const now = new Date().toISOString()

  if (customerId) {
    const { data, error } = await supabase
      .from('customers')
      .update({ redeemed_at: now })
      .eq('id', customerId)
      .is('redeemed_at', null)
      .select('id, redeemed_at')
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (!data || data.length === 0) {
      // Row existed but redeemed_at was already set — return its current value
      const { data: existing } = await supabase
        .from('customers').select('id, redeemed_at').eq('id', customerId).single()
      return NextResponse.json({ success: true, alreadyRedeemed: true, customer: existing })
    }
    return NextResponse.json({ success: true, customer: data[0] })
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
    return NextResponse.json({ error: 'Customer not found', detail: findError?.message }, { status: 404 })
  }
  if (customer.redeemed_at) {
    return NextResponse.json({ success: true, alreadyRedeemed: true, customer })
  }

  const { data: updated, error: updateError } = await supabase
    .from('customers')
    .update({ redeemed_at: now })
    .eq('id', customer.id)
    .select('id, redeemed_at')
  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })
  return NextResponse.json({ success: true, customer: updated?.[0] ?? null })
}
