'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Logo } from '@/components/layout/Logo'

export default function ForgotPasswordPage() {
  const [email,     setEmail]     = useState('')
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async () => {
    if (!email) { setError('Please enter your email'); return }
    setLoading(true)
    setError('')
    await fetch('/api/auth/forgot-password', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email }),
    })
    setLoading(false)
    setSubmitted(true)
  }

  if (submitted) return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <div className="inline-block mb-6"><Logo variant="dark" size="lg"/></div>
        <div className="card">
          <div className="text-3xl mb-4">📬</div>
          <h1 className="text-xl font-bold text-tan mb-2">Check your email</h1>
          <p className="text-tan-light text-sm leading-relaxed">
            If <strong className="text-tan">{email}</strong> is registered, you'll receive a password reset link shortly.
          </p>
        </div>
        <div className="text-center mt-4 text-sm">
          <Link href="/login" className="text-blue font-semibold">← Back to login</Link>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6"><Logo variant="dark" size="lg"/></Link>
          <h1 className="text-2xl font-bold text-tan">Reset your password</h1>
          <p className="text-tan-light text-sm mt-1">Enter your email and we'll send you a reset link.</p>
        </div>
        <div className="card">
          <div className="form-group mb-6">
            <label className="form-label">Email</label>
            <input className={`form-input ${error ? 'border-red-400' : ''}`}
              type="email" placeholder="hello@yourrestaurant.com"
              value={email} onChange={e => { setEmail(e.target.value); setError('') }}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}/>
          </div>
          {error && <p className="text-red-500 text-sm font-semibold mb-4 flex items-center gap-1">⚠ {error}</p>}
          <button onClick={handleSubmit} disabled={loading}
            className={`btn-primary w-full py-3 ${loading ? 'opacity-75 cursor-wait' : ''}`}>
            {loading ? '⏳ Sending...' : 'Send Reset Link →'}
          </button>
          <div className="text-center mt-3 text-sm">
            <Link href="/login" className="text-blue font-semibold">← Back to login</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
