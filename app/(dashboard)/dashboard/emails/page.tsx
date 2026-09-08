import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

const SEQUENCE = [
  { num: 1, title: 'Welcome + Offer',  timing: 'Instant on signup',       desc: 'Delivers the offer and sets expectations. Highest open rate.' },
  { num: 2, title: 'Don\'t Miss Out',  timing: 'Day 3',                   desc: 'Gentle reminder that the offer is still waiting.' },
  { num: 3, title: 'Bring a Friend',   timing: 'Day 10',                  desc: 'Referral campaign — brings new customers through word of mouth.' },
  { num: 4, title: 'Come Back',        timing: 'Day 25',                  desc: 'Return visit incentive with a fresh offer.' },
  { num: 5, title: 'Birthday Offer',   timing: 'Birth month · 1st send',  desc: 'Sent once per calendar year when the customer\'s birth month matches. Requires a birthday offer configured in Settings.' },
]

export default async function EmailsPage() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: restaurant } = await supabase
    .from('restaurants').select('id,name,plan').eq('user_id', session.user.id).single()

  const { data: customers } = await supabase
    .from('customers').select('emails_sent, sequence_status, redeemed_at')
    .eq('restaurant_id', restaurant?.id)

  const totalSubs       = customers?.length ?? 0
  const activeInSeq     = customers?.filter(c => c.sequence_status === 'active').length ?? 0
  const totalEmails     = customers?.reduce((sum, c) => sum + (c.emails_sent ?? 0), 0) ?? 0
  const redeemedCount   = customers?.filter(c => c.redeemed_at != null).length ?? 0
  const returnVisitRate = totalSubs > 0 ? Math.round((redeemedCount / totalSubs) * 100) : null

  return (
    <div className="p-6 md:p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-tan">Email Sequences</h1>
        <p className="text-tan-light mt-1">Automated via Resend — fires the moment a customer subscribes to any offer.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label:'Active in Sequence', value: activeInSeq, color:'blue' },
          { label:'Total Emails Sent',  value: totalEmails, color:'green' },
          { label:'Avg. Open Rate',     value: '—',         color:'blue' },
          { label:'Unsubscribe Rate',   value: '—',         color:'tan' },
        ].map(s => (
          <div key={s.label} className="card">
            <div className={`text-3xl font-bold mb-1 ${s.color === 'green' ? 'text-green-600' : s.color === 'tan' ? 'text-tan-light' : 'text-blue'}`}>
              {s.value}
            </div>
            <div className="text-xs text-tan-light">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Sequence steps */}
        <div>
          <div className="font-bold text-tan mb-4">Your Email Sequence</div>
          <div className="space-y-3">
            {SEQUENCE.map((step, i) => (
              <div key={step.num} className="card flex items-start gap-4 py-4">
                <div className="w-9 h-9 rounded-full bg-blue text-white text-sm font-bold flex items-center justify-center flex-shrink-0 shadow-sm">
                  {step.num}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-bold text-tan text-sm">{step.title}</div>
                    <span className="badge-blue text-xs whitespace-nowrap">{step.timing}</span>
                  </div>
                  <div className="text-xs text-tan-light mt-1 leading-relaxed">{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
          {(() => {
            const planFeature: Record<string, string> = {
              grow:   '4-email automated sequence',
              expand: '4-email sequence + comment entry',
              thrive: '4-email sequence + contest offer',
            }
            const feat = planFeature[restaurant?.plan ?? '']
            return feat ? (
              <div className="mt-3 card py-3 text-center bg-blue-xpale border-blue-pale">
                <div className="text-xs text-blue font-semibold">✓ Your plan includes {feat}</div>
              </div>
            ) : null
          })()}
        </div>

        {/* Resend status + performance */}
        <div className="space-y-4">
          <div className="card" style={{background:'linear-gradient(135deg,#2a5070,#588aad)',color:'#fff'}}>
            <div className="text-sm font-bold mb-1">📩 Resend Integration</div>
            <div className="text-xs opacity-75 mb-3">All sequences run through Resend automatically.</div>
            <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full">● Connected</span>
          </div>

          <div className="card">
            <div className="font-bold text-tan mb-4 text-sm">Sequence Performance</div>
            <div className="space-y-4">
              {[
                { label:'Email 1 Open Rate',  val: null,            color:'blue'  },
                { label:'Email 2 Open Rate',  val: null,            color:'blue'  },
                { label:'Email 3 Click Rate', val: null,            color:'green' },
                { label:'Return Visit Rate',  val: returnVisitRate, color:'green' },
              ].map(row => (
                <div key={row.label}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-tan-light">{row.label}</span>
                    <span className="font-bold text-tan">{row.val !== null ? `${row.val}%` : '—'}</span>
                  </div>
                  <div className="h-1.5 bg-cream-dark rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${row.color === 'green' ? 'bg-green-500' : 'bg-blue'}`}
                      style={{width: row.val !== null ? `${row.val}%` : '0%'}}/>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-tan-light text-center mt-4">
              Open/click tracking coming soon. Return visit rate is live.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
