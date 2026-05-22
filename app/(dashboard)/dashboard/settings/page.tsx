import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function SettingsPage() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: restaurant } = await supabase
    .from('restaurants').select('*').eq('user_id', session.user.id).single()

  const PLAN_NAMES: Record<string, string> = { grow:'Grow', expand:'Expand', thrive:'Thrive' }
  const PLAN_PRICES: Record<string, number> = { grow:199, expand:499, thrive:799 }

  return (
    <div className="p-6 md:p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-tan">Settings</h1>
        <p className="text-tan-light mt-1">Manage your restaurant details and subscription.</p>
      </div>

      {/* Restaurant info */}
      <div className="card mb-5">
        <div className="font-bold text-tan mb-4">Restaurant Information</div>
        <div className="space-y-3 text-sm">
          {[
            ['Restaurant Name', restaurant?.name],
            ['Owner',           `${restaurant?.owner_first} ${restaurant?.owner_last}`],
            ['Email',           restaurant?.email],
            ['Phone',           restaurant?.phone],
            ['Address',         restaurant?.address],
            ['ZIP Code',        restaurant?.zip_code],
            ['Type',            restaurant?.restaurant_type],
          ].map(([label, val]) => (
            <div key={label} className="flex justify-between py-2 border-b border-cream-dark last:border-0">
              <span className="text-tan-light">{label}</span>
              <span className="font-semibold text-tan">{val ?? '—'}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-tan-light mt-4">To update your restaurant info, contact <a href="mailto:hello@queuepon.com" className="text-blue">hello@queuepon.com</a></p>
      </div>

      {/* Subscription */}
      <div className="card mb-5">
        <div className="font-bold text-tan mb-4">Subscription</div>
        <div className="flex items-center justify-between p-4 bg-blue-pale rounded-xl border border-blue-light/30 mb-4">
          <div>
            <div className="font-bold text-blue-dark">{PLAN_NAMES[restaurant?.plan ?? ''] ?? restaurant?.plan} Plan</div>
            <div className="text-xs text-blue-dark/60 mt-0.5">Billed monthly · Cancel anytime</div>
          </div>
          <div className="text-2xl font-bold text-blue">
            ${PLAN_PRICES[restaurant?.plan ?? ''] ?? '—'}<span className="text-sm text-tan-light font-normal">/mo</span>
          </div>
        </div>
        <div className="flex gap-3">
          <a href="mailto:hello@queuepon.com?subject=Plan Change Request" className="btn-outline btn-sm">
            Change Plan
          </a>
          <a href="mailto:hello@queuepon.com?subject=Cancellation Request" className="btn-ghost btn-sm text-red-500 border-red-200">
            Cancel Subscription
          </a>
        </div>
      </div>

      {/* Account */}
      <div className="card">
        <div className="font-bold text-tan mb-4">Account</div>
        <div className="text-sm text-tan-light mb-4">
          Logged in as <strong className="text-tan">{session.user.email}</strong>
        </div>
        <a href="mailto:hello@queuepon.com?subject=Password Reset Request" className="btn-ghost btn-sm">
          Reset Password
        </a>
      </div>
    </div>
  )
}
