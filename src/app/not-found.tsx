import Link from 'next/link'

export default function NotFound() {
  return (
    <div
      className="flex flex-col items-center justify-center px-6 text-center"
      style={{ minHeight: '100vh', background: '#0a0a0a' }}
    >
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(5rem, 15vw, 10rem)',
          fontWeight: 300,
          fontStyle: 'italic',
          color: '#f0e6d6',
          opacity: 0.15,
          lineHeight: 1,
          letterSpacing: '-0.03em',
        }}
      >
        404
      </h1>
      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '1rem',
          color: '#f0e6d6',
          opacity: 0.5,
          marginTop: 8,
          marginBottom: 32,
        }}
      >
        This page doesn&apos;t exist.
      </p>
      <Link
        href="/"
        className="px-6 py-3 rounded-full text-sm transition-all"
        style={{
          fontFamily: 'var(--font-body)',
          background: 'rgba(212,165,116,0.15)',
          border: '1px solid rgba(212,165,116,0.3)',
          color: '#d4a574',
        }}
      >
        Back to home
      </Link>
    </div>
  )
}
