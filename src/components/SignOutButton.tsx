'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function SignOutButton() {
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <button
      onClick={handleSignOut}
      className="text-xs transition-colors duration-150"
      style={{
        fontFamily: 'var(--font-body)',
        color: '#d4a574',
        opacity: 0.7,
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1' }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.7' }}
    >
      Sign out
    </button>
  )
}
