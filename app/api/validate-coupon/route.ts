import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')?.trim()
  if (!code) return NextResponse.json({ valid: false })

  try {
    const promos = await stripe.promotionCodes.list({ code, active: true, limit: 1 })
    const promo  = promos.data[0]
    if (!promo || !promo.active || !promo.coupon.valid) {
      return NextResponse.json({ valid: false })
    }
    return NextResponse.json({
      valid:      true,
      percentOff: promo.coupon.percent_off ?? undefined,
      amountOff:  promo.coupon.amount_off  ?? undefined, // cents
    })
  } catch {
    return NextResponse.json({ valid: false })
  }
}
