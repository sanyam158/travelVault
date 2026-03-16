import LoginForm from './LoginForm'

export default function LoginPage() {
  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0a0a0a]">
      {/* Background gradient overlay */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background:
            'radial-gradient(ellipse at 60% 40%, #3d2a1a 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, #1a2a3d 0%, transparent 50%)',
        }}
      />

      {/* Subtle noise texture */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: '256px 256px',
        }}
      />

      {/* Login card */}
      <div className="relative z-10 w-full max-w-sm mx-4">
        <div
          className="rounded-2xl p-8 md:p-10"
          style={{
            background: 'rgba(20, 14, 10, 0.85)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(212, 165, 116, 0.15)',
            boxShadow: '0 32px 64px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(212, 165, 116, 0.1)',
          }}
        >
          {/* Logo / Brand */}
          <div className="mb-8 text-center">
            <div className="mb-2 flex justify-center">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M16 2L20 10H28L22 15.5L24.5 24L16 19L7.5 24L10 15.5L4 10H12L16 2Z"
                  fill="#d4a574"
                  fillOpacity="0.9"
                />
              </svg>
            </div>
            <h1
              className="text-4xl font-light tracking-wide"
              style={{ fontFamily: 'var(--font-display)', color: '#d4a574' }}
            >
              TravelVault
            </h1>
            <p
              className="mt-2 text-sm tracking-widest uppercase"
              style={{ fontFamily: 'var(--font-body)', color: '#f0e6d6', opacity: 0.45, letterSpacing: '0.2em' }}
            >
              Your journeys, cinematic.
            </p>
          </div>

          <LoginForm />
        </div>

        <p
          className="mt-6 text-center text-xs"
          style={{ fontFamily: 'var(--font-body)', color: '#f0e6d6', opacity: 0.25 }}
        >
          By signing in, you agree to our Terms and Privacy Policy.
        </p>
      </div>
    </main>
  )
}
