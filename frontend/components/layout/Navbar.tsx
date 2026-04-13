'use client'

import Link from 'next/link'
import { Sparkles, LogOut, User } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useUserStore } from '@/store/userStore'

export function Navbar() {
  const { signOut } = useAuth()
  const { user } = useUserStore()

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center px-6 sticky top-0 z-30">
      <Link href="/dashboard" className="flex items-center gap-2 font-bold text-gray-900 mr-auto">
        <Sparkles className="h-5 w-5 text-violet-600" />
        SocialCraft AI
      </Link>

      <div className="flex items-center gap-3">
        {user && (
          <span className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
            <User className="h-4 w-4" />
            {user.email}
          </span>
        )}
        <button
          onClick={signOut}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Sign out</span>
        </button>
      </div>
    </header>
  )
}
