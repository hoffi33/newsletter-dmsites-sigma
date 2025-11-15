'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function GenerateIdeasPage() {
  const router = useRouter()
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    niche: '',
    audience: '',
    goals: '',
    frequency: 'weekly',
  })

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    setGenerating(true)
    setError(null)

    try {
      const res = await fetch('/api/ideas/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Generation failed')

      router.push('/ideas')
    } catch (err: any) {
      setError(err.message)
      setGenerating(false)
    }
  }

  if (generating) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-12 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <h2 className="text-2xl font-semibold mb-2">Generating 52 Week Ideas...</h2>
          <p className="text-muted-foreground">
            AI is creating a full year of newsletter ideas. This may take 2-3 minutes.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Generate 52 Week Ideas</h1>
        <p className="text-muted-foreground">
          Tell us about your newsletter and we'll generate a full year of content ideas
        </p>
      </div>

      <form onSubmit={handleGenerate} className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 space-y-6">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-md">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-2">
            Your Niche <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.niche}
            onChange={(e) => setFormData({ ...formData, niche: e.target.value })}
            placeholder="e.g., AI & Technology, Marketing, Personal Finance"
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Target Audience <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.audience}
            onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
            placeholder="e.g., SaaS founders, Marketing managers, Developers"
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Newsletter Goals <span className="text-red-500">*</span>
          </label>
          <textarea
            required
            value={formData.goals}
            onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
            placeholder="What do you want to achieve? E.g., Educate, build authority, drive conversions..."
            rows={4}
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Publishing Frequency</label>
          <select
            value={formData.frequency}
            onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700"
          >
            <option value="weekly">Weekly</option>
            <option value="biweekly">Bi-weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={generating}
          className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 disabled:from-yellow-400 disabled:to-orange-400 text-white py-4 px-6 rounded-lg font-semibold text-lg transition-colors"
        >
          {generating ? 'Generating...' : '💡 Generate 52 Week Ideas'}
        </button>
      </form>
    </div>
  )
}
