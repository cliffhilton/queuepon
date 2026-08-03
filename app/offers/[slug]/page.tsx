import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import { LandingPageClient } from './LandingPageClient'

const FALLBACK_OG = 'https://dvxmwudqmpyudfggmadm.supabase.co/storage/v1/object/public/images/queuepon%20OG%20Image.png'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props) {
  const supabase = createAdminClient()
  const { data: offer } = await supabase
    .from('offers')
    .select('title, description, ad_image_url, restaurants(name)')
    .eq('slug', params.slug)
    .eq('status', 'live')
    .single()

  if (!offer) return {}
  const restaurant = offer.restaurants as any
  const ogImage = offer.ad_image_url || FALLBACK_OG

  return {
    title: `${offer.title} — ${restaurant.name} | Queuepon`,
    description: offer.description,
    openGraph: {
      title: `${offer.title} — ${restaurant.name}`,
      description: offer.description,
      url: `https://queuepon.com/offers/${params.slug}`,
      siteName: 'Queuepon',
      images: [{ url: ogImage, width: 1200, height: 630, alt: offer.title }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${offer.title} — ${restaurant.name}`,
      description: offer.description,
      images: [ogImage],
    },
  }
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
