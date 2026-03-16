import { createClient } from '@/lib/supabase/server'
import { getTrips } from '@/lib/queries/trips'
import AuthButton from '@/components/AuthButton'
import HomeClient from '@/components/HomeClient'

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const trips = user ? await getTrips(user.id) : []

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a' }}>
      {/* Top bar */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between px-6 py-4"
        style={{
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
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
        <AuthButton />
      </header>

      <main>
        {/* Hero */}
        <section className="px-6 pt-16 pb-12 max-w-7xl mx-auto">
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.72rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#d4a574',
              opacity: 0.6,
              marginBottom: 12,
            }}
          >
            Your collection
          </p>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(3rem, 7vw, 5.5rem)',
              fontWeight: 300,
              color: '#f0e6d6',
              lineHeight: 1,
              letterSpacing: '-0.02em',
            }}
          >
            Your Journeys
          </h1>
          {trips.length > 0 && (
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.85rem',
                color: '#f0e6d6',
                opacity: 0.35,
                marginTop: 16,
              }}
            >
              {trips.length} {trips.length === 1 ? 'trip' : 'trips'} · ordered by date
            </p>
          )}
        </section>

        {/* Grid + modal (client) */}
        <section className="px-6 max-w-7xl mx-auto">
          <HomeClient trips={trips} userId={user?.id ?? ''} />
        </section>
      </main>
    </div>
  )
}
