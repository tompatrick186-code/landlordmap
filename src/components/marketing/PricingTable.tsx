'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

const PLANS = [
  {
    name: 'Starter',
    price: 0,
    period: '',
    description: 'Perfect for new landlords with a small portfolio.',
    badge: null,
    cta: 'Get started free',
    ctaHref: '/signup',
    highlight: false,
    features: [
      'Up to 3 properties',
      'Tenant management',
      'Maintenance tracker',
      'Document storage (500MB)',
      'Basic financial log',
      'Email support',
    ],
    missing: ['AI assistant', 'Interactive map', 'Tenant portal', 'Financial reports'],
  },
  {
    name: 'Pro',
    price: 19,
    period: '/month',
    description: 'For growing landlords who want the full toolkit.',
    badge: 'Most popular',
    cta: 'Start Pro trial',
    ctaHref: '/signup?plan=pro',
    highlight: true,
    features: [
      'Up to 25 properties',
      'AI assistant (Claude-powered)',
      'Interactive Mapbox map',
      'Tenant portal access',
      'Financial reports & export',
      'Document storage (10GB)',
      'Smart reminders by email',
      'Priority support',
    ],
    missing: [],
  },
  {
    name: 'Agency',
    price: 49,
    period: '/month',
    description: 'For letting agents and large portfolio landlords.',
    badge: null,
    cta: 'Talk to us',
    ctaHref: '/signup?plan=agency',
    highlight: false,
    features: [
      'Unlimited properties',
      'Everything in Pro',
      'Multi-user team access',
      'Role-based permissions',
      'White-label tenant portal',
      'API access',
      'Document storage (100GB)',
      'Phone & email support',
      'Custom onboarding session',
    ],
    missing: [],
  },
]

export function PricingTable() {
  const [annual, setAnnual] = useState(false)

  return (
    <section className="py-24 bg-slate-50 dark:bg-slate-900" id="pricing">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Simple, honest pricing
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            No hidden fees. Cancel any time.
          </p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-3 bg-white dark:bg-slate-800 rounded-full p-1 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setAnnual(false)}
              className={cn(
                'px-4 py-1.5 rounded-full text-sm font-medium transition-all',
                !annual ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'text-slate-500'
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={cn(
                'px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5',
                annual ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'text-slate-500'
              )}
            >
              Annual
              <span className="text-xs font-bold text-emerald-500">−20%</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {PLANS.map((plan) => {
            const displayPrice = annual && plan.price > 0 ? Math.round(plan.price * 0.8) : plan.price

            return (
              <div
                key={plan.name}
                className={cn(
                  'relative rounded-2xl border p-8 flex flex-col',
                  plan.highlight
                    ? 'border-emerald-500 bg-white dark:bg-slate-900 shadow-xl shadow-emerald-500/10'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'
                )}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <div className="flex items-center gap-1.5 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      <Zap className="h-3 w-3" />
                      {plan.badge}
                    </div>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{plan.description}</p>
                </div>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-slate-900 dark:text-white">
                    {plan.price === 0 ? 'Free' : `£${displayPrice}`}
                  </span>
                  {plan.period && (
                    <span className="text-slate-500 dark:text-slate-400 text-sm">{plan.period}</span>
                  )}
                  {annual && plan.price > 0 && (
                    <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                      Billed £{displayPrice * 12}/year
                    </div>
                  )}
                </div>

                <Link href={plan.ctaHref} className="mb-8">
                  <Button
                    className="w-full"
                    variant={plan.highlight ? 'default' : 'outline'}
                    size="md"
                  >
                    {plan.cta}
                  </Button>
                </Link>

                <ul className="space-y-3 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-700 dark:text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>

        <p className="text-center text-sm text-slate-400 mt-8">
          All plans include a 14-day free trial. No credit card required to start.
        </p>
      </div>
    </section>
  )
}
