'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Logo } from '@/components/layout/Logo'

export default function SetPasswordPage() {
  const router = useRouter()
  const [password,  setPassword]  = useState('')
  const [confirm,   setConfirm]   = useState('')
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')

  const handleSubmit = async () => {
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    if (password !== confirm) { setError('Passwords do not match'); return }

    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error: updateError } = await supabase.auth.updateUser({ password })

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-block mb-6">
            <Logo variant="dark" size="lg"/>
          </div>
          <h1 className="text-2xl font-bold text-tan">Set Your Password</h1>
          <p className="text-tan-light text-sm mt-1">Choose a password to access your dashboard anytime.</p>
        </div>

        <div className="card">
          <div className="form-group">
            <label className="form-label">New Password</label>
            <input className={`form-input ${error ? 'border-red-400' : ''}`}
              type="password" placeholder="Minimum 8 characters"
              value={password} onChange={e => { setPassword(e.target.value); setError('') }}/>
          </div>
          <div className="form-group mb-6">
            <label className="form-label">Confirm Password</label>
            <input className={`form-input ${error ? 'border-red-400' : ''}`}
              type="password" placeholder="Repeat your password"
              value={confirm} onChange={e => { setConfirm(e.target.value); setError('') }}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}/>
          </div>

          {error && (
            <p className="text-red-500 text-sm font-semibold mb-4">⚠ {error}</p>
          )}

          <button onClick={handleSubmit} disabled={loading}
            className={`btn-primary w-full py-3 ${loading ? 'opacity-75 cursor-wait' : ''}`}>
            {loading ? '⏳ Setting password...' : 'Set Password & Go to Dashboard →'}
          </button>
        </div>
      </div>
    </div>
  )
}
