'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AddCompetitorPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    website: '',
    industry: '',
  })

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    await supabase.from('competitors').insert({
      user_id: user.id,
      name: formData.name,
      email: formData.email,
      website: formData.website,
      industry: formData.industry,
    })

    router.push('/competitors')
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Add Competitor</h1>
        <p className="text-muted-foreground">Add a competitor to monitor their newsletters</p>
      </div>

      <form onSubmit={handleSave} className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Competitor Name *</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Competitor Inc."
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Newsletter Email *</label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="newsletter@competitor.com"
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Subscribe to their newsletter manually, then forward emails to us for analysis
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Website</label>
          <input
            type="url"
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            placeholder="https://competitor.com"
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Industry</label>
          <input
            type="text"
            value={formData.industry}
            onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
            placeholder="SaaS, Marketing, etc."
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white py-3 px-6 rounded-md font-medium transition-colors"
        >
          {saving ? 'Adding...' : 'Add Competitor'}
        </button>
      </form>
    </div>
  )
}
