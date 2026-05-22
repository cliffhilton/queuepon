'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Logo } from '@/components/layout/Logo'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  const handleLogin = async () => {
    if (!email || !password) { setError('Please enter your email and password'); return }
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <Logo variant="dark" size="lg"/>
          </Link>
          <h1 className="text-2xl font-bold text-tan">Welcome back</h1>
          <p className="text-tan-light text-sm mt-1">Sign in to your restaurant dashboard</p>
        </div>

        <div className="card">
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className={`form-input ${error ? 'border-red-400' : ''}`}
              type="email" placeholder="hello@yourrestaurant.com"
              value={email} onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}/>
          </div>
          <div className="form-group mb-6">
            <label className="form-label">Password</label>
            <input className={`form-input ${error ? 'border-red-400' : ''}`}
              type="password" placeholder="••••••••"
              value={password} onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}/>
          </div>

          {error && (
            <p className="text-red-500 text-sm font-semibold mb-4 flex items-center gap-1">⚠ {error}</p>
          )}

          <button onClick={handleLogin} disabled={loading}
            className={`btn-primary w-full py-3 ${loading ? 'opacity-75 cursor-wait' : ''}`}>
            {loading ? '⏳ Signing in...' : 'Log In →'}
          </button>

          <div className="text-center mt-4 text-sm text-tan-light">
            Don't have an account?{' '}
            <Link href="/signup" className="text-blue font-semibold">Sign up</Link>
          </div>
        </div>

        <div className="text-center mt-4 text-xs text-tan-light">
          <Link href="/" className="hover:text-blue transition-colors">← Back to home</Link>
        </div>
      </div>
    </div>
  )
}
