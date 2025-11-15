'use client'

import Link from 'next/link'

export default function AnalyticsPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Analytics</h1>
          <p className="text-muted-foreground">Track performance and get AI insights</p>
        </div>
        <Link
          href="/analytics/input"
          className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg font-semibold transition-all"
        >
          📊 Add Stats
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <div className="text-sm text-muted-foreground mb-1">Avg Open Rate</div>
          <div className="text-3xl font-bold">-%</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <div className="text-sm text-muted-foreground mb-1">Avg Click Rate</div>
          <div className="text-3xl font-bold">-%</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <div className="text-sm text-muted-foreground mb-1">Total Sent</div>
          <div className="text-3xl font-bold">0</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <div className="text-sm text-muted-foreground mb-1">Newsletters Tracked</div>
          <div className="text-3xl font-bold">0</div>
        </div>
      </div>

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
    </div>
  )
}
