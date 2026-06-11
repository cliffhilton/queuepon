import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdReviewClient } from './AdReviewClient'

export default async function AdsPage() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('*')
    .eq('user_id', session.user.id)
    .single()

  const { data: stats } = await supabase
    .from('meta_ad_stats')
    .select('*')
    .eq('restaurant_id', restaurant?.id)
    .order('week_start', { ascending: false })

  const { data: offers } = await supabase
    .from('offers')
    .select('*')
    .eq('restaurant_id', restaurant?.id)
    .order('created_at', { ascending: false })

  const primaryOffer = offers?.[0] ?? null

  return (
    <AdReviewClient
      restaurant={restaurant}
      offer={primaryOffer}
      stats={stats ?? []}
    />
  )
}
