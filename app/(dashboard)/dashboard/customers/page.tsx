import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function CustomersPage() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: restaurant } = await supabase
    .from('restaurants').select('id,name').eq('user_id', session.user.id).single()

  const { data: customers, count } = await supabase
    .from('customers').select('*, offers(title)', { count: 'exact' })
    .eq('restaurant_id', restaurant?.id)
    .order('created_at', { ascending: false })

  const active = customers?.filter(c => c.sequence_status === 'active').length ?? 0
  const unsub  = customers?.filter(c => c.sequence_status === 'unsubscribed').length ?? 0

  return (
    <div className="p-6 md:p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-tan">Customers</h1>
          <p className="text-tan-light mt-1">{count ?? 0} total subscribers across all your offers.</p>
        </div>
        <button className="btn-ghost btn-sm">↓ Export CSV</button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Subscribers', value: count ?? 0, color: 'blue' },
          { label: 'Active in Sequence', value: active, color: 'green' },
          { label: 'Unsubscribed', value: unsub, color: 'tan' },
        ].map(s => (
          <div key={s.label} className="card">
            <div className={`text-3xl font-bold mb-1 ${s.color === 'green' ? 'text-green-600' : s.color === 'tan' ? 'text-tan-light' : 'text-blue'}`}>
              {s.value}
            </div>
            <div className="text-xs text-tan-light">{s.label}</div>
          </div>
        ))}
      </div>

      {customers && customers.length > 0 ? (
        <div className="bg-white rounded-2xl shadow-card border border-blue-pale overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-cream-dark">
                  <th className="text-left px-5 py-3 text-xs font-bold text-tan-light uppercase tracking-wider">Customer</th>
                  <th className="text-left px-5 py-3 text-xs font-bold text-tan-light uppercase tracking-wider">Source Offer</th>
                  <th className="text-left px-5 py-3 text-xs font-bold text-tan-light uppercase tracking-wider">Joined</th>
                  <th className="text-left px-5 py-3 text-xs font-bold text-tan-light uppercase tracking-wider">Emails Sent</th>
                  <th className="text-left px-5 py-3 text-xs font-bold text-tan-light uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {customers.map(c => (
                  <tr key={c.id} className="border-b border-cream-dark/50 last:border-0 hover:bg-blue-xpale transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-pale text-blue-dark text-xs font-bold flex items-center justify-center flex-shrink-0">
                          {(c.first_name?.[0] ?? c.email[0]).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-tan text-sm">
                            {c.first_name ? `${c.first_name} ${c.last_name ?? ''}`.trim() : '—'}
                          </div>
                          <div className="text-xs text-tan-light">{c.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="badge-blue text-xs">{(c.offers as any)?.title ?? '—'}</span>
                    </td>
                    <td className="px-5 py-4 text-sm text-tan-light">
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4 text-sm text-tan">{c.emails_sent ?? 0}</td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full
                        ${c.sequence_status === 'active' ? 'bg-green-100 text-green-700' :
                          c.sequence_status === 'unsubscribed' ? 'bg-tan-pale text-tan-light' :
                          'bg-blue-pale text-blue-dark'}`}>
                        {c.sequence_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card text-center py-16">
          <div className="text-5xl mb-4">👥</div>
          <h2 className="text-xl font-bold text-tan mb-2">No customers yet</h2>
          <p className="text-tan-light max-w-sm mx-auto">Customers appear here when people sign up on your offer landing pages. Share your offer links to get started.</p>
        </div>
      )}
    </div>
  )
}
