export default function TripDetailLoading() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a' }}>
      {/* Hero skeleton */}
      <section
        className="relative w-full"
        style={{ height: '40vh', minHeight: 280 }}
      >
        <div
          className="absolute inset-0 animate-pulse"
          style={{ background: '#141414' }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to top, rgba(10,10,10,1) 0%, rgba(10,10,10,0.4) 50%, rgba(10,10,10,0.6) 100%)',
          }}
        />

        {/* Back button skeleton */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 sm:px-6 py-5 z-10">
          <div
            className="w-10 h-10 rounded-full animate-pulse"
            style={{ background: 'rgba(240,230,214,0.08)' }}
          />
          <div className="flex items-center gap-2">
            <div
              className="w-32 h-10 rounded-full animate-pulse"
              style={{ background: 'rgba(240,230,214,0.05)' }}
            />
            <div
              className="w-16 h-10 rounded-full animate-pulse"
              style={{ background: 'rgba(240,230,214,0.05)' }}
            />
          </div>
        </div>

        {/* Title skeleton */}
        <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-6 pb-8 z-10">
          <div className="max-w-7xl mx-auto">
            <div
              className="w-28 h-3 rounded animate-pulse mb-3"
              style={{ background: 'rgba(212,165,116,0.15)' }}
            />
            <div
              className="w-64 h-10 rounded animate-pulse mb-2"
              style={{ background: 'rgba(240,230,214,0.08)' }}
            />
            <div
              className="w-40 h-3 rounded animate-pulse"
              style={{ background: 'rgba(240,230,214,0.05)' }}
            />
          </div>
        </div>
      </section>

      {/* Media grid skeleton */}
      <main className="px-4 sm:px-6 max-w-7xl mx-auto pt-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square rounded-lg animate-pulse"
              style={{ background: '#141414' }}
            />
          ))}
        </div>
      </main>
    </div>
  )
}
