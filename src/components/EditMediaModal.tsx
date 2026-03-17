'use client'

import { useState, useId } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { updateMedia, deleteMedia } from '@/app/actions/media'
import { generateKenBurnsConfig } from '@/lib/utils/kenburns'
import type { Media, KenBurnsConfig } from '@/types'

const INPUT_STYLE = {
  background: 'rgba(240,230,214,0.05)',
  border: '1px solid rgba(240,230,214,0.12)',
  color: '#f0e6d6',
  fontFamily: 'var(--font-body)',
  borderRadius: 10,
  padding: '10px 14px',
  width: '100%',
  outline: 'none',
  fontSize: '0.88rem',
}

interface SliderProps {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (v: number) => void
}

function Slider({ label, value, min, max, step, onChange }: SliderProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.68rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#d4a574',
            opacity: 0.7,
          }}
        >
          {label}
        </label>
        <span
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.72rem',
            color: '#f0e6d6',
            opacity: 0.4,
          }}
        >
          {value.toFixed(2)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, #d4a574 ${((value - min) / (max - min)) * 100}%, rgba(240,230,214,0.1) 0%)`,
          accentColor: '#d4a574',
        }}
      />
    </div>
  )
}

interface Props {
  media: Media
  open: boolean
  onClose: () => void
}

