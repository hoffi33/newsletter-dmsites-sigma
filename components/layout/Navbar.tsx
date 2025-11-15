'use client'

import { logout } from '@/app/actions/auth'
import { UserProfile } from '@/types'
import { useState } from 'react'

export function Navbar({ user }: { user: UserProfile | null }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
  }

  if (!user) return null

  return (
    <nav className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">
            Welcome back, {user.full_name || 'User'}!
          </h2>
          <p className="text-sm text-muted-foreground">
            Plan: <span className="font-medium capitalize">{user.plan_tier}</span> •{' '}
            Usage: {user.usage_count}/{user.usage_limit}
          </p>
        </div>

        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <div className="text-right">
              <div className="text-sm font-medium">{user.full_name || user.email}</div>
              <div className="text-xs text-muted-foreground">{user.email}</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
              {(user.full_name || user.email).charAt(0).toUpperCase()}
            </div>
          </button>

          {isMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsMenuOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-2 z-20">
                <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-700">
                  <div className="text-sm font-medium">{user.full_name}</div>
                  <div className="text-xs text-muted-foreground">{user.email}</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
