'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import MediaGrid from './MediaGrid'
import MediaUploader, { type UploadItem } from './MediaUploader'
import UploadPanel from './UploadPanel'
import type { Media } from '@/types'

interface Props {
  media: Media[]
  tripId: string
  userId: string
}

export default function TripDetailClient({ media, tripId, userId }: Props) {
  const [uploads, setUploads] = useState<UploadItem[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const updateItem = useCallback(
    (id: string, updates: Partial<UploadItem>) => {
      setUploads((prev) =>
        prev.map((u) => (u.id === id ? { ...u, ...updates } : u))
      )
    },
    []
  )

  const handleRetry = useCallback(
    (id: string) => {
      const item = uploads.find((u) => u.id === id)
      if (!item) return
      // Reset to pending — MediaUploader will need to re-process
      // For simplicity, we remove and re-add the file
      updateItem(id, { status: 'pending', progress: 0, error: undefined })
    },
    [uploads, updateItem]
  )

  const clearUploads = useCallback(() => {
    // Revoke preview URLs
    uploads.forEach((u) => {
      if (u.preview) URL.revokeObjectURL(u.preview)
    })
    setUploads([])
    router.refresh()
  }, [uploads, router])

  return (
    <>
      <MediaGrid media={media} />

      <MediaUploader
        userId={userId}
        tripId={tripId}
        existingCount={media.length}
        fileInputRef={fileInputRef}
        uploads={uploads}
        setUploads={setUploads}
        updateItem={updateItem}
      />

      <UploadPanel
        uploads={uploads}
        onRetry={handleRetry}
        onClear={clearUploads}
      />

      {/* Add Memories button */}
      <button
        onClick={() => fileInputRef.current?.click()}
        className="fixed bottom-8 right-8 z-50 flex items-center gap-2 px-5 py-3.5 rounded-full text-sm font-medium transition-all duration-200"
        style={{
          fontFamily: 'var(--font-body)',
          background: '#d4a574',
          color: '#0a0a0a',
          boxShadow: '0 8px 32px rgba(212,165,116,0.35)',
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLButtonElement
          el.style.background = '#e0b98a'
          el.style.transform = 'scale(1.04)'
          el.style.boxShadow = '0 12px 40px rgba(212,165,116,0.45)'
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLButtonElement
          el.style.background = '#d4a574'
          el.style.transform = 'scale(1)'
          el.style.boxShadow = '0 8px 32px rgba(212,165,116,0.35)'
        }}
      >
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
          <path
            d="M6.5 1v11M1 6.5h11"
            stroke="#0a0a0a"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        Add Memories
      </button>
    </>
  )
}
