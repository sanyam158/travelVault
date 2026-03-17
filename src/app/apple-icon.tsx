import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0a0a0a',
          borderRadius: 40,
        }}
      >
        <span
          style={{
            fontSize: 90,
            fontWeight: 700,
            color: '#d4a574',
            letterSpacing: '-0.05em',
          }}
        >
          TV
        </span>
      </div>
    ),
    { ...size }
  )
}
