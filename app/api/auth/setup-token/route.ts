import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(req: NextRequest) {
  const pk = req.nextUrl.searchParams.get('pk')?.trim()
  if (!pk) return NextResponse.json({ tokenHash: null })

  const supabase = createAdminClient()
  const { data } = await supabase
    .from('restaurants')
    .select('setup_token_hash')
    .eq('setup_poll_key', pk)
    .single()

  return NextResponse.json({ tokenHash: data?.setup_token_hash ?? null })
}
