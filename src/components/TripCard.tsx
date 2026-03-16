'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import type { Trip } from '@/types'

export const cardVariant = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const },
  },
}

function formatDateRange(start: string | null, end: string | null): string {
  if (!start) return ''
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  return end && end !== start ? `${fmt(start)} – ${fmt(end)}` : fmt(start)
}

function PlaceholderCover() {
  return (
    <div className="absolute inset-0 flex items-center justify-center" style={{ background: '#141414' }}>
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" opacity={0.25}>
        <rect x="4" y="10" width="40" height="28" rx="3" stroke="#d4a574" strokeWidth="1.5" />
        <rect x="4" y="16" width="6" height="4" fill="#d4a574" />
        <rect x="4" y="28" width="6" height="4" fill="#d4a574" />
        <rect x="38" y="16" width="6" height="4" fill="#d4a574" />
        <rect x="38" y="28" width="6" height="4" fill="#d4a574" />
        <circle cx="24" cy="24" r="6" stroke="#d4a574" strokeWidth="1.5" />
        <circle cx="24" cy="24" r="2" fill="#d4a574" />
      </svg>
    </div>
  )
}

export default function TripCard({ trip }: { trip: Trip }) {
  const router = useRouter()

  return (
    <motion.div
      variants={cardVariant}
      onClick={() => router.push(`/trip/${trip.id}`)}
      whileHover={{ scale: 1.025, filter: 'brightness(1.08)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className="relative cursor-pointer rounded-2xl overflow-hidden"
      style={{ aspectRatio: '4/3', background: '#141414' }}
    >
      {/* Cover image */}
      {trip.cover_image_url ? (
        <Image
          src={trip.cover_image_url}
          fill
          alt={trip.title}
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      ) : (
        <PlaceholderCover />
      )}

      {/* Gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.25) 55%, transparent 100%)',
        }}
      />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-5">
        {/* Media count badge */}
        {trip.media_count > 0 && (
          <span
            className="inline-block mb-2 px-2.5 py-0.5 rounded-full text-xs"
            style={{
              background: 'rgba(212,165,116,0.18)',
              border: '1px solid rgba(212,165,116,0.3)',
              color: '#d4a574',
              fontFamily: 'var(--font-body)',
              letterSpacing: '0.04em',
            }}
          >
            {trip.media_count} {trip.media_count === 1 ? 'photo' : 'photos'}
          </span>
        )}

        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.65rem',
            fontWeight: 400,
            color: '#f0e6d6',
            lineHeight: 1.1,
            letterSpacing: '-0.01em',
          }}
        >
          {trip.title}
        </h2>

        {trip.subtitle && (
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.8rem',
              color: '#f0e6d6',
              opacity: 0.55,
              marginTop: 3,
            }}
          >
            {trip.subtitle}
          </p>
        )}

        {(trip.start_date || trip.end_date) && (
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.72rem',
              color: '#d4a574',
              opacity: 0.85,
              marginTop: 6,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            {formatDateRange(trip.start_date, trip.end_date)}
          </p>
        )}
      </div>
    </motion.div>
  )
}
