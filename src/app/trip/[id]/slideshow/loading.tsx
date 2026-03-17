export default function SlideshowLoading() {
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
        Preparing...
      </p>
      <div
        className="w-48 h-0.5 rounded-full overflow-hidden"
        style={{ background: 'rgba(240,230,214,0.08)' }}
      >
        <div
          className="h-full rounded-full animate-pulse"
          style={{ background: '#d4a574', width: '40%' }}
        />
      </div>
    </div>
  )
}
