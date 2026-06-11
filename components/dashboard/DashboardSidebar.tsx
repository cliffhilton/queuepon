'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Logo } from '@/components/layout/Logo'
import { createClient } from '@/lib/supabase/client'

interface Restaurant {
  id: string
  name: string
  plan: string
  zip_code: string
  meta_ad_status: string
  logo_url?: string
}

const NAV = [
  { href: '/dashboard',          icon: '📊', label: 'Overview' },
  { href: '/dashboard/offers',   icon: '🎁', label: 'My Offers' },
  { href: '/dashboard/customers',icon: '👥', label: 'Customers' },
  { href: '/dashboard/emails',   icon: '📧', label: 'Email Sequences' },
  { href: '/dashboard/ads',      icon: '📣', label: 'Meta Ad Results' },
]

const PLAN_LABELS: Record<string, string> = {
  grow:   'Grow Plan',
  expand: 'Expand Plan',
  thrive: 'Thrive Plan',
}

export function DashboardSidebar({ restaurant, userEmail }: { restaurant: Restaurant | null; userEmail: string }) {
  const pathname = usePathname()
  const router   = useRouter()
  const [open,   setOpen] = useState(false)

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 bg-blue-deeper min-h-screen sticky top-0">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/10">
          <Link href="/"><Logo variant="white" size="sm"/></Link>
        </div>

        {/* Restaurant info */}
        {restaurant && (
          <div className="px-5 py-4 border-b border-white/10">
            {restaurant.logo_url && (
              <div className="mb-3">
                <img src={restaurant.logo_url} alt={restaurant.name}
                  className="h-10 w-auto object-contain"
                  style={{filter:'brightness(0) invert(1)'}}/>
              </div>
            )}
            <div className="text-sm font-bold text-white truncate">{restaurant.name}</div>
            <div className="text-xs text-white/50 mt-0.5">
              {PLAN_LABELS[restaurant.plan] ?? restaurant.plan} · ZIP {restaurant.zip_code}
            </div>
            <div className={`inline-flex items-center gap-1 mt-2 text-xs font-semibold px-2 py-0.5 rounded-full
              ${restaurant.meta_ad_status === 'live'
                ? 'bg-green-500/20 text-green-400'
                : 'bg-yellow-500/20 text-yellow-300'}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current"/>
              {restaurant.meta_ad_status === 'live' ? 'Ad Live' : 'Ad Setting Up'}
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV.map(item => {
            const active = item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href)
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                  ${active
                    ? 'bg-white/15 text-white border-l-2 border-yellow-300 pl-2.5'
                    : 'text-white/60 hover:bg-white/8 hover:text-white'}`}>
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Bottom */}
        <div className="px-3 py-4 border-t border-white/10 space-y-0.5">
          <Link href="/dashboard/settings"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:bg-white/8 hover:text-white transition-all">
            <span className="text-base">⚙️</span> Settings
          </Link>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:bg-white/8 hover:text-white transition-all">
            <span className="text-base">🚪</span> Log Out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-blue-deeper flex items-center justify-between px-4 shadow-lg">
        <Link href="/"><Logo variant="white" size="sm"/></Link>
        <button onClick={() => setOpen(!open)} className="text-white p-2">
          <div className={`w-5 h-0.5 bg-white mb-1 transition-all ${open ? 'rotate-45 translate-y-1.5' : ''}`}/>
          <div className={`w-5 h-0.5 bg-white mb-1 transition-all ${open ? 'opacity-0' : ''}`}/>
          <div className={`w-5 h-0.5 bg-white transition-all ${open ? '-rotate-45 -translate-y-1.5' : ''}`}/>
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-40 bg-blue-deeper pt-14 flex flex-col">
          <div className="px-4 py-3 border-b border-white/10">
            <div className="text-sm font-bold text-white">{restaurant?.name ?? 'Dashboard'}</div>
            <div className="text-xs text-white/50">{PLAN_LABELS[restaurant?.plan ?? ''] ?? ''}</div>
          </div>
          <nav className="flex-1 px-3 py-4 space-y-1">
            {NAV.map(item => (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all
                  ${pathname === item.href ? 'bg-white/15 text-white' : 'text-white/65 hover:bg-white/10 hover:text-white'}`}>
                <span>{item.icon}</span>{item.label}
              </Link>
            ))}
          </nav>
          <div className="px-3 py-4 border-t border-white/10">
            <button onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-white/65">
              🚪 Log Out
            </button>
          </div>
        </div>
      )}

      {/* Mobile content padding */}
      <div className="md:hidden h-14"/>
    </>
  )
}
