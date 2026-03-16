'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState<'google' | 'magic' | null>(null)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const handleGoogleSignIn = async () => {
    setLoading('google')
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      setError(error.message)
      setLoading(null)
    }
  }

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading('magic')
    setError(null)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
      },
    })
    if (error) {
      setError(error.message)
      setLoading(null)
    } else {
      setSent(true)
      setLoading(null)
    }
  }

  return (
    <div style={{ fontFamily: 'var(--font-body)' }}>
      {/* Google OAuth Button */}
      <button
        onClick={handleGoogleSignIn}
        disabled={loading !== null}
        className="w-full flex items-center justify-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background: loading === 'google' ? 'rgba(212,165,116,0.15)' : 'rgba(212,165,116,0.08)',
          border: '1px solid rgba(212,165,116,0.35)',
          color: '#f0e6d6',
        }}
        onMouseEnter={e => {
          if (loading === null) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(212,165,116,0.15)'
        }}
        onMouseLeave={e => {
          if (loading !== 'google') (e.currentTarget as HTMLButtonElement).style.background = 'rgba(212,165,116,0.08)'
        }}
      >
        {loading === 'google' ? (
          <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="#d4a574" strokeWidth="4" />
            <path className="opacity-75" fill="#d4a574" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
        )}
        {loading === 'google' ? 'Redirecting…' : 'Continue with Google'}
      </button>

      {/* Divider */}
      <div className="my-6 flex items-center gap-3">
        <div className="flex-1 h-px" style={{ background: 'rgba(240,230,214,0.1)' }} />
        <span className="text-xs" style={{ color: '#f0e6d6', opacity: 0.35 }}>or</span>
        <div className="flex-1 h-px" style={{ background: 'rgba(240,230,214,0.1)' }} />
      </div>

      {/* Magic Link Form */}
      {sent ? (
        <div
          className="rounded-xl p-4 text-center text-sm"
          style={{ background: 'rgba(212,165,116,0.08)', border: '1px solid rgba(212,165,116,0.2)', color: '#d4a574' }}
        >
          <svg className="mx-auto mb-2" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d4a574" strokeWidth="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
          Check your email — we sent a magic link to <strong>{email}</strong>
        </div>
      ) : (
        <form onSubmit={handleMagicLink} className="space-y-3">
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200 placeholder:opacity-30"
            style={{
              background: 'rgba(240,230,214,0.05)',
              border: '1px solid rgba(240,230,214,0.12)',
              color: '#f0e6d6',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = 'rgba(212,165,116,0.4)' }}
            onBlur={e => { e.currentTarget.style.borderColor = 'rgba(240,230,214,0.12)' }}
          />
          <button
            type="submit"
            disabled={loading !== null || !email}
            className="w-full rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: 'rgba(240,230,214,0.06)',
              border: '1px solid rgba(240,230,214,0.15)',
              color: '#f0e6d6',
            }}
            onMouseEnter={e => {
              if (loading === null && email) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(240,230,214,0.1)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(240,230,214,0.06)'
            }}
          >
            {loading === 'magic' ? 'Sending…' : 'Send magic link'}
          </button>
        </form>
      )}

      {/* Error */}
      {error && (
        <p className="mt-3 text-center text-xs" style={{ color: '#e07575' }}>{error}</p>
      )}
    </div>
  )
}
