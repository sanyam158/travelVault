'use client'

import { motion } from 'framer-motion'
import TripCard from './TripCard'
import type { Trip } from '@/types'

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.07 },
  },
}

function EmptyState({ onOpenModal }: { onOpenModal: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-32 px-6 text-center">
      {/* Film reel icon */}
      <svg width="72" height="72" viewBox="0 0 72 72" fill="none" style={{ opacity: 0.2, marginBottom: 28 }}>
        <circle cx="36" cy="36" r="32" stroke="#d4a574" strokeWidth="1.5" />
        <circle cx="36" cy="36" r="12" stroke="#d4a574" strokeWidth="1.5" />
        <circle cx="36" cy="36" r="3" fill="#d4a574" />
        <circle cx="36" cy="10" r="4" stroke="#d4a574" strokeWidth="1.5" />
        <circle cx="36" cy="62" r="4" stroke="#d4a574" strokeWidth="1.5" />
        <circle cx="10" cy="36" r="4" stroke="#d4a574" strokeWidth="1.5" />
        <circle cx="62" cy="36" r="4" stroke="#d4a574" strokeWidth="1.5" />
        <circle cx="17" cy="17" r="4" stroke="#d4a574" strokeWidth="1.5" />
        <circle cx="55" cy="55" r="4" stroke="#d4a574" strokeWidth="1.5" />
        <circle cx="55" cy="17" r="4" stroke="#d4a574" strokeWidth="1.5" />
        <circle cx="17" cy="55" r="4" stroke="#d4a574" strokeWidth="1.5" />
      </svg>

      <h2
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '2rem',
          fontWeight: 300,
          color: '#f0e6d6',
          opacity: 0.6,
          marginBottom: 10,
        }}
      >
        No trips yet.
      </h2>
      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.9rem',
          color: '#f0e6d6',
          opacity: 0.35,
          marginBottom: 32,
        }}
      >
        Start your first journey.
      </p>

      <button
        onClick={onOpenModal}
        className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all duration-200"
        style={{
          fontFamily: 'var(--font-body)',
          background: '#d4a574',
          color: '#0a0a0a',
          boxShadow: '0 4px 24px rgba(212,165,116,0.3)',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.background = '#e0b98a'
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.background = '#d4a574'
        }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 1v12M1 7h12" stroke="#0a0a0a" strokeWidth="2" strokeLinecap="round" />
        </svg>
        Create Trip
      </button>
    </div>
  )
}

interface Props {
  trips: Trip[]
  onOpenModal: () => void
}

export default function TripGrid({ trips, onOpenModal }: Props) {
  if (trips.length === 0) return <EmptyState onOpenModal={onOpenModal} />

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pb-28"
    >
      {trips.map(trip => (
        <TripCard key={trip.id} trip={trip} />
      ))}
    </motion.div>
  )
}
