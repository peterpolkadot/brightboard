'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

const BUILT_IN_ADMINS = ['peterpolkadot@gmail.com']

interface NavProps {
  user?: { email?: string } | null
  isAdmin?: boolean
}

export function Nav({ user, isAdmin }: NavProps) {
  const router = useRouter()
  const showAdmin = isAdmin ?? BUILT_IN_ADMINS.includes(user?.email?.toLowerCase() ?? '')

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-amber-100 bg-amber-50/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href={user ? '/dashboard' : '/'} className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-400 shadow-md">
              <span className="text-lg">✨</span>
            </div>
            <span className="text-xl font-black text-stone-800">Brightboard</span>
          </Link>

          <nav className="flex items-center gap-3">
            {user ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">Dashboard</Button>
                </Link>
                {showAdmin && (
                  <Link href="/admin">
                    <Button variant="ghost" size="sm">🔒 Admin</Button>
                  </Link>
                )}
                <Link href="/create">
                  <Button size="sm">+ New Resource</Button>
                </Link>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">Sign in</Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm">Get started free</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
