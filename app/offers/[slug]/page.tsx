import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import { LandingPageClient } from './LandingPageClient'

interface Props {
  params: { slug: string }
}

export default async function OfferLandingPage({ params }: Props) {
  const supabase = createAdminClient()

  // Get offer + restaurant data
  const { data: offer, error } = await supabase
    .from('offers')
    .select('*, restaurants(*)')
    .eq('slug', params.slug)
    .eq('status', 'live')
    .single()

  if (error || !offer) notFound()

  const restaurant = offer.restaurants as any

  return (
    <LandingPageClient
      offer={offer}
      restaurant={restaurant}
    />
  )
}
