import type { Metadata } from 'next'
import { Cormorant_Garamond, Outfit } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'

const cormorant = Cormorant_Garamond({
  variable: '--font-display',
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  display: 'swap',
})

const outfit = Outfit({
  variable: '--font-body',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'TravelVault',
    template: '%s | TravelVault',
  },
  description: 'Your journeys, cinematic. A beautiful travel media vault.',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  ),
  openGraph: {
    title: 'TravelVault',
    description: 'Your journeys, cinematic.',
    siteName: 'TravelVault',
    type: 'website',
  },
  manifest: '/manifest.json',
  other: {
    'theme-color': '#0a0a0a',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${cormorant.variable} ${outfit.variable} antialiased`}>
        {children}
        <Toaster
          theme="dark"
          position="bottom-left"
          toastOptions={{
            style: {
              background: '#141414',
              border: '1px solid rgba(212,165,116,0.15)',
              color: '#f0e6d6',
              fontFamily: 'var(--font-body)',
              fontSize: '0.85rem',
            },
          }}
        />
      </body>
    </html>
  )
}
