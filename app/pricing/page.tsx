'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PLANS } from '@/lib/stripe/config'
import Link from 'next/link'

export default function PricingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const handleSelectPlan = async (plan: 'basic' | 'pro') => {
    setLoading(plan)

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })

      const data = await res.json()

      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Checkout error:', error)
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <Link href="/" className="text-2xl font-bold mb-6 inline-block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            NewsletterAI
          </Link>
          <h1 className="text-5xl font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-muted-foreground">
            Choose the plan that fits your newsletter goals
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Free Plan */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 border-2 border-slate-200 dark:border-slate-700">
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2">{PLANS.FREE.name}</h3>
              <div className="mb-4">
                <span className="text-5xl font-bold">${PLANS.FREE.price}</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <Link
                href="/register"
                className="block w-full text-center px-6 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-lg font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                Get Started
              </Link>
            </div>
            <ul className="space-y-3">
              {PLANS.FREE.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Basic Plan */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border-2 border-blue-500 relative transform scale-105">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
              POPULAR
            </div>
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2">{PLANS.BASIC.name}</h3>
              <div className="mb-4">
                <span className="text-5xl font-bold">${PLANS.BASIC.price}</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <button
                onClick={() => handleSelectPlan('basic')}
                disabled={loading === 'basic'}
                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-semibold transition-colors"
              >
                {loading === 'basic' ? 'Loading...' : 'Get Started'}
              </button>
            </div>
            <ul className="space-y-3">
              {PLANS.BASIC.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pro Plan */}
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-lg p-8 text-white">
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2">{PLANS.PRO.name}</h3>
              <div className="mb-4">
                <span className="text-5xl font-bold">${PLANS.PRO.price}</span>
                <span className="opacity-90">/month</span>
              </div>
              <button
                onClick={() => handleSelectPlan('pro')}
                disabled={loading === 'pro'}
                className="w-full px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 disabled:bg-gray-200 transition-colors"
              >
                {loading === 'pro' ? 'Loading...' : 'Get Started'}
              </button>
            </div>
            <ul className="space-y-3">
              {PLANS.PRO.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-white mt-1">✓</span>
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            All plans include email support. Cancel anytime.
          </p>
          <Link href="/login" className="text-blue-600 hover:underline">
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
