'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

export default function InsightsPage() {
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [insights, setInsights] = useState<any[]>([])
  const [analytics, setAnalytics] = useState<any[]>([])
  const [chartData, setChartData] = useState<any[]>([])

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('newsletter_analytics')
      .select('*, newsletter:newsletters(title)')
      .order('send_date', { ascending: false })
      .limit(20)

    if (data) {
      setAnalytics(data)
      // Prepare chart data
      const formattedData = data.reverse().map((item) => ({
        name: item.newsletter?.title?.substring(0, 20) || 'Newsletter',
        openRate: item.open_rate,
        clickRate: item.click_rate,
        date: new Date(item.send_date).toLocaleDateString(),
      }))
      setChartData(formattedData)
    }
    setLoading(false)
  }

  const handleGenerateInsights = async () => {
    if (analytics.length === 0) {
      toast.error('No analytics data available. Add some analytics first.')
      return
    }

    setGenerating(true)
    try {
      const res = await fetch('/api/analytics/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (res.ok) {
        const data = await res.json()
        setInsights(data.insights)
        toast.success('AI insights generated successfully!')
      } else {
        const error = await res.json()
        toast.error(`Error: ${error.error}`)
      }
    } catch (err) {
      toast.error('Failed to generate insights')
    }
    setGenerating(false)
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
    <div className="max-w-7xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">AI Performance Insights</h1>
          <p className="text-muted-foreground">
            Get AI-powered recommendations to improve your newsletter performance
          </p>
        </div>
        <button
          onClick={handleGenerateInsights}
          disabled={generating || analytics.length === 0}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-gray-400 disabled:to-gray-400 text-white rounded-lg font-semibold transition-all"
        >
          {generating ? (
            <span className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
              Analyzing...
            </span>
          ) : (
            '🤖 Generate AI Insights'
          )}
        </button>
      </div>

      {/* Performance Charts */}
      {chartData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Open Rate Trend */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Open Rate Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="openRate" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Click Rate Trend */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Click Rate Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="clickRate" stroke="#8b5cf6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Comparison Bar Chart */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold mb-4">Open vs Click Rate Comparison</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="openRate" fill="#3b82f6" />
                <Bar dataKey="clickRate" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* AI Insights */}
      {insights.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">AI-Generated Insights</h2>
          <div className="grid grid-cols-1 gap-6">
            {insights.map((insight, index) => (
              <div
                key={index}
                className={`bg-white dark:bg-slate-800 rounded-lg shadow p-6 border-l-4 ${
                  insight.insight_type === 'topic_performance'
                    ? 'border-blue-500'
                    : insight.insight_type === 'timing_optimization'
                      ? 'border-green-500'
                      : insight.insight_type === 'subject_line_analysis'
                        ? 'border-purple-500'
                        : 'border-orange-500'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">
                        {insight.insight_type === 'topic_performance'
                          ? '📊'
                          : insight.insight_type === 'timing_optimization'
                            ? '⏰'
                            : insight.insight_type === 'subject_line_analysis'
                              ? '✉️'
                              : '📈'}
                      </span>
                      <h3 className="text-lg font-semibold capitalize">
                        {insight.insight_type.replace(/_/g, ' ')}
                      </h3>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300">{insight.insight_text}</p>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm text-muted-foreground mb-1">Confidence</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {(insight.confidence_score * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>

                {/* Data Points */}
                {insight.data_points && Object.keys(insight.data_points).length > 0 && (
                  <div className="mb-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-md">
                    <div className="text-sm font-medium text-muted-foreground mb-2">
                      Supporting Data:
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.entries(insight.data_points).map(([key, value]) => (
                        <div key={key}>
                          <div className="text-xs text-muted-foreground capitalize">
                            {key.replace(/_/g, ' ')}
                          </div>
                          <div className="text-lg font-semibold">{String(value)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendation */}
                {insight.recommendation && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                    <div className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
                      💡 Recommended Action:
                    </div>
                    <div className="text-sm text-blue-900 dark:text-blue-100">
                      {insight.recommendation}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {insights.length === 0 && !generating && (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-12 text-center">
          <div className="text-6xl mb-4">🤖</div>
          <h2 className="text-2xl font-semibold mb-2">No Insights Yet</h2>
          <p className="text-muted-foreground mb-6">
            Click &ldquo;Generate AI Insights&rdquo; to get personalized recommendations based on your performance
            data
          </p>
        </div>
      )}
    </div>
  )
}
