'use client'

import { useEffect, useState, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Phase = 'waiting' | 'password' | 'done' | 'fallback' | 'fallback-pending'

export function SuccessContent() {
  const params  = useSearchParams()
  const router  = useRouter()
  const pk      = params.get('pk') ?? ''

  const [phase,      setPhase]      = useState<Phase>(pk ? 'waiting' : 'fallback-pending')
  const [password,   setPassword]   = useState('')
  const [confirm,    setConfirm]    = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [msg,        setMsg]        = useState('')
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  const requestSetupLink = async (key: string) => {
    let attempts = 0
    const tryRequest = async () => {
      try {
        const res  = await fetch('/api/auth/request-setup-link', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pollKey: key }),
        })
        const data = await res.json()
        if (data.pending && ++attempts < 6) {
          setTimeout(tryRequest, 5000)
        } else {
          setPhase('fallback')
        }
      } catch {
        setPhase('fallback')
      }
    }
    tryRequest()
  }

  useEffect(() => {
    if (!pk) {
      // No poll key — redirect-required payment landed here without our params
      // Request a setup link via a server-side call is not possible without the key,
      // so fall straight to the "check your email" state (welcome email was sent)
      setPhase('fallback')
      return
    }

    let attempts = 0
    timer.current = setInterval(async () => {
      if (++attempts > 30) {
        clearInterval(timer.current!)
        requestSetupLink(pk)
        return
      }
      try {
        const res = await fetch(`/api/auth/setup-token?pk=${encodeURIComponent(pk)}`)
        const { tokenHash } = await res.json()
        if (!tokenHash) return

        clearInterval(timer.current!)
        const supabase = createClient()
        const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: 'recovery' })
        if (error) {
          requestSetupLink(pk)
          return
        }
        setPhase('password')
      } catch { /* network hiccup — keep polling */ }
    }, 2000)

    return () => { if (timer.current) clearInterval(timer.current) }
  }, [pk])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMsg('')
    if (password.length < 8) { setMsg('At least 8 characters.'); return }
    if (password !== confirm) { setMsg("Passwords don't match."); return }
    setSubmitting(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    if (error) { setMsg(error.message); setSubmitting(false); return }
    await fetch('/api/auth/mark-password-set', { method: 'POST' })
    setPhase('done')
    setTimeout(() => router.push('/dashboard'), 1200)
  }

  if (phase === 'waiting') return (
    <div className="text-center max-w-md w-full">
      <div className="text-5xl mb-5 animate-pulse">⚙️</div>
      <h1 className="text-2xl font-bold text-tan mb-2">Setting up your account…</h1>
      <p className="text-tan-light text-sm">This takes just a moment.</p>
    </div>
  )

  if (phase === 'fallback-pending') return (
    <div className="text-center max-w-md w-full">
      <div className="text-5xl mb-5 animate-pulse">📬</div>
      <h1 className="text-2xl font-bold text-tan mb-2">Sending your setup link…</h1>
      <p className="text-tan-light text-sm">Hang tight while we email you a secure link.</p>
    </div>
  )

  if (phase === 'password') return (
    <div className="text-center max-w-md w-full">
      <div className="text-5xl mb-5">🎉</div>
      <h1 className="text-2xl font-bold text-tan mb-2">You're live!</h1>
      <p className="text-tan-light mb-8 leading-relaxed">
        One last step — set a password so you can log back in anytime.
      </p>
      <form onSubmit={submit} className="card text-left space-y-4">
        <div>
          <label className="block text-xs font-semibold text-tan-light mb-1">Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            placeholder="At least 8 characters" required minLength={8} className="input w-full" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-tan-light mb-1">Confirm password</label>
          <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
            placeholder="Repeat your password" required className="input w-full" />
        </div>
        {msg && <p className="text-red-500 text-sm">{msg}</p>}
        <button type="submit" disabled={submitting}
          className={`btn-primary w-full py-3 ${submitting ? 'opacity-75 cursor-wait' : ''}`}>
          {submitting ? 'Saving…' : 'Create Password & Open Dashboard →'}
        </button>
      </form>
    </div>
  )

  if (phase === 'done') return (
    <div className="text-center max-w-md w-full">
      <div className="text-5xl mb-5">✅</div>
      <h1 className="text-2xl font-bold text-tan mb-2">All set!</h1>
      <p className="text-tan-light text-sm">Taking you to your dashboard…</p>
    </div>
  )

  // fallback: setup link emailed (or plain welcome email for edge cases without pk)
  return (
    <div className="text-center max-w-md w-full">
      <div className="text-5xl mb-5">📧</div>
      <h1 className="text-2xl font-bold text-tan mb-3">Check your inbox</h1>
      <p className="text-tan-light leading-relaxed mb-8">
        Your account is live. We emailed you a secure link to set your password and access your
        dashboard. It expires in 24 hours.
      </p>
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[['📣','Meta Ad','Live in 24hrs'],['📧','Emails','Sequence ready'],['📊','Dashboard','Tracking live']].map(([icon,title,sub]) => (
          <div key={title} className="card text-center py-5">
            <div className="text-2xl mb-2">{icon}</div>
            <div className="text-xs font-bold text-tan">{title}</div>
            <div className="text-xs text-tan-light mt-1">{sub}</div>
          </div>
        ))}
      </div>
      <a href="/login" className="btn-ghost px-8 py-3 text-sm">Already set your password? Log In →</a>
    </div>
  )
}
