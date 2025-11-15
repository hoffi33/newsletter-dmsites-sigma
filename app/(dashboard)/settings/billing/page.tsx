'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PLANS } from '@/lib/stripe/config'

export default function BillingPage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [portalLoading, setPortalLoading] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      const { data } = await supabase.from('user_profiles').select('*').eq('id', user.id).single()

      if (data) setProfile(data)
    }
    setLoading(false)
  }

  const handleManageBilling = async () => {
    setPortalLoading(true)
    try {
      const res = await fetch('/api/billing/portal', {
        method: 'POST',
      })
      const data = await res.json()

      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Portal error:', error)
      setPortalLoading(false)
    }
  }

  const handleUpgrade = () => {
    window.location.href = '/pricing'
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

  const currentPlan = PLANS[profile?.plan_tier?.toUpperCase() as keyof typeof PLANS] || PLANS.FREE

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Billing & Subscription</h1>
        <p className="text-muted-foreground">Manage your subscription and billing</p>
      </div>

      <div className="space-y-6">
        {/* Current Plan */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Current Plan</h2>

          <div className="flex items-start justify-between">
            <div>
              <div className="text-2xl font-bold capitalize mb-2">{profile?.plan_tier}</div>
              <div className="text-3xl font-bold mb-4">
                ${currentPlan.price}
                <span className="text-lg text-muted-foreground">/month</span>
              </div>

              <div className="space-y-2 mb-6">
                {currentPlan.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              {profile?.subscription_status && (
                <div className="mb-4">
                  <span className="text-sm text-muted-foreground">Status: </span>
                  <span
                    className={`text-sm font-semibold capitalize ${
                      profile.subscription_status === 'active'
                        ? 'text-green-600'
                        : profile.subscription_status === 'canceled'
                        ? 'text-red-600'
                        : 'text-yellow-600'
                    }`}
                  >
                    {profile.subscription_status}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            {profile?.plan_tier !== 'free' && profile?.stripe_customer_id && (
              <button
                onClick={handleManageBilling}
                disabled={portalLoading}
                className="px-6 py-2 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md font-medium transition-colors"
              >
                {portalLoading ? 'Loading...' : 'Manage Subscription'}
              </button>
            )}

            {profile?.plan_tier === 'free' && (
              <button
                onClick={handleUpgrade}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors"
              >
                Upgrade Plan
              </button>
            )}

            {profile?.plan_tier === 'basic' && (
              <button
                onClick={handleUpgrade}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-md font-medium transition-colors"
              >
                Upgrade to Pro
              </button>
            )}
          </div>
        </div>

        {/* Usage */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Usage This Month</h2>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Newsletters Created</span>
                <span className="text-sm text-muted-foreground">
                  {profile?.usage_count || 0}
                  {profile?.usage_limit !== -1 && ` / ${profile?.usage_limit}`}
                  {profile?.usage_limit === -1 && ' / Unlimited'}
                </span>
              </div>
              {profile?.usage_limit !== -1 && (
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all"
                    style={{
                      width: `${Math.min((profile?.usage_count / profile?.usage_limit) * 100, 100)}%`,
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Payment Method */}
        {profile?.stripe_customer_id && (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Manage your payment methods through the Stripe billing portal.
            </p>
            <button
              onClick={handleManageBilling}
              disabled={portalLoading}
              className="px-6 py-2 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md font-medium transition-colors"
            >
              Manage Payment Methods
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
