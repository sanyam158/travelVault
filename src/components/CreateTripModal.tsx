'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { createTrip } from '@/app/actions/trips'

const INPUT_STYLE = {
  background: 'rgba(240,230,214,0.05)',
  border: '1px solid rgba(240,230,214,0.12)',
  color: '#f0e6d6',
  fontFamily: 'var(--font-body)',
  borderRadius: 12,
  padding: '12px 16px',
  width: '100%',
  outline: 'none',
  fontSize: '0.9rem',
}

const DATE_INPUT_STYLE = {
  ...INPUT_STYLE,
  colorScheme: 'dark' as const,
}

interface Props {
  open: boolean
  userId: string
  onClose: () => void
  onSuccess: (tripId: string) => void
}

export default function CreateTripModal({ open, userId, onClose, onSuccess }: Props) {
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return
    setCoverFile(file)
    setCoverPreview(URL.createObjectURL(file))
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const removeCover = () => {
    setCoverFile(null)
    if (coverPreview) URL.revokeObjectURL(coverPreview)
    setCoverPreview(null)
  }

  const handleClose = () => {
    if (loading) return
    onClose()
    // reset after exit animation
    setTimeout(() => {
      setTitle('')
      setSubtitle('')
      setStartDate('')
      setEndDate('')
      removeCover()
      setError(null)
    }, 250)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) { setError('Title is required'); return }
    setLoading(true)
    setError(null)

    try {
      let cover_image_url: string | undefined

      if (coverFile) {
        const ext = coverFile.name.split('.').pop() ?? 'jpg'
        const path = `${userId}/covers/${crypto.randomUUID()}.${ext}`
        const supabase = createClient()
        const { error: uploadError } = await supabase.storage
          .from('media')
          .upload(path, coverFile, { upsert: false })
        if (uploadError) throw new Error(uploadError.message)
        const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(path)
        cover_image_url = publicUrl
      }

      const tripId = await createTrip({
        title,
        subtitle: subtitle || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        cover_image_url,
      })

      toast.success('Trip created')
      onSuccess(tripId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
          onClick={e => { if (e.target === e.currentTarget) handleClose() }}
        >
          <motion.div
            key="panel"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-lg rounded-2xl p-8 overflow-y-auto"
            style={{
              background: 'rgba(16, 11, 7, 0.97)',
              border: '1px solid rgba(212,165,116,0.15)',
              boxShadow: '0 32px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(212,165,116,0.08)',
              maxHeight: '90vh',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-7">
              <div>
                <h2
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '2rem',
                    fontWeight: 300,
                    color: '#f0e6d6',
                    lineHeight: 1,
                    letterSpacing: '-0.01em',
                  }}
                >
                  Start a New Journey
                </h2>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: '#f0e6d6', opacity: 0.35, marginTop: 6 }}>
                  Every trip begins with a name.
                </p>
              </div>
              <button
                onClick={handleClose}
                className="flex-shrink-0 ml-4 mt-1 w-8 h-8 rounded-full flex items-center justify-center transition-all"
                style={{ background: 'rgba(240,230,214,0.06)', color: '#f0e6d6', opacity: 0.5 }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1' }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.5' }}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#d4a574', opacity: 0.7, display: 'block', marginBottom: 8 }}>
                  Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Rajasthan, Iceland, Patagonia…"
                  required
                  style={{ ...INPUT_STYLE, fontSize: '1.1rem' }}
                  onFocus={e => { e.currentTarget.style.borderColor = 'rgba(212,165,116,0.4)' }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'rgba(240,230,214,0.12)' }}
                />
              </div>

              {/* Subtitle */}
              <div>
                <label style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#d4a574', opacity: 0.7, display: 'block', marginBottom: 8 }}>
                  Subtitle
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={e => setSubtitle(e.target.value)}
                  placeholder="The Land of Kings"
                  style={INPUT_STYLE}
                  onFocus={e => { e.currentTarget.style.borderColor = 'rgba(212,165,116,0.4)' }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'rgba(240,230,214,0.12)' }}
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#d4a574', opacity: 0.7, display: 'block', marginBottom: 8 }}>
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    style={DATE_INPUT_STYLE}
                    onFocus={e => { e.currentTarget.style.borderColor = 'rgba(212,165,116,0.4)' }}
                    onBlur={e => { e.currentTarget.style.borderColor = 'rgba(240,230,214,0.12)' }}
                  />
                </div>
                <div>
                  <label style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#d4a574', opacity: 0.7, display: 'block', marginBottom: 8 }}>
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    min={startDate || undefined}
                    style={DATE_INPUT_STYLE}
                    onFocus={e => { e.currentTarget.style.borderColor = 'rgba(212,165,116,0.4)' }}
                    onBlur={e => { e.currentTarget.style.borderColor = 'rgba(240,230,214,0.12)' }}
                  />
                </div>
              </div>

              {/* Cover Image */}
              <div>
                <label style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#d4a574', opacity: 0.7, display: 'block', marginBottom: 8 }}>
                  Cover Image
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
                />

                {coverPreview ? (
                  <div className="relative rounded-xl overflow-hidden" style={{ aspectRatio: '16/9' }}>
                    <Image src={coverPreview} fill alt="Cover preview" className="object-cover" />
                    <button
                      type="button"
                      onClick={removeCover}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center"
                      style={{ background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(240,230,214,0.2)', color: '#f0e6d6' }}
                    >
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-2 right-2 px-3 py-1.5 rounded-lg text-xs"
                      style={{ fontFamily: 'var(--font-body)', background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(240,230,214,0.2)', color: '#f0e6d6' }}
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    className="flex flex-col items-center justify-center gap-3 rounded-xl cursor-pointer transition-all"
                    style={{
                      aspectRatio: '16/9',
                      border: `1.5px dashed ${dragOver ? 'rgba(212,165,116,0.6)' : 'rgba(240,230,214,0.12)'}`,
                      background: dragOver ? 'rgba(212,165,116,0.05)' : 'rgba(240,230,214,0.02)',
                    }}
                  >
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" style={{ opacity: 0.3 }}>
                      <rect x="2" y="7" width="24" height="18" rx="3" stroke="#d4a574" strokeWidth="1.5" />
                      <circle cx="14" cy="16" r="4" stroke="#d4a574" strokeWidth="1.5" />
                      <path d="M10 7V5a2 2 0 012-2h4a2 2 0 012 2v2" stroke="#d4a574" strokeWidth="1.5" />
                      <circle cx="21" cy="12" r="1" fill="#d4a574" />
                    </svg>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: '#f0e6d6', opacity: 0.35 }}>
                      Drop cover image or <span style={{ color: '#d4a574', opacity: 0.8 }}>click to upload</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Error */}
              {error && (
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: '#e07575' }}>{error}</p>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                  className="flex-1 py-3 rounded-xl text-sm transition-all"
                  style={{
                    fontFamily: 'var(--font-body)',
                    background: 'rgba(240,230,214,0.04)',
                    border: '1px solid rgba(240,230,214,0.1)',
                    color: '#f0e6d6',
                    opacity: loading ? 0.4 : 0.7,
                  }}
                  onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.opacity = '1' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = loading ? '0.4' : '0.7' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !title.trim()}
                  className="flex-1 py-3 rounded-xl text-sm font-medium transition-all"
                  style={{
                    fontFamily: 'var(--font-body)',
                    background: loading || !title.trim() ? 'rgba(212,165,116,0.4)' : '#d4a574',
                    color: '#0a0a0a',
                    cursor: loading || !title.trim() ? 'not-allowed' : 'pointer',
                  }}
                >
                  {loading ? 'Creating…' : 'Begin Journey'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
