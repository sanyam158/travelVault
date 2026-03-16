import { createClient } from '@/lib/supabase/server'
import SignOutButton from './SignOutButton'
import Image from 'next/image'

export default async function AuthButton() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const avatarUrl = user.user_metadata?.avatar_url as string | undefined
  const name = (user.user_metadata?.name as string | undefined) ?? user.email ?? 'User'

  return (
    <div className="flex items-center gap-3" style={{ fontFamily: 'var(--font-body)' }}>
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          width={32}
          height={32}
          alt={name}
          className="rounded-full object-cover"
          style={{ border: '1px solid rgba(212,165,116,0.3)' }}
        />
      ) : (
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium"
          style={{ background: 'rgba(212,165,116,0.15)', border: '1px solid rgba(212,165,116,0.3)', color: '#d4a574' }}
        >
          {name.charAt(0).toUpperCase()}
        </div>
      )}
      <span className="text-sm hidden sm:block" style={{ color: '#f0e6d6', opacity: 0.7 }}>
        {name}
      </span>
      <SignOutButton />
    </div>
  )
}