export default function EditMediaModal({ media, open, onClose }: Props) {
  const router = useRouter()
  const instanceId = useId().replace(/:/g, '')
  const [caption, setCaption] = useState(media.caption ?? '')
  const [locationName, setLocationName] = useState(media.location_name ?? '')
  const [kb, setKb] = useState<KenBurnsConfig>(
    media.ken_burns_config ?? {
      startScale: 1.0,
      endScale: 1.1,
      startX: 0,
      startY: 0,
      endX: 0,
      endY: 1,
    }
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  // Reset state when media changes
  const resetToMedia = () => {
    setCaption(media.caption ?? '')
    setLocationName(media.location_name ?? '')
    setKb(
      media.ken_burns_config ?? {
        startScale: 1.0,
        endScale: 1.1,
        startX: 0,
        startY: 0,
        endX: 0,
        endY: 1,
      }
    )
    setError(null)
    setConfirmDelete(false)
  }

  const handleClose = () => {
    if (loading) return
    onClose()
    setTimeout(resetToMedia, 250)
  }

  const handleSave = async () => {
    setLoading(true)
    setError(null)
    try {
      await updateMedia(media.id, {
        caption: caption.trim() || null,
        location_name: locationName.trim() || null,
        ken_burns_config: kb,
      })
      toast.success('Memory updated')
      router.refresh()
      handleClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
      toast.error('Failed to save changes')
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    setLoading(true)
    setError(null)
    try {
      await deleteMedia(media.id)
      toast.success('Memory deleted')
      router.refresh()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed')
      toast.error('Failed to delete')
      setLoading(false)
    }
  }

  const kbAnimName = `kb_${instanceId}`

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
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose()
          }}
        >
          <style key={`${kbAnimName}-${kb.startScale}-${kb.endScale}-${kb.startX}-${kb.endX}-${kb.startY}-${kb.endY}`}>{`
            @keyframes ${kbAnimName} {
              from { transform: scale(${kb.startScale}) translate(${kb.startX}%, ${kb.startY}%); }
              to   { transform: scale(${kb.endScale}) translate(${kb.endX}%, ${kb.endY}%); }
            }
          `}</style>

          <motion.div
            key="panel"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-2xl rounded-2xl overflow-y-auto"
            style={{
              background: 'rgba(16, 11, 7, 0.97)',
              border: '1px solid rgba(212,165,116,0.15)',
              boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
              maxHeight: '90vh',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-7 pt-6 pb-4">
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.8rem',
                  fontWeight: 300,
                  color: '#f0e6d6',
                  letterSpacing: '-0.01em',
                }}
              >
                Edit Memory
              </h2>
              <button
                onClick={handleClose}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
                style={{ background: 'rgba(240,230,214,0.06)', color: '#f0e6d6', opacity: 0.5 }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = '1')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = '0.5')}
              >
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                  <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="px-7 pb-7 space-y-5">
              {/* Two-column: preview + form fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Left: Ken Burns preview */}
                {media.type === 'photo' && (
                  <div>
                    <label
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '0.68rem',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: '#d4a574',
                        opacity: 0.7,
                        display: 'block',
                        marginBottom: 8,
                      }}
                    >
                      Ken Burns Preview
                    </label>
                    <div
                      className="relative overflow-hidden rounded-xl"
                      style={{ aspectRatio: '16/9' }}
                    >
                      <img
                        src={media.file_url}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover"
                        style={{
                          animation: `${kbAnimName} 3s ease-in-out infinite alternate`,
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setKb(generateKenBurnsConfig())}
                      className="mt-2 w-full py-2 rounded-lg text-xs transition-all"
                      style={{
                        fontFamily: 'var(--font-body)',
                        background: 'rgba(212,165,116,0.1)',
                        border: '1px solid rgba(212,165,116,0.2)',
                        color: '#d4a574',
                      }}
                    >
                      Randomize
                    </button>
                  </div>
                )}

                {/* Right: Caption + Location */}
                <div className="space-y-4">
                  <div>
                    <label
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '0.68rem',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: '#d4a574',
                        opacity: 0.7,
                        display: 'block',
                        marginBottom: 8,
                      }}
                    >
                      Caption
                    </label>
                    <textarea
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      placeholder="Describe this moment…"
                      rows={3}
                      style={{ ...INPUT_STYLE, resize: 'vertical' }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(212,165,116,0.4)'
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(240,230,214,0.12)'
                      }}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '0.68rem',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: '#d4a574',
                        opacity: 0.7,
                        display: 'block',
                        marginBottom: 8,
                      }}
                    >
                      Location
                    </label>
                    <input
                      type="text"
                      value={locationName}
                      onChange={(e) => setLocationName(e.target.value)}
                      placeholder="e.g. Jaisalmer, Rajasthan"
                      style={INPUT_STYLE}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(212,165,116,0.4)'
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(240,230,214,0.12)'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Ken Burns sliders (only for photos) */}
              {media.type === 'photo' && (
                <div
                  className="rounded-xl p-4 space-y-3"
                  style={{
                    background: 'rgba(240,230,214,0.03)',
                    border: '1px solid rgba(240,230,214,0.07)',
                  }}
                >
                  <p
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.68rem',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: '#d4a574',
                      opacity: 0.7,
                      marginBottom: 4,
                    }}
                  >
                    Ken Burns Motion
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <Slider
                      label="Start Scale"
                      value={kb.startScale}
                      min={1.0}
                      max={1.3}
                      step={0.01}
                      onChange={(v) => setKb((k) => ({ ...k, startScale: v }))}
                    />
                    <Slider
                      label="End Scale"
                      value={kb.endScale}
                      min={1.0}
                      max={1.3}
                      step={0.01}
                      onChange={(v) => setKb((k) => ({ ...k, endScale: v }))}
                    />
                    <Slider
                      label="Start X"
                      value={kb.startX}
                      min={-5}
                      max={5}
                      step={0.5}
                      onChange={(v) => setKb((k) => ({ ...k, startX: v }))}
                    />
                    <Slider
                      label="End X"
                      value={kb.endX}
                      min={-5}
                      max={5}
                      step={0.5}
                      onChange={(v) => setKb((k) => ({ ...k, endX: v }))}
                    />
                    <Slider
                      label="Start Y"
                      value={kb.startY}
                      min={-5}
                      max={5}
                      step={0.5}
                      onChange={(v) => setKb((k) => ({ ...k, startY: v }))}
                    />
                    <Slider
                      label="End Y"
                      value={kb.endY}
                      min={-5}
                      max={5}
                      step={0.5}
                      onChange={(v) => setKb((k) => ({ ...k, endY: v }))}
                    />
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: '#e07575' }}>
                  {error}
                </p>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3">
                {!confirmDelete ? (
                  <>
                    <button
                      onClick={() => setConfirmDelete(true)}
                      disabled={loading}
                      className="px-4 py-2.5 rounded-xl text-sm transition-all"
                      style={{
                        fontFamily: 'var(--font-body)',
                        background: 'rgba(224,117,117,0.08)',
                        border: '1px solid rgba(224,117,117,0.2)',
                        color: '#e07575',
                        opacity: loading ? 0.4 : 0.8,
                      }}
                    >
                      Delete
                    </button>
                    <div className="flex-1" />
                    <button
                      onClick={handleClose}
                      disabled={loading}
                      className="px-5 py-2.5 rounded-xl text-sm transition-all"
                      style={{
                        fontFamily: 'var(--font-body)',
                        background: 'rgba(240,230,214,0.04)',
                        border: '1px solid rgba(240,230,214,0.1)',
                        color: '#f0e6d6',
                        opacity: loading ? 0.4 : 0.6,
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
                      style={{
                        fontFamily: 'var(--font-body)',
                        background: loading ? 'rgba(212,165,116,0.4)' : '#d4a574',
                        color: '#0a0a0a',
                        cursor: loading ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {loading ? 'Saving…' : 'Save'}
                    </button>
                  </>
                ) : (
                  <>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: '#f0e6d6', opacity: 0.6 }}>
                      This cannot be undone.
                    </p>
                    <div className="flex-1" />
                    <button
                      onClick={() => setConfirmDelete(false)}
                      className="px-4 py-2.5 rounded-xl text-sm transition-all"
                      style={{
                        fontFamily: 'var(--font-body)',
                        background: 'rgba(240,230,214,0.04)',
                        border: '1px solid rgba(240,230,214,0.1)',
                        color: '#f0e6d6',
                        opacity: 0.6,
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={loading}
                      className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
                      style={{
                        fontFamily: 'var(--font-body)',
                        background: loading ? 'rgba(224,117,117,0.3)' : 'rgba(224,117,117,0.85)',
                        color: '#fff',
                        cursor: loading ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {loading ? 'Deleting…' : 'Confirm Delete'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
