'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AnalyticsInputPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    newsletter_title: '',
    sent_count: '',
    delivered_count: '',
    open_count: '',
    click_count: '',
    unsubscribe_count: '',
    bounce_count: '',
    esp_name: '',
    sent_at: '',
  })

  const calculateRate = (count: number, total: number) => {
    if (!total || total === 0) return 0
    return ((count / total) * 100).toFixed(2)
  }

  const openRate = calculateRate(parseInt(formData.open_count) || 0, parseInt(formData.delivered_count) || 0)
  const clickRate = calculateRate(parseInt(formData.click_count) || 0, parseInt(formData.delivered_count) || 0)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    await supabase.from('newsletter_analytics').insert({
      user_id: user.id,
      sent_count: parseInt(formData.sent_count),
      delivered_count: parseInt(formData.delivered_count),
      open_count: parseInt(formData.open_count),
      click_count: parseInt(formData.click_count),
      unsubscribe_count: parseInt(formData.unsubscribe_count) || 0,
      bounce_count: parseInt(formData.bounce_count) || 0,
      open_rate: parseFloat(String(openRate)),
      click_rate: parseFloat(String(clickRate)),
      esp_name: formData.esp_name,
      sent_at: formData.sent_at,
      metadata: { title: formData.newsletter_title },
    })

    router.push('/analytics')
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Add Newsletter Stats</h1>
        <p className="text-muted-foreground">Input your newsletter performance data</p>
      </div>

      <form onSubmit={handleSave} className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Newsletter Title *</label>
          <input
            type="text"
            required
            value={formData.newsletter_title}
            onChange={(e) => setFormData({ ...formData, newsletter_title: e.target.value })}
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Sent Count *</label>
            <input
              type="number"
              required
              value={formData.sent_count}
              onChange={(e) => setFormData({ ...formData, sent_count: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Delivered Count *</label>
            <input
              type="number"
              required
              value={formData.delivered_count}
              onChange={(e) => setFormData({ ...formData, delivered_count: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Opens *</label>
            <input
              type="number"
              required
              value={formData.open_count}
              onChange={(e) => setFormData({ ...formData, open_count: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Clicks *</label>
            <input
              type="number"
              required
              value={formData.click_count}
              onChange={(e) => setFormData({ ...formData, click_count: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Unsubscribes</label>
            <input
              type="number"
              value={formData.unsubscribe_count}
              onChange={(e) => setFormData({ ...formData, unsubscribe_count: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Bounces</label>
            <input
              type="number"
              value={formData.bounce_count}
              onChange={(e) => setFormData({ ...formData, bounce_count: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">ESP Name</label>
            <input
              type="text"
              value={formData.esp_name}
              onChange={(e) => setFormData({ ...formData, esp_name: e.target.value })}
              placeholder="e.g., Mailchimp, Beehiiv"
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Sent Date *</label>
            <input
              type="date"
              required
              value={formData.sent_at}
              onChange={(e) => setFormData({ ...formData, sent_at: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700"
            />
          </div>
        </div>

        {/* Calculated Rates */}
        {formData.delivered_count && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-sm text-muted-foreground">Open Rate</div>
                <div className="text-2xl font-bold text-blue-600">{openRate}%</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Click Rate</div>
                <div className="text-2xl font-bold text-green-600">{clickRate}%</div>
              </div>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-3 px-6 rounded-md font-medium transition-colors"
        >
          {saving ? 'Saving...' : 'Save Stats'}
        </button>
      </form>
    </div>
  )
}
