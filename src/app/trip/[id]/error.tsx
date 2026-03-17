'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function TripError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div
      className="flex flex-col items-center justify-center px-6 text-center"
      style={{ minHeight: '100vh', background: '#0a0a0a' }}
    >
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(2rem, 5vw, 3.5rem)',
          fontWeight: 300,
          color: '#f0e6d6',
          lineHeight: 1.1,
          letterSpacing: '-0.02em',
        }}
      >
        Something went wrong
      </h1>
      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.9rem',
          color: '#f0e6d6',
          opacity: 0.4,
          marginTop: 12,
          marginBottom: 32,
        }}
      >
        We couldn&apos;t load this trip.
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={reset}
          className="px-6 py-3 rounded-full text-sm font-medium transition-all"
          style={{
            fontFamily: 'var(--font-body)',
            background: '#d4a574',
            color: '#0a0a0a',
          }}
        >
          Try again
        </button>
        <Link
          href="/"
          className="px-6 py-3 rounded-full text-sm transition-all"
          style={{
            fontFamily: 'var(--font-body)',
            background: 'rgba(240,230,214,0.06)',
            border: '1px solid rgba(240,230,214,0.12)',
            color: '#f0e6d6',
            opacity: 0.7,
          }}
        >
          Back to trips
        </Link>
      </div>
    </div>
  )
}
