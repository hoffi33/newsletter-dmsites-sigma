import { getUserProfile } from '@/lib/supabase/auth'
import Link from 'next/link'

export default async function DashboardPage() {
  const userProfile = await getUserProfile()

  const modules = [
    {
      name: 'Content Studio',
      icon: '📝',
      description: 'Import content and generate newsletters',
      href: '/content-studio',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      name: 'Ideas & Calendar',
      icon: '💡',
      description: '52 weeks of content ideas',
      href: '/ideas',
      color: 'from-yellow-500 to-orange-500',
    },
    {
      name: 'Personalization',
      icon: '🎯',
      description: 'Create variants for different segments',
      href: '/personalization',
      color: 'from-purple-500 to-pink-500',
    },
    {
      name: 'Analytics',
      icon: '📊',
      description: 'Performance insights & predictions',
      href: '/analytics',
      color: 'from-green-500 to-emerald-500',
    },
    {
      name: 'Competitors',
      icon: '🔍',
      description: 'Monitor competition & find gaps',
      href: '/competitors',
      color: 'from-red-500 to-rose-500',
    },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your AI Newsletter Operating System
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <div className="text-sm text-muted-foreground mb-1">Plan</div>
          <div className="text-2xl font-bold capitalize">{userProfile?.plan_tier || 'Free'}</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <div className="text-sm text-muted-foreground mb-1">Usage This Month</div>
          <div className="text-2xl font-bold">
            {userProfile?.usage_count || 0}/{userProfile?.usage_limit || 2}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <div className="text-sm text-muted-foreground mb-1">Newsletters</div>
          <div className="text-2xl font-bold">0</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <div className="text-sm text-muted-foreground mb-1">Ideas Generated</div>
          <div className="text-2xl font-bold">0</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            href="/content-studio"
            className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow border-2 border-transparent hover:border-blue-500"
          >
            <div className="text-3xl mb-3">📝</div>
            <h3 className="font-semibold mb-2">Import Content</h3>
            <p className="text-sm text-muted-foreground">
              Turn YouTube, podcasts, or blogs into newsletters
            </p>
          </Link>

          <Link
            href="/ideas/generate"
            className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow border-2 border-transparent hover:border-yellow-500"
          >
            <div className="text-3xl mb-3">💡</div>
            <h3 className="font-semibold mb-2">Generate Ideas</h3>
            <p className="text-sm text-muted-foreground">
              Get 52 weeks of content ideas instantly
            </p>
          </Link>

          <Link
            href="/analytics/input"
            className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow border-2 border-transparent hover:border-green-500"
          >
            <div className="text-3xl mb-3">📊</div>
            <h3 className="font-semibold mb-2">Add Analytics</h3>
            <p className="text-sm text-muted-foreground">
              Input newsletter stats for AI insights
            </p>
          </Link>
        </div>
      </div>

      {/* All Modules */}
      <div>
        <h2 className="text-xl font-semibold mb-4">All Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module) => (
            <Link
              key={module.name}
              href={module.href}
              className="group bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden hover:shadow-xl transition-all"
            >
              <div className={`h-2 bg-gradient-to-r ${module.color}`} />
              <div className="p-6">
                <div className="text-4xl mb-3">{module.icon}</div>
                <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-600 transition-colors">
                  {module.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {module.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
