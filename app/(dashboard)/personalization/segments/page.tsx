'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SegmentsPage() {
  const router = useRouter()
  const [creating, setCreating] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    interests: '',
    behavior: '',
    size_estimate: '',
  })

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    await supabase.from('audience_segments').insert({
      user_id: user.id,
      name: formData.name,
      description: formData.description,
      criteria: {
        interests: formData.interests.split(',').map(s => s.trim()),
        behavior: formData.behavior.split(',').map(s => s.trim()),
      },
      size_estimate: formData.size_estimate ? parseInt(formData.size_estimate) : null,
    })

    router.push('/personalization')
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create Audience Segment</h1>
        <p className="text-muted-foreground">Define a specific audience segment</p>
      </div>

      <form onSubmit={handleCreate} className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Segment Name *</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Technical Audience, Beginners"
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description *</label>
          <textarea
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe this segment..."
            rows={3}
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Interests (comma-separated)</label>
          <input
            type="text"
            value={formData.interests}
            onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
            placeholder="AI, Marketing, Technology"
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Behavior (comma-separated)</label>
          <input
            type="text"
            value={formData.behavior}
            onChange={(e) => setFormData({ ...formData, behavior: e.target.value })}
            placeholder="High engagement, Clicks links, Forwards emails"
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Estimated Size (optional)</label>
          <input
            type="number"
            value={formData.size_estimate}
            onChange={(e) => setFormData({ ...formData, size_estimate: e.target.value })}
            placeholder="1000"
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700"
          />
        </div>

        <button
          type="submit"
          disabled={creating}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white py-3 px-6 rounded-md font-medium transition-colors"
        >
          {creating ? 'Creating...' : 'Create Segment'}
        </button>
      </form>
    </div>
  )
}
