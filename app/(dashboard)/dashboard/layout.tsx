import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Get restaurant data for the logged-in user
  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('id,name,plan,zip_code,meta_ad_status,logo_url,owner_first')
    .eq('user_id', user.id)
    .single()

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-1">
        <DashboardSidebar restaurant={restaurant} userEmail={user.email ?? ''}/>
        <main className="flex-1 bg-cream overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
