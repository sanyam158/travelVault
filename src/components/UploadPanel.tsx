'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { UploadItem } from './MediaUploader'

interface Props {
  uploads: UploadItem[]
  onRetry: (id: string) => void
  onClear: () => void
}

function statusText(status: UploadItem['status']): string {
  switch (status) {
    case 'pending':
      return 'Waiting…'
    case 'uploading':
      return 'Uploading…'
    case 'processing':
      return 'Processing…'
    case 'done':
      return 'Complete'
    case 'error':
      return 'Failed'
  }
}

function statusColor(status: UploadItem['status']): string {
  switch (status) {
    case 'done':
      return '#7cc47c'
    case 'error':
      return '#e07575'
    default:
      return '#f0e6d6'
  }
}

export default function UploadPanel({ uploads, onRetry, onClear }: Props) {
  const [collapsed, setCollapsed] = useState(false)

  const allDone = uploads.length > 0 && uploads.every((u) => u.status === 'done' || u.status === 'error')
  const activeCount = uploads.filter((u) => u.status !== 'done' && u.status !== 'error').length
  const doneCount = uploads.filter((u) => u.status === 'done').length

  return (
    <AnimatePresence>
      {uploads.length > 0 && (
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-0 left-0 right-0 z-[80] rounded-t-2xl"
          style={{
            background: 'rgba(16, 11, 7, 0.97)',
            borderTop: '1px solid rgba(212,165,116,0.15)',
            boxShadow: '0 -8px 40px rgba(0,0,0,0.5)',
            maxHeight: collapsed ? 56 : 320,
            transition: 'max-height 0.25s ease',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-5 py-4 cursor-pointer"
            onClick={() => setCollapsed((c) => !c)}
          >
            <div className="flex items-center gap-3">
              {!allDone && (
                <div
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ background: '#d4a574' }}
                />
              )}
              <span
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.82rem',
                  color: '#f0e6d6',
                  opacity: 0.8,
                }}
              >
                {allDone
                  ? `${doneCount} of ${uploads.length} uploaded`
                  : `Uploading ${activeCount} of ${uploads.length} files…`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {/* Collapse toggle */}
              <button
                className="w-7 h-7 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(240,230,214,0.06)', color: '#f0e6d6', opacity: 0.5 }}
              >
                <svg
                  width="10"
                  height="6"
                  viewBox="0 0 10 6"
                  fill="none"
                  style={{
                    transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s',
                  }}
                >
                  <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {/* Close button (only when all done) */}
              {allDone && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onClear()
                  }}
                  className="w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(240,230,214,0.06)', color: '#f0e6d6', opacity: 0.5 }}
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* File list */}
          {!collapsed && (
            <div className="overflow-y-auto px-5 pb-4" style={{ maxHeight: 248 }}>
              {uploads.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 py-2.5"
                  style={{ borderTop: '1px solid rgba(240,230,214,0.05)' }}
                >
                  {/* Thumbnail */}
                  <div
                    className="flex-shrink-0 w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center"
                    style={{ background: 'rgba(240,230,214,0.05)' }}
                  >
                    {item.preview ? (
                      <img
                        src={item.preview}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ opacity: 0.3 }}>
                        <path d="M4 3l8 5-8 5V3z" fill="#d4a574" />
                      </svg>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p
                      className="truncate"
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '0.78rem',
                        color: '#f0e6d6',
                        opacity: 0.7,
                      }}
                    >
                      {item.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {/* Progress bar */}
                      <div
                        className="flex-1 h-1 rounded-full overflow-hidden"
                        style={{ background: 'rgba(240,230,214,0.08)' }}
                      >
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: item.status === 'error' ? '#e07575' : '#d4a574' }}
                          initial={{ width: 0 }}
                          animate={{ width: `${item.progress}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                      {/* Status */}
                      <span
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '0.65rem',
                          color: statusColor(item.status),
                          opacity: 0.7,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {item.error || statusText(item.status)}
                      </span>
                    </div>
                  </div>

                  {/* Retry button */}
                  {item.status === 'error' && (
                    <button
                      onClick={() => onRetry(item.id)}
                      className="flex-shrink-0 px-2.5 py-1 rounded-lg text-xs transition-all"
                      style={{
                        fontFamily: 'var(--font-body)',
                        background: 'rgba(212,165,116,0.15)',
                        border: '1px solid rgba(212,165,116,0.3)',
                        color: '#d4a574',
                      }}
                    >
                      Retry
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
