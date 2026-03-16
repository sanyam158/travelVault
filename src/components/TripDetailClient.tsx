'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import MediaGrid from './MediaGrid'
import MediaUploader, { type UploadItem } from './MediaUploader'
import UploadPanel from './UploadPanel'
import EditMediaModal from './EditMediaModal'
import { updateMediaOrder, deleteMultipleMedia } from '@/app/actions/media'
import type { Media, Trip } from '@/types'

interface Props {
  media: Media[]
  tripId: string
  userId: string
  trip: Trip
}

export default function TripDetailClient({
  media,
  tripId,
  userId,
  trip,
}: Props) {
  const [uploads, setUploads] = useState<UploadItem[]>([])
  const [editingMedia, setEditingMedia] = useState<Media | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [batchConfirm, setBatchConfirm] = useState(false)
  const [batchLoading, setBatchLoading] = useState(false)
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
      updateItem(id, { status: 'pending', progress: 0, error: undefined })
    },
    [updateItem]
  )

  const clearUploads = useCallback(() => {
    uploads.forEach((u) => {
      if (u.preview) URL.revokeObjectURL(u.preview)
    })
    setUploads([])
    router.refresh()
  }, [uploads, router])

  const handleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const handleReorder = useCallback(
    async (orderedIds: string[]) => {
      // Optimistic — MediaGrid already reordered locally
      await updateMediaOrder(tripId, orderedIds)
    },
    [tripId]
  )

  const handleBatchDelete = useCallback(async () => {
    if (selectedIds.size === 0) return
    setBatchLoading(true)
    try {
      await deleteMultipleMedia([...selectedIds])
      setSelectedIds(new Set())
      setBatchConfirm(false)
      router.refresh()
    } finally {
      setBatchLoading(false)
    }
  }, [selectedIds, router])

  const clearSelection = () => {
    setSelectedIds(new Set())
    setBatchConfirm(false)
  }

  return (
    <>
      <MediaGrid
        media={media}
        onEdit={setEditingMedia}
        onSelect={handleSelect}
        selectedIds={selectedIds}
        onReorder={handleReorder}
      />

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

      {/* Edit media modal */}
      {editingMedia && (
        <EditMediaModal
          media={editingMedia}
          open={!!editingMedia}
          onClose={() => setEditingMedia(null)}
        />
      )}

      {/* Batch selection bar */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-full"
            style={{
              background: 'rgba(16,11,7,0.95)',
              border: '1px solid rgba(212,165,116,0.2)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.82rem',
                color: '#f0e6d6',
                opacity: 0.7,
              }}
            >
              {selectedIds.size} selected
            </span>
            <div
              style={{
                width: 1,
                height: 14,
                background: 'rgba(240,230,214,0.15)',
              }}
            />
            {!batchConfirm ? (
              <>
                <button
                  onClick={() => setBatchConfirm(true)}
                  className="text-sm transition-all"
                  style={{
                    fontFamily: 'var(--font-body)',
                    color: '#e07575',
                    opacity: 0.8,
                  }}
                >
                  Delete
                </button>
                <button
                  onClick={clearSelection}
                  className="text-sm transition-all"
                  style={{
                    fontFamily: 'var(--font-body)',
                    color: '#f0e6d6',
                    opacity: 0.4,
                  }}
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <span
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.8rem',
                    color: '#f0e6d6',
                    opacity: 0.5,
                  }}
                >
                  Are you sure?
                </span>
                <button
                  onClick={handleBatchDelete}
                  disabled={batchLoading}
                  className="text-sm font-medium transition-all"
                  style={{
                    fontFamily: 'var(--font-body)',
                    color: batchLoading ? 'rgba(224,117,117,0.5)' : '#e07575',
                  }}
                >
                  {batchLoading ? 'Deleting…' : 'Confirm'}
                </button>
                <button
                  onClick={() => setBatchConfirm(false)}
                  className="text-sm transition-all"
                  style={{
                    fontFamily: 'var(--font-body)',
                    color: '#f0e6d6',
                    opacity: 0.4,
                  }}
                >
                  Cancel
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

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
