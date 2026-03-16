'use client'

import { useState, useEffect, useCallback, type RefObject } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { extractExif } from '@/lib/utils/exif'
import { generateKenBurnsConfig } from '@/lib/utils/kenburns'
import { insertMedia } from '@/app/actions/media'

export interface UploadItem {
  id: string
  file: File
  name: string
  preview: string | null
  status: 'pending' | 'uploading' | 'processing' | 'done' | 'error'
  progress: number
  error?: string
}

const ACCEPTED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'video/mp4',
  'video/quicktime',
]

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

const ACCEPT_STRING = ACCEPTED_TYPES.join(',')

interface Props {
  userId: string
  tripId: string
  existingCount: number
  fileInputRef: RefObject<HTMLInputElement | null>
  uploads: UploadItem[]
  setUploads: React.Dispatch<React.SetStateAction<UploadItem[]>>
  updateItem: (id: string, updates: Partial<UploadItem>) => void
}

export default function MediaUploader({
  userId,
  tripId,
  existingCount,
  fileInputRef,
  uploads,
  setUploads,
  updateItem,
}: Props) {
  const [showDropZone, setShowDropZone] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const processFile = useCallback(
    async (item: UploadItem, sortOrder: number) => {
      // Validate size
      if (item.file.size > MAX_FILE_SIZE) {
        updateItem(item.id, {
          status: 'error',
          error: 'File too large (max 50MB)',
        })
        return
      }

      updateItem(item.id, { status: 'uploading', progress: 20 })

      try {
        // Extract EXIF (images only)
        let exif = null
        if (item.file.type.startsWith('image/')) {
          updateItem(item.id, { status: 'processing', progress: 35 })
          exif = await extractExif(item.file)
        }

        // Upload to Supabase Storage
        updateItem(item.id, { status: 'uploading', progress: 50 })
        const ext = item.file.name.split('.').pop() ?? 'jpg'
        const path = `${userId}/trips/${tripId}/${crypto.randomUUID()}.${ext}`
        const supabase = createClient()
        const { error } = await supabase.storage
          .from('media')
          .upload(path, item.file, { upsert: false })

        if (error) {
          updateItem(item.id, { status: 'error', error: error.message })
          return
        }

        updateItem(item.id, { progress: 75 })

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from('media').getPublicUrl(path)

        // Determine type and captured_at
        const type: 'photo' | 'video' = item.file.type.startsWith('video/')
          ? 'video'
          : 'photo'
        const capturedAt =
          exif?.capturedAt ?? new Date(item.file.lastModified).toISOString()

        // Generate Ken Burns config (photos only)
        const kenBurns = type === 'photo' ? generateKenBurnsConfig() : null

        // Sanitize EXIF raw data for JSON serialization
        let exifData: Record<string, unknown> | null = null
        if (exif?.raw && Object.keys(exif.raw).length > 0) {
          try {
            exifData = JSON.parse(JSON.stringify(exif.raw))
          } catch {
            exifData = null
          }
        }

        updateItem(item.id, { progress: 85 })

        // Insert media row
        await insertMedia({
          trip_id: tripId,
          file_url: publicUrl,
          type,
          captured_at: capturedAt,
          latitude: exif?.latitude ?? null,
          longitude: exif?.longitude ?? null,
          exif_data: exifData,
          sort_order: sortOrder,
          ken_burns_config: kenBurns,
        })

        updateItem(item.id, { status: 'done', progress: 100 })
      } catch (err) {
        updateItem(item.id, {
          status: 'error',
          error: err instanceof Error ? err.message : 'Upload failed',
        })
      }
    },
    [userId, tripId, updateItem]
  )

  const handleFiles = useCallback(
    async (files: File[]) => {
      const newItems: UploadItem[] = []

      for (const file of files) {
        if (!ACCEPTED_TYPES.includes(file.type)) {
          newItems.push({
            id: crypto.randomUUID(),
            file,
            name: file.name,
            preview: null,
            status: 'error',
            progress: 0,
            error: 'Unsupported format',
          })
          continue
        }

        const preview = file.type.startsWith('image/')
          ? URL.createObjectURL(file)
          : null

        newItems.push({
          id: crypto.randomUUID(),
          file,
          name: file.name,
          preview,
          status: 'pending',
          progress: 0,
        })
      }

      setUploads((prev) => [...prev, ...newItems])

      // Process valid files sequentially
      const validItems = newItems.filter((item) => item.status === 'pending')

      if (validItems.length > 0 && !isProcessing) {
        setIsProcessing(true)
        const baseOrder = existingCount + uploads.filter((u) => u.status !== 'error').length

        for (let i = 0; i < validItems.length; i++) {
          await processFile(validItems[i], baseOrder + i)
        }
        setIsProcessing(false)
      }
    },
    [existingCount, uploads, isProcessing, setUploads, processFile]
  )

  // Document-level drag-and-drop
  useEffect(() => {
    let dragCounter = 0

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault()
      dragCounter++
      if (dragCounter === 1) setShowDropZone(true)
    }

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault()
      dragCounter--
      if (dragCounter === 0) setShowDropZone(false)
    }

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault()
    }

    const handleDrop = (e: DragEvent) => {
      e.preventDefault()
      dragCounter = 0
      setShowDropZone(false)
      const files = Array.from(e.dataTransfer?.files ?? [])
      if (files.length > 0) handleFiles(files)
    }

    document.addEventListener('dragenter', handleDragEnter)
    document.addEventListener('dragleave', handleDragLeave)
    document.addEventListener('dragover', handleDragOver)
    document.addEventListener('drop', handleDrop)

    return () => {
      document.removeEventListener('dragenter', handleDragEnter)
      document.removeEventListener('dragleave', handleDragLeave)
      document.removeEventListener('dragover', handleDragOver)
      document.removeEventListener('drop', handleDrop)
    }
  }, [handleFiles])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (files.length > 0) handleFiles(files)
    // Reset input so the same files can be re-selected
    e.target.value = ''
  }

  return (
    <>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={ACCEPT_STRING}
        className="hidden"
        onChange={handleInputChange}
      />

      {/* Full-page drop zone overlay */}
      <AnimatePresence>
        {showDropZone && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[90] flex items-center justify-center p-8"
            style={{
              background: 'rgba(10,10,10,0.85)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}
          >
            <div
              className="w-full h-full max-w-3xl max-h-96 flex flex-col items-center justify-center gap-4 rounded-2xl"
              style={{
                border: '2px dashed rgba(212,165,116,0.5)',
                background: 'rgba(212,165,116,0.03)',
              }}
            >
              {/* Upload cloud icon */}
              <svg
                width="64"
                height="64"
                viewBox="0 0 64 64"
                fill="none"
                style={{ opacity: 0.4 }}
              >
                <path
                  d="M44 40l-12-12-12 12"
                  stroke="#d4a574"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M32 28v24"
                  stroke="#d4a574"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M52.6 45.4A12 12 0 0048 24h-3A19.2 19.2 0 0012 28a19.2 19.2 0 003.6 18"
                  stroke="#d4a574"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.8rem',
                  fontWeight: 300,
                  color: '#f0e6d6',
                  opacity: 0.6,
                }}
              >
                Drop files to add memories
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.8rem',
                  color: '#f0e6d6',
                  opacity: 0.3,
                }}
              >
                JPEG, PNG, WebP, MP4, MOV
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
