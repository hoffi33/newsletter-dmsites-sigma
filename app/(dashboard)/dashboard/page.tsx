'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function DashboardPage() {
  const [userProfile, setUserProfile] = useState<any>(null)
  const [stats, setStats] = useState({
    newsletters: 0,
    ideas: 0,
    segments: 0,
    competitors: 0,
  })
  const [recentNewsletters, setRecentNewsletters] = useState<any[]>([])
  const [performanceData, setPerformanceData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    // Fetch user profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profile) setUserProfile(profile)

    // Fetch stats
    const { data: newsletters } = await supabase
      .from('newsletters')
      .select('id, title, created_at, status')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5)

    const { data: ideas } = await supabase
      .from('content_ideas')
      .select('id')
      .eq('user_id', user.id)

    const { data: segments } = await supabase
      .from('audience_segments')
      .select('id')
      .eq('user_id', user.id)

    const { data: competitors } = await supabase
      .from('competitors')
      .select('id')
      .eq('user_id', user.id)

    // Fetch analytics for chart
    const { data: analytics } = await supabase
      .from('newsletter_analytics')
      .select('open_rate, click_rate, send_date')
      .eq('user_id', user.id)
      .order('send_date', { ascending: true })
      .limit(10)

    setStats({
      newsletters: newsletters?.length || 0,
      ideas: ideas?.length || 0,
      segments: segments?.length || 0,
      competitors: competitors?.length || 0,
    })

    setRecentNewsletters(newsletters || [])

    if (analytics && analytics.length > 0) {
      const chartData = analytics.map((item) => ({
        date: new Date(item.send_date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        openRate: item.open_rate,
        clickRate: item.click_rate,
      }))
      setPerformanceData(chartData)
    }

    setLoading(false)
  }

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your AI Newsletter Operating System</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="text-blue-100 text-sm mb-1">Plan</div>
          <div className="text-3xl font-bold capitalize">{userProfile?.plan_tier || 'Free'}</div>
          <div className="text-blue-100 text-sm mt-2">
            {userProfile?.usage_count || 0}/{userProfile?.usage_limit || 2} newsletters
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-muted-foreground">Newsletters</div>
            <div className="text-2xl">📝</div>
          </div>
          <div className="text-3xl font-bold">{stats.newsletters}</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-muted-foreground">Ideas</div>
            <div className="text-2xl">💡</div>
          </div>
          <div className="text-3xl font-bold">{stats.ideas}</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-muted-foreground">Segments</div>
            <div className="text-2xl">🎯</div>
          </div>
          <div className="text-3xl font-bold">{stats.segments}</div>
        </div>
      </div>

      {/* Performance Chart */}
      {performanceData.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Performance Overview</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="openRate" stroke="#3b82f6" strokeWidth={2} name="Open Rate" />
              <Line type="monotone" dataKey="clickRate" stroke="#8b5cf6" strokeWidth={2} name="Click Rate" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Recent Newsletters */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Newsletters</h2>
            <Link href="/newsletters" className="text-sm text-blue-600 hover:underline">
              View all
            </Link>
          </div>
          {recentNewsletters.length > 0 ? (
            <div className="space-y-3">
              {recentNewsletters.map((newsletter) => (
                <Link
                  key={newsletter.id}
                  href={`/content-studio/edit/${newsletter.id}`}
                  className="block p-3 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <div className="font-medium">{newsletter.title || 'Untitled Newsletter'}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(newsletter.created_at).toLocaleDateString()}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <div className="text-4xl mb-2">📝</div>
              <p className="text-sm">No newsletters yet</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              href="/content-studio"
              className="block p-4 rounded-md bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 hover:from-blue-100 hover:to-cyan-100 dark:hover:from-blue-900/30 dark:hover:to-cyan-900/30 transition-colors"
            >
              <div className="flex items-center">
                <div className="text-2xl mr-3">📝</div>
                <div className="flex-1">
                  <div className="font-medium">Create Newsletter</div>
                  <div className="text-xs text-muted-foreground">Import content or start fresh</div>
                </div>
              </div>
            </Link>

            <Link
              href="/ideas/generate"
              className="block p-4 rounded-md bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 hover:from-yellow-100 hover:to-orange-100 dark:hover:from-yellow-900/30 dark:hover:to-orange-900/30 transition-colors"
            >
              <div className="flex items-center">
                <div className="text-2xl mr-3">💡</div>
                <div className="flex-1">
                  <div className="font-medium">Generate Ideas</div>
                  <div className="text-xs text-muted-foreground">52 weeks of content ideas</div>
                </div>
              </div>
            </Link>

            <Link
              href="/analytics/insights"
              className="block p-4 rounded-md bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-900/30 dark:hover:to-emerald-900/30 transition-colors"
            >
              <div className="flex items-center">
                <div className="text-2xl mr-3">🤖</div>
                <div className="flex-1">
                  <div className="font-medium">AI Insights</div>
                  <div className="text-xs text-muted-foreground">Get performance recommendations</div>
                </div>
              </div>
            </Link>

            <Link
              href="/competitors/gaps"
              className="block p-4 rounded-md bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 hover:from-red-100 hover:to-rose-100 dark:hover:from-red-900/30 dark:hover:to-rose-900/30 transition-colors"
            >
              <div className="flex items-center">
                <div className="text-2xl mr-3">💡</div>
                <div className="flex-1">
                  <div className="font-medium">Find Content Gaps</div>
                  <div className="text-xs text-muted-foreground">Discover opportunities</div>
                </div>
              </div>
            </Link>
          </div>
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
                <p className="text-sm text-muted-foreground">{module.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
