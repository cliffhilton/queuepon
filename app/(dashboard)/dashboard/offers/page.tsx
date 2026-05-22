import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { CopyLinkButton } from '@/components/dashboard/CopyLinkButton'

export default async function OffersPage() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: restaurant } = await supabase
    .from('restaurants').select('id,name,zip_code').eq('user_id', session.user.id).single()

  const { data: offers } = await supabase
    .from('offers').select('*').eq('restaurant_id', restaurant?.id)
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 md:p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-tan">My Offers</h1>
          <p className="text-tan-light mt-1">Each offer generates a shareable landing page that captures customer emails.</p>
        </div>
        <Link href="/dashboard/offers/new" className="btn-primary">+ New Offer</Link>
      </div>

      {offers && offers.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-5">
          {offers.map(offer => (
            <div key={offer.id} className="bg-white rounded-2xl overflow-hidden shadow-card border border-blue-pale">
              <div className="bg-gradient-to-br from-blue-deeper to-blue p-5 text-white relative">
                <div className="font-bold text-lg">{offer.title}</div>
                <div className="text-sm opacity-75 mt-1">{offer.description}</div>
                <span className={`absolute top-4 right-4 text-xs font-bold px-2.5 py-1 rounded-full
                  ${offer.status === 'live' ? 'bg-green-500/25 text-green-300' : 'bg-white/20 text-white/70'}`}>
                  {offer.status === 'live' ? '● Live' : '○ Draft'}
                </span>
              </div>
              <div className="p-5">
                <div className="flex gap-6 text-sm mb-4">
                  <div>
                    <div className="text-tan-light text-xs">Subscribers</div>
                    <div className="font-bold text-tan text-lg">{offer.subscriber_count ?? 0}</div>
                  </div>
                  <div>
                    <div className="text-tan-light text-xs">Type</div>
                    <div className="font-bold text-tan capitalize">{offer.offer_type?.replace('_',' ')}</div>
                  </div>
                  {offer.expiry_date && (
                    <div>
                      <div className="text-tan-light text-xs">Expires</div>
                      <div className="font-bold text-tan">{new Date(offer.expiry_date).toLocaleDateString()}</div>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Link href={`/dashboard/offers/${offer.id}/edit`} className="btn-ghost btn-sm text-xs">Edit</Link>
                    <Link href={`/offers/${offer.slug}`} target="_blank" className="btn-ghost btn-sm text-xs">View Page →</Link>
                  </div>
                  <CopyLinkButton slug={offer.slug}/>
                </div>
              </div>
            </div>
          ))}
          <Link href="/dashboard/offers/new"
            className="border-2 border-dashed border-cream-dark rounded-2xl flex flex-col items-center justify-center p-8 text-center hover:border-blue hover:bg-blue-xpale transition-all min-h-[200px]">
            <div className="text-3xl mb-3 text-blue-light">+</div>
            <div className="font-semibold text-tan">Create New Offer</div>
            <div className="text-xs text-tan-light mt-1">Generates a landing page instantly</div>
          </Link>
        </div>
      ) : (
        <div className="card text-center py-16">
          <div className="text-5xl mb-4">🎁</div>
          <h2 className="text-xl font-bold text-tan mb-2">No offers yet</h2>
          <p className="text-tan-light mb-6 max-w-sm mx-auto">Create your first offer to generate a landing page and start collecting customer emails.</p>
          <Link href="/dashboard/offers/new" className="btn-primary px-8">Create Your First Offer →</Link>
        </div>
      )}
    </div>
  )
}
