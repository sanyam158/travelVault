import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getTrip, getMediaByTrip } from '@/lib/queries/media'
import TripDetailClient from '@/components/TripDetailClient'

function formatDateRange(start: string | null, end: string | null): string | null {
  if (!start) return null
  const fmt = (d: string) =>
    new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  if (!end || start === end) return fmt(start)
  return `${fmt(start)} — ${fmt(end)}`
}

export default async function TripDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const trip = await getTrip(id)
  if (!trip) notFound()

  const media = await getMediaByTrip(trip.id)
  const dateRange = formatDateRange(trip.start_date, trip.end_date)

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a' }}>
      {/* Hero */}
      <section
        className="relative w-full"
        style={{ height: '40vh', minHeight: 320 }}
      >
        {/* Cover image */}
        {trip.cover_image_url ? (
          <Image
            src={trip.cover_image_url}
            fill
            alt={trip.title}
            className="object-cover"
            priority
            sizes="100vw"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{ background: '#141414' }}
          />
        )}

        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to top, rgba(10,10,10,1) 0%, rgba(10,10,10,0.4) 50%, rgba(10,10,10,0.6) 100%)',
          }}
        />

        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-5 z-10">
          {/* Back arrow */}
          <Link
            href="/"
            className="flex items-center justify-center w-10 h-10 rounded-full transition-all"
            style={{
              background: 'rgba(240,230,214,0.08)',
              border: '1px solid rgba(240,230,214,0.1)',
              color: '#f0e6d6',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M10 3L5 8l5 5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <Link
              href={`/trip/${trip.id}/slideshow`}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm transition-all"
              style={{
                fontFamily: 'var(--font-body)',
                background: 'rgba(212,165,116,0.15)',
                border: '1px solid rgba(212,165,116,0.3)',
                color: '#d4a574',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M4 2.5l8 4.5-8 4.5V2.5z" fill="currentColor" />
              </svg>
              Play Slideshow
            </Link>

            <button
              className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm transition-all opacity-70 hover:opacity-100"
              style={{
                fontFamily: 'var(--font-body)',
                background: 'rgba(240,230,214,0.08)',
                border: '1px solid rgba(240,230,214,0.1)',
                color: '#f0e6d6',
              }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M8.5 1.5l2 2M1 11l.7-2.8L9 .9l2 2-7.3 7.3L1 11z"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Edit
            </button>
          </div>
        </div>

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-8 z-10">
          <div className="max-w-7xl mx-auto">
            {dateRange && (
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.72rem',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: '#d4a574',
                  opacity: 0.85,
                  marginBottom: 10,
                }}
              >
                {dateRange}
              </p>
            )}
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
                fontWeight: 300,
                color: '#f0e6d6',
                lineHeight: 1,
                letterSpacing: '-0.02em',
              }}
            >
              {trip.title}
            </h1>
            {trip.subtitle && (
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '1rem',
                  color: '#f0e6d6',
                  opacity: 0.45,
                  marginTop: 8,
                }}
              >
                {trip.subtitle}
              </p>
            )}
            {media.length > 0 && (
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.8rem',
                  color: '#f0e6d6',
                  opacity: 0.3,
                  marginTop: 12,
                }}
              >
                {media.length} {media.length === 1 ? 'memory' : 'memories'}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Media grid */}
      <main className="px-6 max-w-7xl mx-auto pt-8">
        <TripDetailClient media={media} tripId={trip.id} userId={trip.user_id} />
      </main>
    </div>
  )
}
