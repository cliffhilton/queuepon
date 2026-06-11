'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export function WelcomeBanner({ firstName }: { firstName: string }) {
  const [show,    setShow]    = useState(false)
  const [loading, setLoading] = useState(false)
  const [sent,    setSent]    = useState(false)

  useEffect(() => {
    // Show banner if user has never set a password (no last_sign_in or very recent)
    const shown = sessionStorage.getItem('qp_welcome_dismissed')
    if (!shown) setShow(true)
  }, [])

  const handleDismiss = () => {
    sessionStorage.setItem('qp_welcome_dismissed', '1')
    setShow(false)
  }

  const handleSendReset = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email) return

      await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/set-password`,
      })
      setSent(true)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  if (!show) return null

  return (
    <div className="mx-6 md:mx-8 mt-6 bg-gradient-to-r from-blue-deeper to-blue rounded-2xl p-5 text-white flex items-start justify-between gap-4">
      <div className="flex items-start gap-4">
        <div className="text-2xl flex-shrink-0">🎉</div>
        <div>
          <div className="font-bold text-base mb-1">Welcome to Queuepon, {firstName}!</div>
          {sent ? (
            <div className="text-sm text-white/80">
              ✅ Password setup link sent to your email. Check your inbox!
            </div>
          ) : (
            <>
              <div className="text-sm text-white/80 mb-3">
                You're all set up. Set a password so you can log in anytime.
              </div>
              <div className="flex gap-3">
                <button onClick={handleSendReset} disabled={loading}
                  className="bg-white text-blue-deeper text-sm font-bold px-4 py-2 rounded-lg hover:bg-blue-pale transition-all disabled:opacity-60">
                  {loading ? '⏳ Sending...' : '🔑 Set My Password'}
                </button>
                <button onClick={handleDismiss}
                  className="text-white/60 text-sm hover:text-white transition-colors px-2">
                  Later
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      <button onClick={handleDismiss} className="text-white/40 hover:text-white text-xl leading-none flex-shrink-0">×</button>
    </div>
  )
}
