'use client'

import { useState, useEffect, useCallback, useRef, memo } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import type { Trip, Media, KenBurnsConfig } from '@/types'

type Phase = 'intro' | 'loading' | 'playing' | 'outro'

const DEFAULT_KB: KenBurnsConfig = {
  startScale: 1.0,
  endScale: 1.1,
  startX: 0,
  startY: 0,
  endX: 0,
  endY: 1,
}

const SLIDE_DURATION = 6000
const CROSSFADE_DURATION = 1.8
const CONTROLS_HIDE_DELAY = 3000

function formatDateRange(
  start: string | null,
  end: string | null
): string | null {
  if (!start) return null
  const fmt = (d: string) =>
    new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    })
  if (!end || start === end) return fmt(start)
  return `${fmt(start)} — ${fmt(end)}`
}

/* ─── Ken Burns Slide ──────────────────────────────────────── */

function KenBurnsSlide({
  media,
  isActive,
}: {
  media: Media
  isActive: boolean
}) {
  const [animated, setAnimated] = useState(false)
  const kb = media.ken_burns_config ?? DEFAULT_KB

  useEffect(() => {
    if (isActive) {
      // Trigger end-state on next frame
      requestAnimationFrame(() => setAnimated(true))
    }
    return () => setAnimated(false)
  }, [isActive])

  if (media.type === 'video') {
    return (
      <video
        src={media.file_url}
        autoPlay
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      />
    )
  }

  return (
    <div className="absolute inset-0 overflow-hidden">
      <img
        src={media.file_url}
        alt={media.caption || ''}
        className="absolute inset-0 w-full h-full object-cover will-change-transform"
        style={{
          transform: animated
            ? `scale(${kb.endScale}) translate(${kb.endX}%, ${kb.endY}%)`
            : `scale(${kb.startScale}) translate(${kb.startX}%, ${kb.startY}%)`,
          transition: `transform ${SLIDE_DURATION / 1000}s ease-in-out`,
        }}
      />
    </div>
  )
}

/* ─── Film Grain ───────────────────────────────────────────── */

const FilmGrain = memo(function FilmGrain() {
  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{
        zIndex: 45,
        opacity: 0.035,
        mixBlendMode: 'overlay',
        contain: 'strict',
      }}
    >
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <filter id="grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.7"
            numOctaves="2"
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
    </div>
  )
})

/* ─── Main Component ───────────────────────────────────────── */

interface Props {
  trip: Trip
  media: Media[]
}

