'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function SettingsPage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    company: '',
    newsletter_niche: '',
    target_audience: '',
    default_tone: 'professional',
    default_length: 'medium',
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { data } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (data) {
        setProfile(data)
        setFormData({
          full_name: data.full_name || '',
          company: data.company || '',
          newsletter_niche: data.newsletter_niche || '',
          target_audience: data.target_audience || '',
          default_tone: data.default_tone || 'professional',
          default_length: data.default_length || 'medium',
        })
      }
    }
    setLoading(false)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          full_name: formData.full_name,
          company: formData.company,
          newsletter_niche: formData.newsletter_niche,
          target_audience: formData.target_audience,
          default_tone: formData.default_tone,
          default_length: formData.default_length,
        })
        .eq('id', user.id)

      if (error) {
        toast.error('Failed to save settings')
      } else {
        toast.success('Settings saved successfully!')
      }
    }

    setSaving(false)
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Settings */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Profile</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Company</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={profile?.email}
                  disabled
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-slate-100 dark:bg-slate-700/50"
                />
                <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-md font-medium transition-colors"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>

          {/* Newsletter Preferences */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Newsletter Preferences</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Newsletter Niche</label>
                <input
                  type="text"
                  value={formData.newsletter_niche}
                  onChange={(e) =>
                    setFormData({ ...formData, newsletter_niche: e.target.value })
                  }
                  placeholder="e.g., AI & Technology, Marketing, Finance"
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Target Audience</label>
                <textarea
                  value={formData.target_audience}
                  onChange={(e) =>
                    setFormData({ ...formData, target_audience: e.target.value })
                  }
                  placeholder="Describe your target audience..."
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Default Tone</label>
                <select
                  value={formData.default_tone}
                  onChange={(e) => setFormData({ ...formData, default_tone: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700"
                >
                  <option value="professional">Professional</option>
                  <option value="casual">Casual</option>
                  <option value="friendly">Friendly</option>
                  <option value="authoritative">Authoritative</option>
                  <option value="educational">Educational</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Default Length</label>
                <select
                  value={formData.default_length}
                  onChange={(e) => setFormData({ ...formData, default_length: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700"
                >
                  <option value="short">Short (300-500 words)</option>
                  <option value="medium">Medium (500-800 words)</option>
                  <option value="long">Long (800-1200 words)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-md font-medium transition-colors"
              >
                {saving ? 'Saving...' : 'Save Preferences'}
              </button>
            </form>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Plan Info */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <h3 className="font-semibold mb-4">Current Plan</h3>
            <div className="text-2xl font-bold capitalize mb-2">{profile?.plan_tier}</div>
            <div className="text-sm text-muted-foreground mb-4">
              {profile?.usage_count}/{profile?.usage_limit} newsletters this month
            </div>
            <div className="space-y-2">
              {profile?.plan_tier === 'free' ? (
                <Link
                  href="/pricing"
                  className="block w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-md font-medium transition-colors text-center"
                >
                  Upgrade Plan
                </Link>
              ) : (
                <Link
                  href="/settings/billing"
                  className="block w-full px-4 py-2 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md font-medium transition-colors text-center"
                >
                  Manage Billing
                </Link>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <h3 className="font-semibold mb-4">Account</h3>
            <div className="space-y-2">
              <Link
                href="/settings/billing"
                className="block px-4 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-sm"
              >
                💳 Billing & Invoices
              </Link>
              <Link
                href="/pricing"
                className="block px-4 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-sm"
              >
                📊 View Plans
              </Link>
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to sign out?')) {
                    const supabase = createClient()
                    supabase.auth.signOut().then(() => {
                      window.location.href = '/login'
                    })
                  }
                }}
                className="block w-full text-left px-4 py-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm text-red-600"
              >
                🚪 Sign Out
              </button>
            </div>
          </div>

          {/* Usage Stats */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <h3 className="font-semibold mb-4">This Month</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Newsletters</span>
                <span className="font-semibold">{profile?.usage_count || 0}</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{
                    width: `${Math.min(((profile?.usage_count || 0) / (profile?.usage_limit || 1)) * 100, 100)}%`,
                  }}
                ></div>
              </div>
              <div className="text-xs text-muted-foreground text-center">
                {(profile?.usage_limit || 0) - (profile?.usage_count || 0)} remaining
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
