'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<any[]>([])
  const [stats, setStats] = useState({
    avgOpenRate: 0,
    avgClickRate: 0,
    totalSent: 0,
    count: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('newsletter_analytics')
      .select('*, newsletter:newsletters(title)')
      .order('send_date', { ascending: false })

    if (data && data.length > 0) {
      setAnalytics(data)

      // Calculate stats
      const totalOpenRate = data.reduce((sum, item) => sum + (item.open_rate || 0), 0)
      const totalClickRate = data.reduce((sum, item) => sum + (item.click_rate || 0), 0)
      const totalSent = data.reduce((sum, item) => sum + (item.emails_sent || 0), 0)

      setStats({
        avgOpenRate: data.length > 0 ? totalOpenRate / data.length : 0,
        avgClickRate: data.length > 0 ? totalClickRate / data.length : 0,
        totalSent,
        count: data.length,
      })
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-12 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Analytics</h1>
          <p className="text-muted-foreground">Track performance and get AI insights</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/analytics/insights"
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg font-semibold transition-all"
          >
            🤖 AI Insights
          </Link>
          <Link
            href="/analytics/predictions"
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-semibold transition-all"
          >
            🔮 Predictions
          </Link>
          <Link
            href="/analytics/input"
            className="px-6 py-3 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg font-semibold transition-all"
          >
            📊 Add Stats
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <div className="text-sm text-muted-foreground mb-1">Avg Open Rate</div>
          <div className="text-3xl font-bold">{stats.avgOpenRate.toFixed(1)}%</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <div className="text-sm text-muted-foreground mb-1">Avg Click Rate</div>
          <div className="text-3xl font-bold">{stats.avgClickRate.toFixed(1)}%</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <div className="text-sm text-muted-foreground mb-1">Total Sent</div>
          <div className="text-3xl font-bold">{stats.totalSent.toLocaleString()}</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <div className="text-sm text-muted-foreground mb-1">Newsletters Tracked</div>
          <div className="text-3xl font-bold">{stats.count}</div>
        </div>
      </div>

      {analytics.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-12 text-center">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-2xl font-semibold mb-2">No Analytics Yet</h2>
          <p className="text-muted-foreground mb-6">
            Start adding newsletter statistics to get AI-powered insights
          </p>
          <Link
            href="/analytics/input"
            className="inline-block px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
          >
            Add First Stats
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-semibold">Recent Performance</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Newsletter
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Send Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Sent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Open Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Click Rate
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {analytics.slice(0, 10).map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium">
                        {item.newsletter?.title || `Newsletter ${item.newsletter_id.slice(0, 8)}`}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {new Date(item.send_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {item.emails_sent.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                        {item.open_rate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium">
                        {item.click_rate.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
