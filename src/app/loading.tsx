export default function HomeLoading() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a' }}>
      {/* Header */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between px-4 sm:px-6 py-4"
        style={{
          background: 'rgba(10,10,10,0.85)',
          borderBottom: '1px solid rgba(212,165,116,0.08)',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.5rem',
            fontWeight: 400,
            color: '#d4a574',
            letterSpacing: '-0.01em',
          }}
        >
          TravelVault
        </span>
        <div
          className="w-8 h-8 rounded-full animate-pulse"
          style={{ background: '#141414' }}
        />
      </header>

      {/* Hero skeleton */}
      <section className="px-4 sm:px-6 pt-16 pb-12 max-w-7xl mx-auto">
        <div
          className="w-24 h-3 rounded animate-pulse mb-4"
          style={{ background: '#141414' }}
        />
        <div
          className="w-72 h-12 rounded animate-pulse mb-4"
          style={{ background: '#141414' }}
        />
        <div
          className="w-40 h-3 rounded animate-pulse"
          style={{ background: '#141414' }}
        />
      </section>

      {/* Grid skeleton */}
      <section className="px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden animate-pulse">
              <div
                style={{ aspectRatio: '4/3', background: '#141414' }}
              />
              <div className="p-4" style={{ background: '#0f0f0f' }}>
                <div
                  className="w-3/4 h-4 rounded mb-2"
                  style={{ background: '#1a1a1a' }}
                />
                <div
                  className="w-1/2 h-3 rounded"
                  style={{ background: '#1a1a1a' }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
