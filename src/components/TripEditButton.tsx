'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'

const EditTripModal = dynamic(() => import('./EditTripModal'), { ssr: false })
import type { Trip } from '@/types'

interface Props {
  trip: Trip
}

export default function TripEditButton({ trip }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
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

      <EditTripModal
        trip={trip}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  )
}
