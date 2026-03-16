'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import type { Media } from '@/types'

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-32 px-6 text-center">
      {/* Camera icon */}
      <svg width="72" height="72" viewBox="0 0 72 72" fill="none" style={{ opacity: 0.2, marginBottom: 28 }}>
        <rect x="8" y="20" width="56" height="40" rx="6" stroke="#d4a574" strokeWidth="1.5" />
        <circle cx="36" cy="40" r="10" stroke="#d4a574" strokeWidth="1.5" />
        <circle cx="36" cy="40" r="4" fill="#d4a574" />
        <path d="M26 20v-4a4 4 0 014-4h12a4 4 0 014 4v4" stroke="#d4a574" strokeWidth="1.5" />
        <circle cx="52" cy="28" r="2" fill="#d4a574" />
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
        No memories yet.
      </h2>
      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.9rem',
          color: '#f0e6d6',
          opacity: 0.35,
        }}
      >
        Drop photos here or click to upload.
      </p>
    </div>
  )
}

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
}

interface Props {
  media: Media[]
}

export default function MediaGrid({ media }: Props) {
  if (media.length === 0) return <EmptyState />

  return (
    <div
      style={{ columnGap: 12 }}
      className="columns-2 sm:columns-3 lg:columns-4 pb-28"
    >
      {media.map((m) => (
        <motion.div
          key={m.id}
          variants={item}
          initial="hidden"
          animate="show"
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="break-inside-avoid mb-3 group relative cursor-pointer"
        >
          <div
            className="relative overflow-hidden rounded-lg transition-transform duration-200 group-hover:-translate-y-0.5"
          >
            <Image
              src={m.file_url}
              alt={m.caption || ''}
              width={400}
              height={300}
              className="w-full h-auto"
              style={{ display: 'block' }}
            />

            {/* Video play overlay */}
            {m.type === 'video' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="flex items-center justify-center rounded-full"
                  style={{
                    width: 48,
                    height: 48,
                    background: 'rgba(0,0,0,0.6)',
                    border: '1.5px solid rgba(240,230,214,0.3)',
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M5 3.5l10 5.5-10 5.5V3.5z" fill="#f0e6d6" />
                  </svg>
                </div>
              </div>
            )}

            {/* Hover edit icon */}
            <div
              className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              style={{
                background: 'rgba(0,0,0,0.7)',
                border: '1px solid rgba(240,230,214,0.2)',
              }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M8.5 1.5l2 2M1 11l.7-2.8L9 .9l2 2-7.3 7.3L1 11z"
                  stroke="#f0e6d6"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          {/* Caption */}
          {m.caption && (
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.8rem',
                color: '#f0e6d6',
                opacity: 0.6,
                marginTop: 6,
                lineHeight: 1.4,
              }}
            >
              {m.caption}
            </p>
          )}

          {/* Location tag */}
          {m.location_name && (
            <div
              className="flex items-center gap-1 mt-1"
              style={{ opacity: 0.4 }}
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path
                  d="M5 1C3.34 1 2 2.34 2 4c0 2.25 3 5 3 5s3-2.75 3-5c0-1.66-1.34-3-3-3zm0 4a1 1 0 110-2 1 1 0 010 2z"
                  fill="#d4a574"
                />
              </svg>
              <span
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.7rem',
                  color: '#d4a574',
                }}
              >
                {m.location_name}
              </span>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  )
}
