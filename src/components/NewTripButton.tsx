'use client'

interface Props {
  onClick: () => void
}

export default function NewTripButton({ onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-8 right-8 z-50 flex items-center gap-2 px-5 py-3.5 rounded-full text-sm font-medium transition-all duration-200"
      style={{
        fontFamily: 'var(--font-body)',
        background: '#d4a574',
        color: '#0a0a0a',
        boxShadow: '0 8px 32px rgba(212,165,116,0.35)',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLButtonElement
        el.style.background = '#e0b98a'
        el.style.transform = 'scale(1.04)'
        el.style.boxShadow = '0 12px 40px rgba(212,165,116,0.45)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLButtonElement
        el.style.background = '#d4a574'
        el.style.transform = 'scale(1)'
        el.style.boxShadow = '0 8px 32px rgba(212,165,116,0.35)'
      }}
    >
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
        <path d="M6.5 1v11M1 6.5h11" stroke="#0a0a0a" strokeWidth="2" strokeLinecap="round" />
      </svg>
      New Trip
    </button>
  )
}
