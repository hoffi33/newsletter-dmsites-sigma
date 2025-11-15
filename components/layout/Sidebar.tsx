'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: '📊',
  },
  {
    name: 'Content Studio',
    href: '/content-studio',
    icon: '📝',
    description: 'Import & generate newsletters',
  },
  {
    name: 'Ideas & Calendar',
    href: '/ideas',
    icon: '💡',
    description: 'Content ideas & planning',
  },
  {
    name: 'Personalization',
    href: '/personalization',
    icon: '🎯',
    description: 'Segment & variants',
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: '📈',
    description: 'Performance insights',
  },
  {
    name: 'Competitors',
    href: '/competitors',
    icon: '🔍',
    description: 'Competitor intelligence',
  },
  {
    name: 'Newsletters',
    href: '/newsletters',
    icon: '📰',
    description: 'All newsletters',
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: '⚙️',
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex w-64 min-h-screen bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex-col">
      <div className="p-6">
        <Link href="/dashboard">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            NewsletterAI
          </h1>
        </Link>
        <p className="text-xs text-muted-foreground mt-1">
          AI Newsletter Operating System
        </p>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-start gap-3 px-3 py-2.5 rounded-lg transition-colors group',
                isActive
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'
              )}
            >
              <span className="text-xl mt-0.5">{item.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{item.name}</div>
                {item.description && (
                  <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                    {item.description}
                  </div>
                )}
              </div>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-slate-200 dark:border-slate-700">
        <div className="text-xs text-muted-foreground">
          © 2024 NewsletterAI
        </div>
      </div>
    </aside>
  )
}