export default function SlideshowClient({ trip, media }: Props) {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>(
    media.length === 0 ? 'outro' : 'intro'
  )
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [showControls, setShowControls] = useState(true)
  const [loadProgress, setLoadProgress] = useState(0)
  const controlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)

  const dateRange = formatDateRange(trip.start_date, trip.end_date)

  // ─── Navigation ────────────────────────────────────────────
  const goToNext = useCallback(() => {
    if (currentIndex < media.length - 1) {
      setCurrentIndex((i) => i + 1)
    } else {
      setPhase('outro')
    }
  }, [currentIndex, media.length])

  const goToPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1)
    }
  }, [currentIndex])

  const replay = useCallback(() => {
    setCurrentIndex(0)
    setIsPlaying(true)
    setPhase('playing')
  }, [])

  // ─── Preload images (progressive: first few then background) ─
  const preloadImages = useCallback(async () => {
    setPhase('loading')
    const imageMedia = media.filter((m) => m.type === 'photo')
    if (imageMedia.length === 0) {
      setPhase('playing')
      return
    }

    const loadImage = (url: string) =>
      new Promise<void>((resolve) => {
        const img = new window.Image()
        img.onload = img.onerror = () => resolve()
        img.src = url
      })

    // Load first 3 images before starting playback
    const initialBatch = imageMedia.slice(0, 3)
    let loaded = 0
    const total = initialBatch.length
    await Promise.all(
      initialBatch.map((m) =>
        loadImage(m.file_url).then(() => {
          loaded++
          setLoadProgress(Math.round((loaded / total) * 100))
        })
      )
    )
    setPhase('playing')

    // Preload remaining images in background (non-blocking)
    const remaining = imageMedia.slice(3)
    remaining.forEach((m) => loadImage(m.file_url))
  }, [media])

  // ─── Auto-advance ──────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'playing' || !isPlaying) return
    const timer = setTimeout(() => {
      goToNext()
    }, SLIDE_DURATION)
    return () => clearTimeout(timer)
  }, [currentIndex, isPlaying, phase, goToNext])

  // ─── Controls auto-hide (throttled mousemove) ──────────────
  useEffect(() => {
    if (phase !== 'playing') return

    let lastMove = 0
    const handleMove = () => {
      const now = Date.now()
      if (now - lastMove < 150) return // throttle to ~7fps
      lastMove = now
      setShowControls(true)
      if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current)
      controlsTimerRef.current = setTimeout(
        () => setShowControls(false),
        CONTROLS_HIDE_DELAY
      )
    }

    window.addEventListener('mousemove', handleMove, { passive: true })
    // Start the hide timer
    controlsTimerRef.current = setTimeout(
      () => setShowControls(false),
      CONTROLS_HIDE_DELAY
    )

    return () => {
      window.removeEventListener('mousemove', handleMove)
      if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current)
    }
  }, [phase])

  // ─── Fullscreen ────────────────────────────────────────────
  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      document.documentElement.requestFullscreen()
    }
  }, [])

  // ─── Keyboard ──────────────────────────────────────────────
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (phase === 'intro' && e.key === 'Enter') {
        preloadImages()
        return
      }
      if (phase === 'outro' && e.key === 'Enter') {
        replay()
        return
      }
      if (phase !== 'playing') return
      switch (e.key) {
        case ' ':
          e.preventDefault()
          setIsPlaying((p) => !p)
          break
        case 'ArrowLeft':
          goToPrev()
          break
        case 'ArrowRight':
          goToNext()
          break
        case 'f':
        case 'F':
          toggleFullscreen()
          break
        case 'Escape':
          if (document.fullscreenElement) {
            document.exitFullscreen()
          } else {
            router.push(`/trip/${trip.id}`)
          }
          break
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [phase, goToNext, goToPrev, toggleFullscreen, preloadImages, replay, router, trip.id])

  // Touch swipe handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    }
  }, [])

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStartRef.current) return
      const dx = e.changedTouches[0].clientX - touchStartRef.current.x
      const dy = e.changedTouches[0].clientY - touchStartRef.current.y
      touchStartRef.current = null
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) goToNext()
        else goToPrev()
        setShowControls(true)
        if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current)
        controlsTimerRef.current = setTimeout(
          () => setShowControls(false),
          CONTROLS_HIDE_DELAY
        )
      }
    },
    [goToNext, goToPrev]
  )

  const currentMedia = media[currentIndex] ?? null
  const nextMediaUrl =
    phase === 'playing' && currentIndex < media.length - 1
      ? media[currentIndex + 1].file_url
      : null

  // ─── Empty state ───────────────────────────────────────────
  if (media.length === 0) {
    return (
      <div
        className="fixed inset-0 flex flex-col items-center justify-center"
        style={{ background: '#0a0a0a' }}
      >
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2.5rem',
            fontWeight: 300,
            color: '#f0e6d6',
            opacity: 0.5,
            marginBottom: 16,
          }}
        >
          No memories yet.
        </h2>
        <button
          onClick={() => router.push(`/trip/${trip.id}`)}
          className="px-6 py-3 rounded-full text-sm transition-all"
          style={{
            fontFamily: 'var(--font-body)',
            background: 'rgba(212,165,116,0.15)',
            border: '1px solid rgba(212,165,116,0.3)',
            color: '#d4a574',
          }}
        >
          Back to trip
        </button>
      </div>
    )
  }

  // ─── Intro screen ─────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <div
        className="fixed inset-0 flex flex-col items-center justify-center"
        style={{ background: '#0a0a0a' }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="text-center px-8"
        >
          {dateRange && (
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.72rem',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: '#d4a574',
                opacity: 0.7,
                marginBottom: 20,
              }}
            >
              {dateRange}
            </p>
          )}
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(3rem, 8vw, 6rem)',
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
                fontSize: '1.1rem',
                color: '#f0e6d6',
                opacity: 0.35,
                marginTop: 14,
              }}
            >
              {trip.subtitle}
            </p>
          )}
          <button
            onClick={preloadImages}
            className="mt-12 px-8 py-3.5 rounded-full text-sm font-medium transition-all duration-200"
            style={{
              fontFamily: 'var(--font-body)',
              background: '#d4a574',
              color: '#0a0a0a',
              boxShadow: '0 4px 24px rgba(212,165,116,0.3)',
            }}
            onMouseEnter={(e) => {
              ;(e.currentTarget as HTMLButtonElement).style.background =
                '#e0b98a'
            }}
            onMouseLeave={(e) => {
              ;(e.currentTarget as HTMLButtonElement).style.background =
                '#d4a574'
            }}
          >
            Begin Journey
          </button>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.7rem',
              color: '#f0e6d6',
              opacity: 0.2,
              marginTop: 20,
            }}
          >
            {media.length} {media.length === 1 ? 'memory' : 'memories'}
          </p>
        </motion.div>
      </div>
    )
  }

  // ─── Loading screen ────────────────────────────────────────
  if (phase === 'loading') {
    return (
      <div
        className="fixed inset-0 flex flex-col items-center justify-center"
        style={{ background: '#0a0a0a' }}
      >
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.8rem',
            color: '#f0e6d6',
            opacity: 0.4,
            marginBottom: 24,
          }}
        >
          Preparing your journey…
        </p>
        <div
          className="w-48 h-0.5 rounded-full overflow-hidden"
          style={{ background: 'rgba(240,230,214,0.08)' }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ background: '#d4a574' }}
            initial={{ width: '0%' }}
            animate={{ width: `${loadProgress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.7rem',
            color: '#f0e6d6',
            opacity: 0.2,
            marginTop: 12,
          }}
        >
          {loadProgress}%
        </p>
      </div>
    )
  }

  // ─── Outro screen ─────────────────────────────────────────
  if (phase === 'outro') {
    return (
      <div
        className="fixed inset-0 flex flex-col items-center justify-center"
        style={{ background: '#0a0a0a' }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="text-center px-8"
        >
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.5rem, 6vw, 5rem)',
              fontWeight: 300,
              color: '#f0e6d6',
              lineHeight: 1,
              letterSpacing: '-0.02em',
              fontStyle: 'italic',
            }}
          >
            Until next time
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.9rem',
              color: '#d4a574',
              opacity: 0.6,
              marginTop: 16,
            }}
          >
            {trip.title}
          </p>
          <div className="flex items-center gap-4 mt-12 justify-center">
            <button
              onClick={replay}
              className="px-6 py-3 rounded-full text-sm font-medium transition-all"
              style={{
                fontFamily: 'var(--font-body)',
                background: '#d4a574',
                color: '#0a0a0a',
              }}
              onMouseEnter={(e) => {
                ;(e.currentTarget as HTMLButtonElement).style.background =
                  '#e0b98a'
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLButtonElement).style.background =
                  '#d4a574'
              }}
            >
              Replay
            </button>
            <button
              onClick={() => router.push(`/trip/${trip.id}`)}
              className="px-6 py-3 rounded-full text-sm transition-all"
              style={{
                fontFamily: 'var(--font-body)',
                background: 'rgba(240,230,214,0.06)',
                border: '1px solid rgba(240,230,214,0.12)',
                color: '#f0e6d6',
                opacity: 0.7,
              }}
            >
              Back to trip
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  // ─── Playing state ─────────────────────────────────────────
  return (
    <div
      className="fixed inset-0"
      style={{
        background: '#000',
        cursor: showControls ? 'default' : 'none',
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slides with crossfade */}
      <AnimatePresence mode="sync">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: CROSSFADE_DURATION }}
          className="absolute inset-0"
        >
          <KenBurnsSlide media={media[currentIndex]} isActive />
        </motion.div>
      </AnimatePresence>

      {/* Preload next slide */}
      {nextMediaUrl && (
        <link rel="preload" as="image" href={nextMediaUrl} />
      )}

      {/* Vignette */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 40,
          background:
            'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.7) 100%)',
        }}
      />

      {/* Film grain */}
      <FilmGrain />

      {/* Letterbox bars */}
      <div
        className="fixed top-0 left-0 right-0 h-[4vh] sm:h-[8vh]"
        style={{ background: '#000', zIndex: 50 }}
      />
      <div
        className="fixed bottom-0 left-0 right-0 h-[4vh] sm:h-[8vh]"
        style={{ background: '#000', zIndex: 50 }}
      />

      {/* ─── Controls overlay ─────────────────────────── */}
      <div
        className="fixed inset-0"
        style={{
          zIndex: 55,
          pointerEvents: 'none',
          opacity: showControls ? 1 : 0,
          transition: 'opacity 0.4s',
        }}
      >
        {/* Back button (top-left, inside letterbox) */}
        <button
          onClick={() => router.push(`/trip/${trip.id}`)}
          className="absolute flex items-center justify-center w-12 h-12 sm:w-10 sm:h-10 rounded-full transition-all top-[calc(4vh+12px)] sm:top-[calc(8vh+16px)] left-4 sm:left-6"
          style={{
            pointerEvents: showControls ? 'auto' : 'none',
            background: 'rgba(0,0,0,0.4)',
            border: '1px solid rgba(240,230,214,0.15)',
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
        </button>

        {/* Fullscreen button (top-right, inside letterbox) */}
        <button
          onClick={toggleFullscreen}
          className="absolute flex items-center justify-center w-12 h-12 sm:w-10 sm:h-10 rounded-full transition-all top-[calc(4vh+12px)] sm:top-[calc(8vh+16px)] right-4 sm:right-6"
          style={{
            pointerEvents: showControls ? 'auto' : 'none',
            background: 'rgba(0,0,0,0.4)',
            border: '1px solid rgba(240,230,214,0.15)',
            color: '#f0e6d6',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M1 5V1h4M9 1h4v4M13 9v4H9M5 13H1V9"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Center play/pause */}
        <button
          onClick={() => setIsPlaying((p) => !p)}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-20 h-20 sm:w-16 sm:h-16 rounded-full transition-all"
          style={{
            pointerEvents: showControls ? 'auto' : 'none',
            background: 'rgba(0,0,0,0.35)',
            border: '1px solid rgba(240,230,214,0.2)',
            color: '#f0e6d6',
            opacity: !isPlaying ? 1 : 0.6,
          }}
        >
          {isPlaying ? (
            <svg width="18" height="20" viewBox="0 0 18 20" fill="none">
              <rect
                x="2"
                y="1"
                width="4"
                height="18"
                rx="1"
                fill="currentColor"
              />
              <rect
                x="12"
                y="1"
                width="4"
                height="18"
                rx="1"
                fill="currentColor"
              />
            </svg>
          ) : (
            <svg width="18" height="20" viewBox="0 0 18 20" fill="none">
              <path d="M3 1.5l14 8.5-14 8.5V1.5z" fill="currentColor" />
            </svg>
          )}
        </button>

        {/* Left arrow */}
        {currentIndex > 0 && (
          <button
            onClick={goToPrev}
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 flex items-center justify-center w-12 h-12 sm:w-10 sm:h-10 rounded-full transition-all"
            style={{
              pointerEvents: showControls ? 'auto' : 'none',
              background: 'rgba(0,0,0,0.35)',
              border: '1px solid rgba(240,230,214,0.15)',
              color: '#f0e6d6',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M9 2L4 7l5 5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}

        {/* Right arrow */}
        {currentIndex < media.length - 1 && (
          <button
            onClick={goToNext}
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 flex items-center justify-center w-12 h-12 sm:w-10 sm:h-10 rounded-full transition-all"
            style={{
              pointerEvents: showControls ? 'auto' : 'none',
              background: 'rgba(0,0,0,0.35)',
              border: '1px solid rgba(240,230,214,0.15)',
              color: '#f0e6d6',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M5 2l5 5-5 5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
      </div>

      {/* ─── Bottom info (above letterbox) ─────────────── */}
      <div
        className="fixed left-0 right-0 flex items-end justify-between px-4 sm:px-8"
        style={{
          bottom: 'calc(4vh + 12px)',
          zIndex: 55,
          opacity: showControls ? 1 : 0,
          transition: 'opacity 0.4s',
          pointerEvents: 'none',
        }}
      >
        {/* Location + caption */}
        <div style={{ maxWidth: '60%' }}>
          {currentMedia?.location_name && (
            <div className="flex items-center gap-1.5 mb-1">
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                style={{ opacity: 0.6 }}
              >
                <path
                  d="M6 1C4.07 1 2.5 2.57 2.5 4.5 2.5 7.25 6 11 6 11s3.5-3.75 3.5-6.5C9.5 2.57 7.93 1 6 1zm0 4.75a1.25 1.25 0 110-2.5 1.25 1.25 0 010 2.5z"
                  fill="#d4a574"
                />
              </svg>
              <span
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.72rem',
                  color: '#d4a574',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                {currentMedia.location_name}
              </span>
            </div>
          )}
          {currentMedia?.caption && (
            <p
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.3rem',
                fontWeight: 400,
                color: '#f0e6d6',
                lineHeight: 1.3,
                textShadow: '0 2px 8px rgba(0,0,0,0.6)',
              }}
            >
              {currentMedia.caption}
            </p>
          )}
        </div>

        {/* Slide counter */}
        <span
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.75rem',
            color: '#f0e6d6',
            opacity: 0.4,
            letterSpacing: '0.05em',
          }}
        >
          {currentIndex + 1} / {media.length}
        </span>
      </div>

      {/* ─── Segmented progress bar (inside bottom letterbox) */}
      <div
        className="fixed left-0 right-0 flex gap-1 px-4 sm:px-8"
        style={{ bottom: '1.5vh', zIndex: 55 }}
      >
        {media.map((_, i) => (
          <div
            key={i}
            className="flex-1 h-0.5 rounded-full overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.15)' }}
          >
            {i < currentIndex && (
              <div
                className="h-full w-full"
                style={{ background: '#d4a574' }}
              />
            )}
            {i === currentIndex && isPlaying && (
              <motion.div
                className="h-full"
                style={{ background: '#d4a574' }}
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: SLIDE_DURATION / 1000, ease: 'linear' }}
                key={`seg-${currentIndex}`}
              />
            )}
            {i === currentIndex && !isPlaying && (
              <div
                className="h-full"
                style={{ background: '#d4a574', width: '50%' }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
