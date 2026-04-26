'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Sparkles, History, CalendarClock, BarChart3, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const links = [
  { href: '/dashboard',           icon: Sparkles,     label: 'Generate' },
  { href: '/dashboard/history',   icon: History,      label: 'History' },
  { href: '/dashboard/scheduler', icon: CalendarClock, label: 'Scheduler' },
  { href: '/dashboard/analytics',  icon: BarChart3,     label: 'Analytics' },
  { href: '/dashboard/settings',   icon: Settings,      label: 'Settings' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex flex-col w-56 min-h-[calc(100vh-3.5rem)] bg-white border-r border-gray-200 py-6 px-3 sticky top-14">
      <nav className="space-y-1">
        {links.map(({ href, icon: Icon, label }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-violet-50 text-violet-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
